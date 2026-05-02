import { Request, Response } from 'express';
import { pokemonService } from '@services/pokemon/PokemonService';

export class PokemonController {
  async getAll(req: Request, res: Response) {
    try {
      const posts = await pokemonService.getAll();
      res.json(posts);
    } catch (err) {
      console.error('getAll error:', err); // add this for debugging
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { pokeId, name } = req.body;
      if (!pokeId || !name) {
        return res.status(400).json({ error: 'pokeId and name are required' });
      }
      const post = await pokemonService.create(pokeId, name);
      res.status(201).json(post);
    } catch (err) {
      console.error('create error:', err); // add this for debugging
      res.status(500).json({ error: 'Failed to create post' });
    }
  }

  async getRandom(req: Request, res: Response) {
    res
      .status(200)
      .json({ message: 'Random Pokemon endpoint - to be implemented' });
  }
}

export const pokemonController = new PokemonController();
