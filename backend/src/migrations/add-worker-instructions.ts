import pool from '../config/database';

export async function addWorkerInstructions() {
  try {
    // Zkontrolovat jestli sloupec už existuje
    const [columns] = await pool.query(
      `SHOW COLUMNS FROM shifts LIKE 'worker_instructions'`
    );
    
    if ((columns as any[]).length === 0) {
      console.log('🔄 Přidávám sloupec worker_instructions...');
      await pool.query(
        'ALTER TABLE shifts ADD COLUMN worker_instructions TEXT AFTER description'
      );
      console.log('✅ Sloupec worker_instructions úspěšně přidán');
    } else {
      console.log('✅ Sloupec worker_instructions už existuje');
    }
  } catch (error) {
    console.error('❌ Chyba při migraci:', error);
    throw error;
  }
}
