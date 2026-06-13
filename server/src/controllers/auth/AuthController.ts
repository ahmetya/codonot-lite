// src/controllers/AuthController.ts
import { Request, Response } from "express";
import {
  AuthError,
  authService,
} from "@services/auth-service/AuthService";
import { AuthRequest } from "@app-types/index";
import {
  AUTH_CONTROLLER_MESSAGES,
  AUTH_CONTROLLER_STATUS,
} from "./AuthController.consts";

function sendError(res: Response, error: unknown, fallbackStatus: number) {
  const status = error instanceof AuthError ? error.status : fallbackStatus;
  const message =
    error instanceof Error
      ? error.message
      : AUTH_CONTROLLER_MESSAGES.requestFailed;
  res.status(status).json({ error: message });
}

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      res.status(AUTH_CONTROLLER_STATUS.created).json(result);
    } catch (error) {
      sendError(res, error, AUTH_CONTROLLER_STATUS.badRequest);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (error) {
      sendError(res, error, AUTH_CONTROLLER_STATUS.unauthorized);
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const token = String(req.body.token ?? "");
      if (!token) {
        throw new AuthError(
          AUTH_CONTROLLER_MESSAGES.verificationTokenRequired,
          AUTH_CONTROLLER_STATUS.badRequest
        );
      }
      res.json(await authService.verifyEmail(token));
    } catch (error) {
      sendError(res, error, AUTH_CONTROLLER_STATUS.badRequest);
    }
  }

  async resendVerification(req: Request, res: Response) {
    try {
      const email = String(req.body.email ?? "");
      if (!email) {
        throw new AuthError(
          AUTH_CONTROLLER_MESSAGES.emailRequired,
          AUTH_CONTROLLER_STATUS.badRequest
        );
      }
      res.json(await authService.resendVerification(email));
    } catch (error) {
      sendError(res, error, AUTH_CONTROLLER_STATUS.badRequest);
    }
  }

  async me(req: Request, res: Response) {
    const authReq = req as AuthRequest;

    try {
      res.json({ user: authReq.user });
    } catch (error) {
      sendError(res, error, AUTH_CONTROLLER_STATUS.unauthorized);
    }
  }
}

export const authController = new AuthController();
