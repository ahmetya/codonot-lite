import { Request, Response } from 'express';
import { helperBotService } from "@services/helper-bot/HelperBotService"


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
}

export const helperBotController = new HelperBotController();
