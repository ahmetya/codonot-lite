import {Router } from "express";
import { generateImageController } from "@controllers/generateImage/GenerateImageController";

const router = Router();

router.post("/rpgPortrait", generateImageController.generateRPGPortrait);

export default router;