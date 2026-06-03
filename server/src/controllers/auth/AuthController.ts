// src/controllers/AuthController.ts
import { Request, Response } from "express";
import { authService } from "@services/auth-service/AuthService";
import { AuthRequest } from "@app-types/index";

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }

  async me(req: Request, res: Response) {
    const authReq = req as AuthRequest; // cast here instead

    try {
      res.json({ user: authReq.user });
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }
}

export const authController = new AuthController();
