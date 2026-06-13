// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import {
  AUTH_CLIENT_MESSAGES,
  AUTH_ENDPOINTS,
  AUTH_REQUEST_HEADERS,
  AUTH_STORAGE_KEYS,
} from "./AuthContext.consts";

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface RegistrationResponse {
  message: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<RegistrationResponse>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const saveSession = (data: AuthResponse) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(AUTH_STORAGE_KEYS.token, data.token);
    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(data.user));
  };

  // restore session on page refresh
  useEffect(() => {
    const savedToken = localStorage.getItem(AUTH_STORAGE_KEYS.token);
    const savedUser = localStorage.getItem(AUTH_STORAGE_KEYS.user);
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch(AUTH_ENDPOINTS.register, {
      method: "POST",
      headers: AUTH_REQUEST_HEADERS,
      body: JSON.stringify({ name, email, password }),
    });
    const data = (await res.json()) as RegistrationResponse & {
      error?: string;
    };

    if (!res.ok) {
      throw new Error(
        data.error || AUTH_CLIENT_MESSAGES.registrationFailed
      );
    }

    return data;
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(AUTH_ENDPOINTS.login, {
      method: "POST",
      headers: AUTH_REQUEST_HEADERS,
      body: JSON.stringify({ email, password }),
    });

    const data = (await res.json()) as AuthResponse & { error?: string };
    if (!res.ok) {
      throw new Error(data.error || AUTH_CLIENT_MESSAGES.invalidCredentials);
    }
    saveSession(data);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_STORAGE_KEYS.token);
    localStorage.removeItem(AUTH_STORAGE_KEYS.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        register,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// custom hook to consume context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error(AUTH_CLIENT_MESSAGES.missingProvider);
  return context;
}
