import { config } from '../config';

export interface StorageService {
  uploadImage(buffer: Buffer, filename: string): Promise<{ url: string; key: string }>;
  uploadDocument(buffer: Buffer, filename: string): Promise<{ url: string; key: string }>;
  deleteFile(key: string): Promise<void>;
}

// Cloudinary implementation
class CloudinaryStorage implements StorageService {
  constructor() {
    // We'll implement Cloudinary setup when needed
    // For now, this is a placeholder
  }

  async uploadImage(_buffer: Buffer, filename: string): Promise<{ url: string; key: string }> {
    // TODO: Implement Cloudinary image upload
    // For MVP, we can use local storage or return mock data
    const key = `images/${Date.now()}-${filename}`;
    const url = `/uploads/${key}`;
    return { url, key };
  }

  async uploadDocument(_buffer: Buffer, filename: string): Promise<{ url: string; key: string }> {
    // TODO: Implement Cloudinary document upload
    const key = `documents/${Date.now()}-${filename}`;
    const url = `/uploads/${key}`;
    return { url, key };
  }

  async deleteFile(key: string): Promise<void> {
    // TODO: Implement Cloudinary file deletion
    console.log('Deleting file:', key);
  }
}

// S3 implementation
class S3Storage implements StorageService {
  constructor() {
    // TODO: Initialize AWS S3 client
  }

  async uploadImage(_buffer: Buffer, filename: string): Promise<{ url: string; key: string }> {
    // TODO: Implement S3 image upload
    const key = `images/${Date.now()}-${filename}`;
    const url = `https://${config.storage.aws.bucket}.s3.amazonaws.com/${key}`;
    return { url, key };
  }

  async uploadDocument(_buffer: Buffer, filename: string): Promise<{ url: string; key: string }> {
    // TODO: Implement S3 document upload
    const key = `documents/${Date.now()}-${filename}`;
    const url = `https://${config.storage.aws.bucket}.s3.amazonaws.com/${key}`;
    return { url, key };
  }

  async deleteFile(key: string): Promise<void> {
    // TODO: Implement S3 file deletion
    console.log('Deleting file from S3:', key);
  }
}

// Factory function to create storage service based on configuration
export const createStorageService = (): StorageService => {
  if (config.storage.type === 's3') {
    return new S3Storage();
  }
  return new CloudinaryStorage();
};

// Export singleton instance
export const storageService = createStorageService(); 