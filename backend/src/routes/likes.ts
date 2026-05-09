import { Router } from 'express';
import { toggleLike, getLikes } from '../controllers/likeController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/:id/like', authMiddleware, toggleLike);
router.get('/:id/likes', authMiddleware, getLikes);

export default router;
