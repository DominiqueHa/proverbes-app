import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import {
  getUsers,
  deleteUser,
  adminDeleteComment,
  getAllComments,
  updateUserRole
} from '../controllers/adminController';

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/role', updateUserRole);
router.get('/comments', getAllComments);
router.delete('/comments/:id', adminDeleteComment);

export default router;
