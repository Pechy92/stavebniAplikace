import pool from '../config/database';

export async function addCloudinaryColumns() {
  const connection = await pool.getConnection();
  
  try {
    console.log('📝 Adding cloudinary_id columns to photo tables...');

    // extra_work_photos
    await connection.query(`
      ALTER TABLE extra_work_photos 
      ADD COLUMN IF NOT EXISTS cloudinary_id VARCHAR(255) NULL
      AFTER file_path
    `);
    console.log('✅ Added cloudinary_id to extra_work_photos');

    // shift_photos
    await connection.query(`
      ALTER TABLE shift_photos 
      ADD COLUMN IF NOT EXISTS cloudinary_id VARCHAR(255) NULL
      AFTER file_path
    `);
    console.log('✅ Added cloudinary_id to shift_photos');

    console.log('✅ Cloudinary columns migration completed');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Auto-run pokud je spuštěno přímo
if (require.main === module) {
  addCloudinaryColumns()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}
