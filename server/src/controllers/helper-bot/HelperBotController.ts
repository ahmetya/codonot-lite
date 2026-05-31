import { Request, Response } from 'express';
import { helperBotService } from '@services/helper-bot/HelperBotService';

export class HelperBotController {
  async talkBot(req: Request, res: Response) {
    const { prompt } = req.body;

    try {
      const posts = await helperBotService.askGemma(prompt);
      res.json(posts);
    } catch (err) {
      console.error('getAll error:', err); // add this for debugging
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  }

  async streamBot(req: Request, res: Response) {
    const { prompt } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      await helperBotService.streamGemmaToClient(prompt, res);
      // End the response stream cleanly once Google is finished
      res.end();
    } catch (error: any) {
      console.error('Streaming Error:', error);
      // If headers haven't sent yet, we can send a proper status code
      if (!res.headersSent) {
        res
          .status(500)
          .json({ error: error.message || 'Internal streaming crash.' });
      } else {
        // Otherwise write an error frame inside the stream and end it
        res.write(`data: {"error": "Stream interrupted mid-generation"}\n\n`);
        res.end();
      }
    }
  }

  async streamBotSDK(req: Request, res: Response) {
    const { prompt } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // ← tells Nginx not to buffer
    res.flushHeaders(); // ← send headers immediately

    try {
      await helperBotService.streamBotSDK(prompt, res);
      // End the response stream cleanly once Google is finished
      res.end();
    } catch (error: any) {
      console.error('Streaming Error:', error);
      // If headers haven't sent yet, we can send a proper status code
      if (!res.headersSent) {
        res
          .status(500)
          .json({ error: error.message || 'Internal streaming crash.' });
      } else {
        // Otherwise write an error frame inside the stream and end it
        res.write(`data: {"error": "Stream interrupted mid-generation"}\n\n`);
        res.end();
      }
    }
  }



}

export const helperBotController = new HelperBotController();
