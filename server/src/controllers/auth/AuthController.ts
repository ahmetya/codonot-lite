// src/controllers/AuthController.ts
import { Request, Response } from "express";
import {
  AuthError,
  authService,
} from "@services/auth-service/AuthService";
import { AuthRequest } from "@app-types/index";

function sendError(res: Response, error: unknown, fallbackStatus: number) {
  const status = error instanceof AuthError ? error.status : fallbackStatus;
  const message =
    error instanceof Error ? error.message : "Authentication request failed";
  res.status(status).json({ error: message });
}

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      sendError(res, error, 400);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (error) {
      sendError(res, error, 401);
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const token = String(req.body.token ?? "");
      if (!token) throw new AuthError("Verification token is required", 400);
      res.json(await authService.verifyEmail(token));
    } catch (error) {
      sendError(res, error, 400);
    }
  }

  async resendVerification(req: Request, res: Response) {
    try {
      const email = String(req.body.email ?? "");
      if (!email) throw new AuthError("Email is required", 400);
      res.json(await authService.resendVerification(email));
    } catch (error) {
      sendError(res, error, 400);
    }
  }

  async me(req: Request, res: Response) {
    const authReq = req as AuthRequest; // cast here instead

    try {
      res.json({ user: authReq.user });
    } catch (error) {
      sendError(res, error, 401);
    }
  }
}

export const authController = new AuthController();
