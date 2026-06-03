// src/services/AuthService.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "@config/db";
import type { RegisterDto, LoginDto, AuthResponse } from "@app-types/index";

class AuthService {
  private jwtSecret = process.env.JWT_SECRET!;
  private saltRounds = 12;

  async register(data: RegisterDto): Promise<AuthResponse> {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new Error("Email already in use");

    const passwordHash = await bcrypt.hash(data.password, this.saltRounds);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
      },
    });

    const token = this.generateToken(user.id, user.email);

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // same error for wrong email or wrong password — don't leak which one
    if (!user) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) throw new Error("Invalid credentials");

    const token = this.generateToken(user.id, user.email);

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  private generateToken(userId: number, email: string): string {
    return jwt.sign({ userId, email }, this.jwtSecret, { expiresIn: "7d" });
  }

  verifyToken(token: string) {
    return jwt.verify(token, this.jwtSecret) as {
      userId: number;
      email: string;
    };
  }
}

export const authService = new AuthService();
