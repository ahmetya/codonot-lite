import { createHash, randomBytes } from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "@config/db";
import type {
  RegisterDto,
  LoginDto,
  AuthResponse,
  RegistrationResponse,
} from "@app-types/index";
import { emailService } from "@services/email-service/EmailService";

const VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000;

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

class AuthService {
  private jwtSecret = process.env.JWT_SECRET!;
  private saltRounds = 12;

  async register(data: RegisterDto): Promise<RegistrationResponse> {
    const email = data.email.trim().toLowerCase();
    const name = data.name.trim();

    if (!email || !name || data.password.length < 6) {
      throw new AuthError("Name, email, and a valid password are required", 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AuthError("Email already in use", 409);

    const passwordHash = await bcrypt.hash(data.password, this.saltRounds);
    const rawToken = this.createRawVerificationToken();
    const tokenHash = this.hashVerificationToken(rawToken);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        emailVerificationTokens: {
          create: {
            tokenHash,
            expiresAt: new Date(Date.now() + VERIFICATION_EXPIRY_MS),
          },
        },
      },
    });

    try {
      await emailService.sendVerificationEmail({
        email: user.email,
        name: user.name,
        token: rawToken,
      });
    } catch (error) {
      await prisma.user.delete({ where: { id: user.id } });
      throw error;
    }

    return {
      message: "Check your email to verify your account.",
      email: user.email,
    };
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const email = data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new AuthError("Invalid credentials", 401);

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) throw new AuthError("Invalid credentials", 401);
    if (!user.emailVerifiedAt) {
      throw new AuthError("Verify your email before logging in", 403);
    }

    const token = this.generateToken(user.id, user.email);

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  async verifyEmail(rawToken: string) {
    const tokenHash = this.hashVerificationToken(rawToken);
    const verificationToken =
      await prisma.emailVerificationToken.findUnique({
        where: { tokenHash },
      });

    if (!verificationToken || verificationToken.expiresAt <= new Date()) {
      if (verificationToken) {
        await prisma.emailVerificationToken.delete({
          where: { id: verificationToken.id },
        });
      }
      throw new AuthError("Verification link is invalid or expired", 400);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      prisma.emailVerificationToken.deleteMany({
        where: { userId: verificationToken.userId },
      }),
    ]);

    return { message: "Email verified. You can now log in." };
  }

  async resendVerification(emailInput: string) {
    const email = emailInput.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    const genericResponse = {
      message:
        "If an unverified account exists for that email, a new link has been sent.",
    };

    if (!user || user.emailVerifiedAt) return genericResponse;

    const recentToken = await prisma.emailVerificationToken.findFirst({
      where: {
        userId: user.id,
        createdAt: { gt: new Date(Date.now() - 60_000) },
      },
    });
    if (recentToken) return genericResponse;

    const rawToken = this.createRawVerificationToken();
    const tokenHash = this.hashVerificationToken(rawToken);

    await prisma.$transaction([
      prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } }),
      prisma.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + VERIFICATION_EXPIRY_MS),
        },
      }),
    ]);

    await emailService.sendVerificationEmail({
      email: user.email,
      name: user.name,
      token: rawToken,
    });

    return genericResponse;
  }

  private createRawVerificationToken() {
    return randomBytes(32).toString("hex");
  }

  private hashVerificationToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
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
