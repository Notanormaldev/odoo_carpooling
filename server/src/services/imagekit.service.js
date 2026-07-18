import imagekit from '../config/imagekit.js';
import ApiError from '../utils/ApiError.js';

/**
 * Upload buffer to ImageKit
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} fileName - Destination file name
 * @param {string} folder - Folder name in ImageKit
 * @returns {Promise<string>} Image URL
 */
export const uploadImage = async (fileBuffer, fileName, folder = 'general') => {
  try {
    const uploadResponse = await imagekit.upload({
      file: fileBuffer, // can be a base64 string or file buffer
      fileName,
      folder: `/carpooling/${folder}`,
      useUniqueFileName: true,
    });

    return uploadResponse.url;
  } catch (error) {
    console.error('❌ ImageKit upload error:', error);
    throw ApiError.internal(`Image upload failed: ${error.message}`);
  }
};

export default { uploadImage };
