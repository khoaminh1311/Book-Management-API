import cloudinary from '../config/cloudinary.js';
import { AppError } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const uploadCoverImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No cover image file provided. Please select an image file.', 400));
  }

  // Upload buffer stream to Cloudinary
  const uploadStream = () => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'bookshelf/covers',
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      stream.end(req.file.buffer);
    });
  };

  try {
    const result = await uploadStream();
    return res.status(200).json({
      success: true,
      message: 'Cover image uploaded successfully to Cloudinary',
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return next(new AppError(`Cloudinary upload failed: ${err.message || 'Unknown error'}`, 500));
  }
});
