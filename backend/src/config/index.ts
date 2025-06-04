import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Environment variable schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform(Number),
  DATABASE_URL: z.string().url(),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Redis
  REDIS_URL: z.string().url(),
  
  // Storage (AWS S3 or Cloudinary)
  STORAGE_TYPE: z.enum(['s3', 'cloudinary']).default('cloudinary'),
  
  // AWS S3
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().optional(),
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  // Security
  BCRYPT_SALT_ROUNDS: z.string().default('12').transform(Number),
  SESSION_TIMEOUT_MINUTES: z.string().default('30').transform(Number),
  
  // File Upload
  MAX_FILE_SIZE_MB: z.string().default('10').transform(Number),
  ALLOWED_IMAGE_TYPES: z.string().default('image/jpeg,image/png,image/webp'),
  ALLOWED_DOCUMENT_TYPES: z.string().default('application/pdf'),
  
  // Email (SendGrid)
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().default('noreply@tuteasy.com'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
});

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const config = {
  env: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,
  db: {
    url: parsedEnv.data.DATABASE_URL,
  },
  jwt: {
    secret: parsedEnv.data.JWT_SECRET,
    refreshSecret: parsedEnv.data.JWT_REFRESH_SECRET,
    expiresIn: parsedEnv.data.JWT_EXPIRES_IN,
    refreshExpiresIn: parsedEnv.data.JWT_REFRESH_EXPIRES_IN,
  },
  redis: {
    url: parsedEnv.data.REDIS_URL,
  },
  storage: {
    type: parsedEnv.data.STORAGE_TYPE,
    aws: {
      accessKeyId: parsedEnv.data.AWS_ACCESS_KEY_ID,
      secretAccessKey: parsedEnv.data.AWS_SECRET_ACCESS_KEY,
      region: parsedEnv.data.AWS_REGION,
      bucket: parsedEnv.data.AWS_S3_BUCKET,
    },
    cloudinary: {
      cloudName: parsedEnv.data.CLOUDINARY_CLOUD_NAME,
      apiKey: parsedEnv.data.CLOUDINARY_API_KEY,
      apiSecret: parsedEnv.data.CLOUDINARY_API_SECRET,
    },
  },
  security: {
    bcryptSaltRounds: parsedEnv.data.BCRYPT_SALT_ROUNDS,
    sessionTimeoutMinutes: parsedEnv.data.SESSION_TIMEOUT_MINUTES,
  },
  upload: {
    maxFileSizeMB: parsedEnv.data.MAX_FILE_SIZE_MB,
    allowedImageTypes: parsedEnv.data.ALLOWED_IMAGE_TYPES.split(','),
    allowedDocumentTypes: parsedEnv.data.ALLOWED_DOCUMENT_TYPES.split(','),
  },
  sendgrid: {
    apiKey: parsedEnv.data.SENDGRID_API_KEY,
    fromEmail: parsedEnv.data.SENDGRID_FROM_EMAIL,
  },
  frontend: {
    url: parsedEnv.data.FRONTEND_URL,
  },
  isDevelopment: parsedEnv.data.NODE_ENV === 'development',
  isProduction: parsedEnv.data.NODE_ENV === 'production',
  isTest: parsedEnv.data.NODE_ENV === 'test',
}; 