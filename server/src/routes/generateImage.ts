import {Router } from "express";
import { generateImageController } from "@controllers/generate-image/GenerateImageController";

const router = Router();

router.post("/rpgPortrait", generateImageController.generateRPGPortrait);

export default router;