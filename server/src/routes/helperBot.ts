// src/routes/posts.ts
import { Router } from 'express';
import { helperBotController } from '@controllers/helper-bot/HelperBotController';

const router = Router();

router.post('/', helperBotController.talkBot);
router.post('/stream', helperBotController.streamBot);
router.post('/stream-sdk', helperBotController.streamBotSDK);

export default router;
