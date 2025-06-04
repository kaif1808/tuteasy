import { config } from '../config';
import path from 'path';
import fs from 'fs';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

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
    if (!this.isS3Configured()) {
      // Fallback to local deletion if S3 is not configured
      const filePath = path.join(__dirname, '../../uploads', key); // Adjust path as needed
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        // Consider using a proper logger here
        // console.error('Error deleting local file:', error);
        throw new Error('Failed to delete local file');
      }
      return;
    }

    await this.deleteFromS3(key);
  }

  private async deleteFromS3(key: string): Promise<void> {
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

  private isS3Configured(): boolean {
    // Implement the logic to check if S3 is configured
    return false; // Placeholder return, actual implementation needed
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