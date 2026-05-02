// src/routes/posts.ts
import { Router } from "express";
import { postController } from "@controllers/PostController";

const router = Router();

router.get("/", postController.getAll);
router.post("/", postController.create);

export default router;
