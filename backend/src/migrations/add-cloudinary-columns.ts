import pool from '../config/database';

export async function addCloudinaryColumns() {
  const connection = await pool.getConnection();
  
  try {
    console.log('📝 Adding cloudinary_id columns to photo tables...');

    // extra_work_photos
    try {
      await connection.query(`
        ALTER TABLE extra_work_photos 
        ADD COLUMN cloudinary_id VARCHAR(255) NULL
        AFTER file_path
      `);
      console.log('✅ Added cloudinary_id to extra_work_photos');
    } catch (error: any) {
      if (error.errno === 1060) {
        console.log('⚠️ Column cloudinary_id already exists in extra_work_photos');
      } else {
        throw error;
      }
    }

    // shift_photos
    try {
      await connection.query(`
        ALTER TABLE shift_photos 
        ADD COLUMN cloudinary_id VARCHAR(255) NULL
        AFTER file_path
      `);
      console.log('✅ Added cloudinary_id to shift_photos');
    } catch (error: any) {
      if (error.errno === 1060) {
        console.log('⚠️ Column cloudinary_id already exists in shift_photos');
      } else {
        throw error;
      }
    }

    console.log('✅ Cloudinary columns migration completed');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    // Don't throw - just log the error so server can continue
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
