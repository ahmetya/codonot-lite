export const AUTH_ENDPOINTS = {
  register: "/api/auth/register",
  login: "/api/auth/login",
} as const;

export const AUTH_STORAGE_KEYS = {
  token: "token",
  user: "user",
} as const;

export const AUTH_REQUEST_HEADERS = {
  "Content-Type": "application/json",
} as const;

export const AUTH_CLIENT_MESSAGES = {
  registrationFailed: "Registration failed",
  invalidCredentials: "Invalid credentials",
  missingProvider: "useAuth must be used inside AuthProvider",
} as const;
