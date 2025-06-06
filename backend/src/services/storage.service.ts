import { config } from '../config';
import path from 'path';
import fs from 'fs';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';

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
    console.log(`Cloudinary file deletion placeholder for key: ${key}`);
    return Promise.resolve();
  }
}

// S3 implementation
class S3Storage implements StorageService {
  private s3?: S3Client;

  constructor() {
    const { accessKeyId, secretAccessKey, region } = config.storage.aws;

    if (accessKeyId && secretAccessKey) {
      this.s3 = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    } else {
      if (config.isProduction) {
        throw new Error('AWS S3 credentials are not configured for production environment.');
      }
      console.warn('AWS S3 credentials not found. S3 storage service is disabled.');
    }
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
    if (!this.s3) {
      // Fallback to local deletion if S3 is not configured
      console.warn('S3 not configured, attempting local file deletion as fallback.');
      const filePath = path.join(__dirname, '../../uploads', key); // Adjust path as needed
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Successfully deleted local file: ${filePath}`);
        } else {
          console.warn(`Local file not found for deletion: ${filePath}`);
        }
      } catch (error) {
        console.error('Error deleting local file:', error);
        throw new Error('Failed to delete local file');
      }
      return;
    }

    await this.deleteFromS3(key);
  }

  private async deleteFromS3(key: string): Promise<void> {
    if (!this.s3) {
      console.warn('S3 client not initialized. Cannot delete from S3.');
      return;
    }
    const bucketName = this.getBucketName();
    if (!bucketName) {
      throw new Error('S3 bucket name is not configured.');
    }
    try {
      await this.s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
    } catch (error) {
      // ... existing code ...
    }
  }

  private getBucketName(): string | undefined {
    // Implement the logic to get the S3 bucket name
    return undefined; // Placeholder return, actual implementation needed
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