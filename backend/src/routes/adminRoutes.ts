import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pool from '../config/database';

const router = Router();

// DOČASNÝ ENDPOINT - pouze pro aktualizaci emailů pro testování
router.post('/update-test-emails', async (req: AuthRequest, res: Response) => {
  try {
    // Aktualizovat všechny emaily
    await pool.query("UPDATE users SET email = CONCAT('pecholtmartin+user', id, '@gmail.com')");
    
    // Získat aktualizované uživatele
    const [users] = await pool.query('SELECT id, first_name, last_name, email, role FROM users ORDER BY id');
    
    res.json({ 
      success: true, 
      message: 'Všechny emaily byly aktualizovány na pecholtmartin+userX@gmail.com',
      users 
    });
  } catch (error) {
    console.error('Chyba při aktualizaci emailů:', error);
    res.status(500).json({ error: 'Chyba při aktualizaci emailů' });
  }
});

export default router;
