import express from 'express';
import { authenticate } from '../middleware/auth';
import { getUserNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../controllers/notificationController';

const router = express.Router();

router.get('/', authenticate, getUserNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.put('/:id/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);

export default router;
