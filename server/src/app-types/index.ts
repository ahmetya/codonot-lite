import { Request } from 'express';

// src/types/index.ts
export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

// extend Express Request to carry user
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}
