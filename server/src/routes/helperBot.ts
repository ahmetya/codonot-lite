// src/routes/posts.ts
import { Router } from 'express';
import { helperBotController } from '@controllers/helper-bot/HelperBotController';

const router = Router();

router.post('/', helperBotController.talkBot);
router.post('/portrait', helperBotController.characterPortrait);
router.post('/portrait/google', helperBotController.googleCharacterPortrait);
router.post('/stream', helperBotController.streamBot);
router.post('/stream-sdk', helperBotController.streamBotSDK);
router.post('/nim', helperBotController.nimClient);

export default router;
