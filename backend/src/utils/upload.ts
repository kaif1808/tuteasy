import multer from 'multer';
import sharp from 'sharp';
import { config } from '../config';
import { Request } from 'express';

// Multer configuration
const storage = multer.memoryStorage();

// File filter for images
const imageFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (config.upload.allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image file type. Allowed types: ' + config.upload.allowedImageTypes.join(', ')));
  }
};

// File filter for documents
const documentFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (config.upload.allowedDocumentTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid document file type. Allowed types: ' + config.upload.allowedDocumentTypes.join(', ')));
  }
};

// Image upload middleware
export const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: config.upload.maxFileSizeMB * 1024 * 1024, // Convert MB to bytes
  },
});

// Document upload middleware
export const uploadDocument = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: config.upload.maxFileSizeMB * 1024 * 1024,
  },
});

// Image processing utility
export const processProfileImage = async (buffer: Buffer): Promise<Buffer> => {
  return sharp(buffer)
    .resize(400, 400, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({ quality: 85 })
    .toBuffer();
};

// Thumbnail generation for documents
export const generateDocumentThumbnail = async (_buffer: Buffer): Promise<Buffer | null> => {
  try {
    // For PDFs, we'd need a different library like pdf-thumbnail
    // For now, just return null for non-image documents
    return null;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return null;
  }
}; 