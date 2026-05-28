// src/routes/posts.ts
import { Router } from 'express';
import { helperBotController } from '@controllers/helper-bot/HelperBotController';

const router = Router();

router.post('/', helperBotController.talkBot);

export default router;
