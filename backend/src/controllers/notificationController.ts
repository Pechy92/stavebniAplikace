import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getUserNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { unreadOnly } = req.query;

    let query = `
      SELECT * FROM notifications 
      WHERE user_id = ?
    `;
    const params: any[] = [userId];

    if (unreadOnly === 'true') {
      query += ' AND is_read = FALSE';
    }

    query += ' ORDER BY created_at DESC LIMIT 50';

    const [notifications] = await pool.query(query, params);
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Chyba při načítání notifikací' });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    const count = (result as any[])[0]?.count || 0;
    res.json({ unreadCount: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Chyba při načítání počtu notifikací' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    await pool.query(
      'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({ message: 'Notifikace označena jako přečtená' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Chyba při označování notifikace' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    await pool.query(
      'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    res.json({ message: 'Všechny notifikace označeny jako přečtené' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Chyba při označování notifikací' });
  }
};
