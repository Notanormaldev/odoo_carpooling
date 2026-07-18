import multer from 'multer';
import ApiError from '../utils/ApiError.js';

// Store in memory for ImageKit upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(ApiError.badRequest('Only JPEG, PNG, and WebP images are allowed'), false);
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1,
  },
});

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 3,
  },
});

export default { upload, uploadMultiple };
