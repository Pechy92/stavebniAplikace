import { Router, Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

router.get('/migrate', async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    console.log('🔄 Starting database migration...');
    
    // Check if custom_id column exists
    const [columns]: any = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'extra_work' 
       AND COLUMN_NAME = 'custom_id'`
    );
    
    if (columns.length === 0) {
      console.log('➕ Adding custom_id column to extra_work table...');
      await connection.query(`
        ALTER TABLE extra_work 
        ADD COLUMN custom_id VARCHAR(50) UNIQUE AFTER id
      `);
      console.log('✅ custom_id column added');
    } else {
      console.log('✓ custom_id column already exists');
    }
    
    // Make start_datetime and end_datetime optional
    console.log('🔄 Updating column constraints...');
    await connection.query(`
      ALTER TABLE extra_work 
      MODIFY COLUMN start_datetime DATETIME NULL,
      MODIFY COLUMN end_datetime DATETIME NULL,
      MODIFY COLUMN duration_hours DECIMAL(5,2) NULL
    `);
    console.log('✅ Column constraints updated');
    
    // Rename work_description to description if exists
    const [descColumns]: any = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'extra_work' 
       AND COLUMN_NAME = 'work_description'`
    );
    
    if (descColumns.length > 0) {
      console.log('🔄 Renaming work_description to description...');
      await connection.query(`
        ALTER TABLE extra_work 
        CHANGE COLUMN work_description description TEXT
      `);
      console.log('✅ Column renamed');
    }
    
    // Make material_description_text optional
    await connection.query(`
      ALTER TABLE extra_work 
      MODIFY COLUMN material_description_text TEXT NULL
    `);
    console.log('✅ material_description_text made optional');
    
    console.log('✅ Migration completed successfully');
    res.json({ 
      success: true, 
      message: 'Database migration completed successfully' 
    });
  } catch (error) {
    console.error('❌ Migration failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Migration failed', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  } finally {
    connection.release();
  }
});

export default router;
