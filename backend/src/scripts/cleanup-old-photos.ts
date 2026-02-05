/**
 * Cleanup script to remove old photo records that don't have Cloudinary URLs
 * These photos no longer exist after Railway redeploys
 */

import pool from '../config/database';

async function cleanupOldPhotos() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🧹 Starting photo cleanup...');

    // Check extra_work_photos
    const [extraWorkPhotos] = await connection.query(`
      SELECT COUNT(*) as count FROM extra_work_photos 
      WHERE file_path NOT LIKE 'http%' AND (cloudinary_id IS NULL OR cloudinary_id = '')
    `);
    const extraWorkCount = (extraWorkPhotos as any[])[0].count;
    console.log(`📸 Found ${extraWorkCount} old extra work photos to delete`);

    // Check shift_photos
    const [shiftPhotos] = await connection.query(`
      SELECT COUNT(*) as count FROM shift_photos 
      WHERE file_path NOT LIKE 'http%' AND (cloudinary_id IS NULL OR cloudinary_id = '')
    `);
    const shiftCount = (shiftPhotos as any[])[0].count;
    console.log(`📸 Found ${shiftCount} old shift photos to delete`);

    // Delete old extra_work_photos
    if (extraWorkCount > 0) {
      await connection.query(`
        DELETE FROM extra_work_photos 
        WHERE file_path NOT LIKE 'http%' AND (cloudinary_id IS NULL OR cloudinary_id = '')
      `);
      console.log(`✅ Deleted ${extraWorkCount} old extra work photos`);
    }

    // Delete old shift_photos
    if (shiftCount > 0) {
      await connection.query(`
        DELETE FROM shift_photos 
        WHERE file_path NOT LIKE 'http%' AND (cloudinary_id IS NULL OR cloudinary_id = '')
      `);
      console.log(`✅ Deleted ${shiftCount} old shift photos`);
    }

    console.log('✅ Photo cleanup completed');
    console.log(`📊 Total records deleted: ${extraWorkCount + shiftCount}`);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  } finally {
    connection.release();
    process.exit(0);
  }
}

cleanupOldPhotos();
