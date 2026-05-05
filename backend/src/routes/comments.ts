import { Router } from 'express';
import { getComments, createComment, deleteComment } from '../controllers/commentController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getComments);
router.post('/', authMiddleware, createComment);
router.delete('/:id', authMiddleware, deleteComment);

export default router;
