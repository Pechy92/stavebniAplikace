import { Router, Request, Response } from 'express';
import { initDatabase } from '../config/initDatabase';

const router = Router();

router.get('/init', async (req: Request, res: Response) => {
  try {
    console.log('🔧 Initializing database...');
    await initDatabase();
    res.json({ 
      success: true, 
      message: 'Database initialized successfully with tables and seed data' 
    });
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database initialization failed', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;
