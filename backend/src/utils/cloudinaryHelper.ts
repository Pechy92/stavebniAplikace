import { cloudinary } from '../config/cloudinary';
import streamifier from 'streamifier';

/**
 * Upload souboru do Cloudinary z bufferu
 * @param fileBuffer - Buffer souboru z multer memory storage
 * @param folder - Složka v Cloudinary (např. 'extra-work', 'shifts')
 * @returns Promise s Cloudinary upload výsledkem
 */
export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `stavebni-aplikace/${folder}`,
        resource_type: 'image',
        transformation: [
          { width: 1920, height: 1920, crop: 'limit' }, // Max rozměry
          { quality: 'auto:good' }, // Automatická optimalizace kvality
          { fetch_format: 'auto' } // Automatický formát (WebP pro podporované prohlížeče)
        ]
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('✅ Cloudinary upload success:', result?.secure_url);
          resolve(result);
        }
      }
    );

    // Stream buffer do Cloudinary
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Smazání souboru z Cloudinary
 * @param publicId - Public ID souboru v Cloudinary
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log('✅ Cloudinary file deleted:', publicId);
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
    throw error;
  }
};

/**
 * Extrakce public_id z Cloudinary URL
 * @param url - Cloudinary URL
 * @returns public_id nebo null
 */
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    // Cloudinary URL formát: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
    const matches = url.match(/\/v\d+\/(.+)\.[a-z]+$/);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error('❌ Error extracting public_id:', error);
    return null;
  }
};
