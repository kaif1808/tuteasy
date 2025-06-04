# Backend Setup Instructions

## Prerequisites

- Node.js 18+ LTS
- PostgreSQL 15+
- Redis (optional, for caching)

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the backend directory with the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL="postgresql://postgres:password@localhost:5432/tuteasy_dev?schema=public"
   JWT_SECRET=your-super-secret-jwt-key-change-this-to-at-least-32-characters-long
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-to-at-least-32-characters-long
   REDIS_URL=redis://localhost:6379
   STORAGE_TYPE=cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   BCRYPT_SALT_ROUNDS=12
   SESSION_TIMEOUT_MINUTES=30
   MAX_FILE_SIZE_MB=10
   ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
   ALLOWED_DOCUMENT_TYPES=application/pdf
   ```

3. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run database migrations
   npm run prisma:migrate
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run type-check` - Check TypeScript types
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## API Endpoints

All tutor profile endpoints are available under `/api/tutors/`:

- `GET /api/tutors/profile` - Get current tutor profile
- `PUT /api/tutors/profile` - Update tutor profile
- `POST /api/tutors/profile/image` - Upload profile image
- `DELETE /api/tutors/profile/image` - Delete profile image
- `GET /api/tutors/subjects` - Get tutor subjects
- `POST /api/tutors/subjects` - Add subject
- `PUT /api/tutors/subjects/:id` - Update subject
- `DELETE /api/tutors/subjects/:id` - Remove subject
- `GET /api/tutors/qualifications` - Get qualifications
- `POST /api/tutors/qualifications` - Upload qualification
- `DELETE /api/tutors/qualifications/:id` - Remove qualification

## Database Schema

The backend uses Prisma ORM with PostgreSQL. Key models:

- `User` - Authentication and user management
- `Tutor` - Tutor profile information
- `TutorSubject` - Subjects taught by tutors
- `TutorQualification` - Tutor credentials and certificates

## Security Features

- JWT authentication with refresh tokens
- Rate limiting on API endpoints
- Input validation with Zod
- File upload restrictions
- CORS protection
- Helmet.js security headers 