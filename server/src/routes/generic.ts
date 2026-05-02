// src/routes/posts.ts
import { Router } from 'express';
import { genericController } from '@controllers/generic/GenericController';

const router = Router();

router.get('/', genericController.getAll);
router.post('/', genericController.create);

export default router;
