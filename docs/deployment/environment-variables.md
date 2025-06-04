# Environment Variables

This document lists all required environment variables for the TutEasy backend application.

## Database

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/tuteasy_db"
```

## JWT Configuration

```bash
JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters-long"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key-at-least-32-characters-long"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"
```

## Redis

```bash
REDIS_URL="redis://localhost:6379"
```

## Storage Configuration

Choose either S3 or Cloudinary:

```bash
STORAGE_TYPE="cloudinary"  # or "s3"
```

### AWS S3 (if using S3)

```bash
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-s3-bucket-name"
```

### Cloudinary (if using Cloudinary)

```bash
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

## Email Configuration (SendGrid)

```bash
SENDGRID_API_KEY="SG.your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
```

### Setting up SendGrid

1. Create a SendGrid account at https://sendgrid.com/
2. Generate an API key with Mail Send permissions
3. Add the API key to your environment variables
4. Configure your from email address (must be verified in SendGrid)

## Frontend URL

```bash
FRONTEND_URL="http://localhost:5173"  # Development
# FRONTEND_URL="https://yourdomain.com"  # Production
```

## Security

```bash
BCRYPT_SALT_ROUNDS="12"
SESSION_TIMEOUT_MINUTES="30"
```

## File Upload

```bash
MAX_FILE_SIZE_MB="10"
ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/webp"
ALLOWED_DOCUMENT_TYPES="application/pdf"
```

## Environment

```bash
NODE_ENV="development"  # or "production" or "test"
PORT="5000"
```

## Complete Example

Create a `.env` file in the backend directory with the following:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tuteasy_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters-long"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key-at-least-32-characters-long"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# Storage Configuration
STORAGE_TYPE="cloudinary"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Email Configuration (SendGrid)
SENDGRID_API_KEY="SG.your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# Frontend URL
FRONTEND_URL="http://localhost:5173"

# Security
BCRYPT_SALT_ROUNDS="12"
SESSION_TIMEOUT_MINUTES="30"

# File Upload
MAX_FILE_SIZE_MB="10"
ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/webp"
ALLOWED_DOCUMENT_TYPES="application/pdf"

# Environment
NODE_ENV="development"
PORT="5000"
```

## Testing Email Functionality

When `SENDGRID_API_KEY` is not provided:
- Email sending will be logged to console instead of actually sending
- This allows for development without requiring SendGrid setup
- All authentication flows will still work, but users won't receive emails

## Production Considerations

1. **Email Domain**: Set up domain authentication in SendGrid for better deliverability
2. **Rate Limits**: Configure appropriate rate limits for email sending
3. **Monitoring**: Set up alerts for email delivery failures
4. **Backup**: Consider a backup email service for critical notifications 