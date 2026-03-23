import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary
 * @param {Buffer} buffer - The file buffer from multer
 * @param {string} folder - The target folder name
 * @returns {Promise<string>} - The secure URL of the uploaded file
 */
export const uploadToCloudinary = (buffer, folder = "purrito") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
};

// Use memory storage (recommended)
export const upload = multer({
  storage: multer.memoryStorage(),
});

export default cloudinary;