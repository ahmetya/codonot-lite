import { Request, Response } from 'express';
import { genericService } from '@services/generic/GenericService';

export class GenericController {
  async getAll(req: Request, res: Response) {
    try {
      const posts = await genericService.getAll();
      res.json(posts);
    } catch (err) {
      console.error('getAll error:', err); // add this for debugging
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { title, body } = req.body;
      if (!title || !body) {
        return res.status(400).json({ error: 'Title and body are required' });
      }
      const post = await genericService.create(title, body);
      res.status(201).json(post);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create post' });
    }
  }
}

export const genericController = new GenericController();
