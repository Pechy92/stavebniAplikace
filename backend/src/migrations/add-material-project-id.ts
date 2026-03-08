import pool from '../config/database';

// Přidá project_id do materials tabulky, pokud ještě neexistuje.
export async function addMaterialProjectIdColumn(): Promise<void> {
  const connection = await pool.getConnection();

  try {
    const [columns] = await connection.query("SHOW COLUMNS FROM materials LIKE 'project_id'");
    if ((columns as any[]).length > 0) {
      console.log('✅ Sloupec project_id v materials již existuje');
      return;
    }

    await connection.query(`
      ALTER TABLE materials
      ADD COLUMN project_id INT NULL AFTER category,
      ADD INDEX idx_project_id (project_id),
      ADD CONSTRAINT fk_materials_project
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    `);

    console.log('✅ Migrace dokončena: materials.project_id přidáno');
  } catch (error) {
    console.error('❌ Chyba migrace materials.project_id:', error);
  } finally {
    connection.release();
  }
}
