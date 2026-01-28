import express from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, resetUserPassword, toggleUserActive } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getAllUsers);
router.get('/:id', authenticate, authorize('admin'), getUserById);
router.post('/', authenticate, authorize('admin'), createUser);
router.put('/:id', authenticate, authorize('admin'), updateUser);
router.patch('/:id/toggle-active', authenticate, authorize('admin'), toggleUserActive);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);
router.post('/:id/reset-password', authenticate, authorize('admin'), resetUserPassword);

export default router;
