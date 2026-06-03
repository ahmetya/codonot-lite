// src/services/ApiService.ts
class ApiService {
  private baseUrl = "http://localhost:3001/api";

  private getHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async register(email: string, password: string, name: string) {
    const res = await fetch(`${this.baseUrl}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    localStorage.setItem("token", data.token); // store token
    return data;
  }

  async login(email: string, password: string) {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    localStorage.setItem("token", data.token);
    return data;
  }

  logout() {
    localStorage.removeItem("token");
  }
}

export const apiService = new ApiService();
