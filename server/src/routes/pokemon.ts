// src/routes/posts.ts
import { Router } from 'express';
import { pokemonController } from '@controllers/pokemon/PokemonController';

const router = Router();

router.get('/', pokemonController.getAll);
router.post('/', pokemonController.create);
router.get('/random', pokemonController.getRandom);
router.get('/:id', pokemonController.getById);

export default router;
