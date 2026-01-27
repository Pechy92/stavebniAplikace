import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pool from '../config/database';
import { sendEmail } from '../services/emailService';

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

// TEST ENDPOINT - pro testování emailového systému
router.post('/test-email', async (req: AuthRequest, res: Response) => {
  try {
    const { to } = req.body;
    const testEmail = to || 'pecholtmartin@gmail.com';
    
    console.log('📧 Testuji odeslání emailu na:', testEmail);
    
    await sendEmail({
      to: testEmail,
      subject: 'Test email ze stavební aplikace',
      html: '<h1>Test úspěšný!</h1><p>Pokud vidíš tento email, emailový systém funguje správně.</p>',
      notificationType: 'test',
      relatedEntityType: 'test',
      relatedEntityId: 0
    });
    
    res.json({ 
      success: true, 
      message: `Test email odeslán na ${testEmail}. Zkontroluj schránku (i spam).`,
      sentTo: testEmail
    });
  } catch (error: any) {
    console.error('❌ Chyba při testu emailu:', error);
    res.status(500).json({ 
      error: 'Chyba při odesílání test emailu',
      details: error.message 
    });
  }
});

export default router;
