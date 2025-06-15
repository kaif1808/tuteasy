import { config } from '../config';
import path from 'path';
import { 
  DeleteObjectCommand, 
  PutObjectCommand, 
  S3Client,
  GetObjectCommand 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../utils/AppError';

export interface StorageService {
  uploadImage(buffer: Buffer, filename: string, options?: ImageUploadOptions): Promise<{ url: string; key: string }>;
  uploadDocument(buffer: Buffer, filename: string): Promise<{ url: string; key: string }>;
  deleteFile(key: string): Promise<void>;
  getSignedUrl?(key: string, expiresIn?: number): Promise<string>;
}

export interface ImageUploadOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  folder?: string;
}

export interface UploadResult {
  url: string;
  key: string;
  size?: number;
  format?: string;
}

// Cloudinary implementation
class CloudinaryStorage implements StorageService {
  constructor() {
    const { cloudName, apiKey, apiSecret } = config.storage.cloudinary;
    
    if (!cloudName || !apiKey || !apiSecret) {
      if (config.isProduction) {
        throw new AppError('Cloudinary credentials are not configured for production environment', 500);
      }
      console.warn('Cloudinary credentials not found. Cloudinary storage service is disabled.');
      return;
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });
  }

  async uploadImage(buffer: Buffer, filename: string, options: ImageUploadOptions = {}): Promise<{ url: string; key: string }> {
    try {
      // Process image with sharp if options are provided
      let processedBuffer = buffer;
      if (options.width || options.height || options.quality || options.format) {
        let sharpInstance = sharp(buffer);
        
        if (options.width || options.height) {
          sharpInstance = sharpInstance.resize(options.width, options.height, {
            fit: 'inside',
            withoutEnlargement: true
          });
        }
        
        if (options.format) {
          switch (options.format) {
            case 'jpeg':
              sharpInstance = sharpInstance.jpeg({ quality: options.quality || 85 });
              break;
            case 'png':
              sharpInstance = sharpInstance.png({ quality: options.quality || 85 });
              break;
            case 'webp':
              sharpInstance = sharpInstance.webp({ quality: options.quality || 85 });
              break;
          }
        }
        
        processedBuffer = await sharpInstance.toBuffer();
      }

      const uploadOptions = {
        folder: options.folder || 'tuteasy/images',
        public_id: `${Date.now()}-${path.parse(filename).name}`,
        resource_type: 'image' as const,
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      };

      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(processedBuffer);
      });

      return {
        url: result.secure_url,
        key: result.public_id
      };
    } catch (error) {
      console.error('Cloudinary image upload error:', error);
      throw new AppError('Failed to upload image to Cloudinary', 500);
    }
  }

  async uploadDocument(buffer: Buffer, filename: string): Promise<{ url: string; key: string }> {
    try {
      const uploadOptions = {
        folder: 'tuteasy/documents',
        public_id: `${Date.now()}-${path.parse(filename).name}`,
        resource_type: 'raw' as const
      };

      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      return {
        url: result.secure_url,
        key: result.public_id
      };
    } catch (error) {
      console.error('Cloudinary document upload error:', error);
      throw new AppError('Failed to upload document to Cloudinary', 500);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      // Determine resource type based on folder structure
      const resourceType = key.includes('/images/') ? 'image' : 'raw';
      
      const result = await cloudinary.uploader.destroy(key, {
        resource_type: resourceType
      });

      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new AppError(`Failed to delete file from Cloudinary: ${result.result}`, 500);
      }
    } catch (error) {
      console.error('Cloudinary file deletion error:', error);
      throw new AppError('Failed to delete file from Cloudinary', 500);
    }
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

  async uploadImage(buffer: Buffer, filename: string, options: ImageUploadOptions = {}): Promise<{ url: string; key: string }> {
    if (!this.s3) {
      throw new AppError('S3 client not initialized', 500);
    }

    try {
      // Process image with sharp if options are provided
      let processedBuffer = buffer;
      let contentType = 'image/jpeg';
      
      if (options.width || options.height || options.quality || options.format) {
        let sharpInstance = sharp(buffer);
        
        if (options.width || options.height) {
          sharpInstance = sharpInstance.resize(options.width, options.height, {
            fit: 'inside',
            withoutEnlargement: true
          });
        }
        
        if (options.format) {
          switch (options.format) {
            case 'jpeg':
              sharpInstance = sharpInstance.jpeg({ quality: options.quality || 85 });
              contentType = 'image/jpeg';
              break;
            case 'png':
              sharpInstance = sharpInstance.png({ quality: options.quality || 85 });
              contentType = 'image/png';
              break;
            case 'webp':
              sharpInstance = sharpInstance.webp({ quality: options.quality || 85 });
              contentType = 'image/webp';
              break;
          }
        }
        
        processedBuffer = await sharpInstance.toBuffer();
      }

      const folder = options.folder || 'images';
      const key = `${folder}/${Date.now()}-${path.parse(filename).name}`;
      const bucketName = this.getBucketName();
      
      if (!bucketName) {
        throw new AppError('S3 bucket name is not configured', 500);
      }

      const uploadParams = {
        Bucket: bucketName,
        Key: key,
        Body: processedBuffer,
        ContentType: contentType,
        ACL: 'public-read' as const
      };

      await this.s3.send(new PutObjectCommand(uploadParams));
      
      const url = `https://${bucketName}.s3.${config.storage.aws.region}.amazonaws.com/${key}`;
      return { url, key };
    } catch (error) {
      console.error('S3 image upload error:', error);
      throw new AppError('Failed to upload image to S3', 500);
    }
  }

  async uploadDocument(buffer: Buffer, filename: string): Promise<{ url: string; key: string }> {
    if (!this.s3) {
      throw new AppError('S3 client not initialized', 500);
    }

    try {
      const key = `documents/${Date.now()}-${filename}`;
      const bucketName = this.getBucketName();
      
      if (!bucketName) {
        throw new AppError('S3 bucket name is not configured', 500);
      }

      const uploadParams = {
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: 'application/pdf', // Assuming PDF for now
        ACL: 'private' as const // Documents should be private
      };

      await this.s3.send(new PutObjectCommand(uploadParams));
      
      // For private documents, return a placeholder URL that will be replaced with signed URLs
      const url = `s3://${bucketName}/${key}`;
      return { url, key };
    } catch (error) {
      console.error('S3 document upload error:', error);
      throw new AppError('Failed to upload document to S3', 500);
    }
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.s3) {
      throw new AppError('S3 client not initialized', 500);
    }

    try {
      const bucketName = this.getBucketName();
      if (!bucketName) {
        throw new AppError('S3 bucket name is not configured', 500);
      }

      await this.s3.send(new DeleteObjectCommand({ 
        Bucket: bucketName, 
        Key: key 
      }));
    } catch (error) {
      console.error('S3 file deletion error:', error);
      throw new AppError('Failed to delete file from S3', 500);
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.s3) {
      throw new AppError('S3 client not initialized', 500);
    }

    try {
      const bucketName = this.getBucketName();
      if (!bucketName) {
        throw new AppError('S3 bucket name is not configured', 500);
      }

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key
      });

      const signedUrl = await getSignedUrl(this.s3, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      console.error('S3 signed URL generation error:', error);
      throw new AppError('Failed to generate signed URL', 500);
    }
  }

  private getBucketName(): string | undefined {
    return config.storage.aws.bucket;
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