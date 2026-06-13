import { Router } from "express";
import { authController } from "@controllers/auth/AuthController";
import { requireAuth } from "@middleware/auth";
import { AUTH_ROUTES } from "./auth.consts";

const router = Router();

router.post(AUTH_ROUTES.register, authController.register);
router.post(AUTH_ROUTES.login, authController.login);
router.post(AUTH_ROUTES.verifyEmail, authController.verifyEmail);
router.post(
  AUTH_ROUTES.resendVerification,
  authController.resendVerification
);
router.get(AUTH_ROUTES.me, requireAuth, authController.me);

export default router;
