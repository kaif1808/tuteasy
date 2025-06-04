# Tutoring CRM Platform - Cursor Project Setup Guide

## Project Overview
This guide provides a complete setup for developing a tutoring CRM platform using Cursor IDE with AI assistance, optimized for solo development with security-first practices.

## Project Structure

```
tutoring-crm-platform/
├── .cursor/
│   └── rules/                    # Cursor AI rules and configurations
│       ├── security.mdc         # Security-focused development rules  
│       ├── typescript.mdc       # TypeScript best practices
│       ├── react.mdc            # React development guidelines
│       └── backend.mdc          # Backend development rules
├── apps/
│   ├── frontend/                # React web application
│   │   ├── src/
│   │   │   ├── components/      # Reusable UI components
│   │   │   │   ├── ui/          # Basic components (Button, Input, etc.)
│   │   │   │   ├── layout/      # Layout components (Header, Sidebar)
│   │   │   │   └── features/    # Feature-specific components
│   │   │   ├── pages/           # Page components and routing
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   ├── stores/          # Zustand state management
│   │   │   ├── services/        # API calls and external services
│   │   │   ├── utils/           # Utility functions
│   │   │   ├── types/           # TypeScript type definitions
│   │   │   ├── constants/       # Application constants
│   │   │   └── assets/          # Static assets (images, icons)
│   │   ├── public/              # Public static files
│   │   ├── package.json
│   │   ├── vite.config.ts       # Vite configuration
│   │   ├── tailwind.config.js   # Tailwind CSS configuration
│   │   └── tsconfig.json        # TypeScript configuration
│   └── backend/                 # Node.js Express API
│       ├── src/
│       │   ├── controllers/     # Route handlers
│       │   ├── middleware/      # Express middleware
│       │   ├── models/          # Database models (Prisma)
│       │   ├── routes/          # API route definitions
│       │   ├── services/        # Business logic
│       │   ├── utils/           # Utility functions
│       │   ├── types/           # TypeScript type definitions
│       │   ├── config/          # Configuration files
│       │   └── prisma/          # Database schema and migrations
│       ├── tests/               # Test files
│       ├── package.json
│       ├── tsconfig.json
│       └── .env.example         # Environment variables template
├── docs/                        # Project documentation
│   ├── api/                     # API documentation
│   ├── deployment/              # Deployment guides
│   └── user-guides/             # User documentation
├── scripts/                     # Development and deployment scripts
├── .github/
│   └── workflows/               # GitHub Actions CI/CD
├── docker-compose.yml           # Local development environment
├── .gitignore
├── README.md
└── package.json                 # Root package.json for monorepo
```

## Initial Project Setup

### 1. Environment Setup

```bash
# Create project directory
mkdir tuteasy
cd tuteasy

# Initialize git repository
git init
git branch -M main

# Create basic package.json for monorepo
npm init -y

# Install workspace dependencies
npm install -D typescript @types/node concurrently
```

### 2. Cursor Rules Configuration

Create `.cursor/rules/security.mdc`:
```markdown
---
description: Security-first development rules for tutoring CRM
alwaysApply: true
---

# Security Rules - ALWAYS ENFORCE

## Critical Security Practices
- NEVER commit secrets, API keys, or credentials to git
- Use environment variables for ALL sensitive configuration
- Validate ALL user inputs on both client and server
- Implement proper authentication on ALL API routes
- Use parameterized queries to prevent SQL injection
- Encrypt sensitive data at rest and in transit

## Educational Data Protection
- Follow FERPA guidelines for student records
- Implement COPPA compliance for users under 13
- Add GDPR features (data export, deletion, consent)
- Log access to student data for audits

## Code Quality Requirements
- Use TypeScript strict mode for all new code
- Implement proper error handling with try/catch
- Add input validation with Zod schemas
- Include unit tests for critical business logic
- Use ESLint and Prettier for consistent formatting

@security-checklist.md
```

Create `.cursor/rules/typescript.mdc`:
```markdown
---
description: TypeScript development standards
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: false
---

# TypeScript Best Practices

## Type Safety Rules
- Enable strict mode in tsconfig.json
- Define interfaces for all API responses
- Use proper type annotations, avoid 'any'
- Create custom types for business logic
- Use generic types for reusable components

## Code Organization
- Group related types in dedicated files
- Use barrel exports for clean imports
- Implement proper error types
- Define utility types for common patterns

@typescript-config.json
```

### 3. Frontend Setup (React + Vite)

```bash
# Create frontend application
cd apps
npm create vite@latest frontend -- --template react-ts
cd frontend

# Install dependencies
npm install

# Install additional packages
npm install -D tailwindcss postcss autoprefixer @types/react @types/react-dom
npm install zustand react-router-dom @hookform/react-hook-form zod react-query
npm install lucide-react @headlessui/react @tailwindcss/forms

# Initialize Tailwind CSS
npx tailwindcss init -p
```

Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

### 4. Backend Setup (Node.js + Express)

```bash
# Create backend application
mkdir backend
cd backend

# Initialize package.json
npm init -y

# Install dependencies
npm install express cors helmet morgan dotenv bcryptjs jsonwebtoken
npm install prisma @prisma/client stripe nodemailer
npm install -D typescript @types/node @types/express @types/cors
npm install -D @types/bcryptjs @types/jsonwebtoken nodemon ts-node

# Initialize TypeScript
npx tsc --init

# Initialize Prisma
npx prisma init
```

Create basic `src/app.ts`:
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1', require('./routes'));

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 5. Database Schema (Prisma)

Update `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      UserRole @default(STUDENT)
  firstName String
  lastName  String
  phone     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  tutorProfile   TutorProfile?
  studentProfile StudentProfile?
  sessions       Session[]

  @@map("users")
}

model TutorProfile {
  id          String  @id @default(cuid())
  userId      String  @unique
  bio         String?
  hourlyRate  Decimal
  subjects    String[]
  experience  Int
  verified    Boolean @default(false)

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessions Session[]

  @@map("tutor_profiles")
}

model StudentProfile {
  id       String @id @default(cuid())
  userId   String @unique
  grade    String?
  subjects String[]

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessions Session[]

  @@map("student_profiles")
}

model Session {
  id          String        @id @default(cuid())
  tutorId     String
  studentId   String
  subject     String
  duration    Int           // minutes
  scheduledAt DateTime
  status      SessionStatus @default(SCHEDULED)
  zoomMeetingId String?
  zoomJoinUrl   String?
  notes       String?
  rating      Int?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  tutor   TutorProfile   @relation(fields: [tutorId], references: [id])
  student StudentProfile @relation(fields: [studentId], references: [id])
  User    User?          @relation(fields: [userId], references: [id])
  userId  String?

  @@map("sessions")
}

enum UserRole {
  ADMIN
  TUTOR
  STUDENT
  PARENT
}

enum SessionStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

### 6. Environment Configuration

Create `.env.example` in backend:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tutoring_crm?schema=public"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="24h"

# Application
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:5173"

# Zoom API
ZOOM_API_KEY="your-zoom-api-key"
ZOOM_API_SECRET="your-zoom-api-secret"
ZOOM_ACCOUNT_ID="your-zoom-account-id"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (SendGrid)
SENDGRID_API_KEY="SG...."
FROM_EMAIL="noreply@yourdomain.com"

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
```

### 7. Development Scripts

Update root `package.json`:
```json
{
  "name": "tutoring-crm-platform",
  "private": true,
  "workspaces": [
    "apps/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd apps/frontend && npm run dev",
    "dev:backend": "cd apps/backend && npm run dev",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd apps/frontend && npm run build",
    "build:backend": "cd apps/backend && npm run build",
    "test": "npm run test:frontend && npm run test:backend",
    "test:frontend": "cd apps/frontend && npm run test",
    "test:backend": "cd apps/backend && npm run test",
    "lint": "npm run lint:frontend && npm run lint:backend",
    "lint:frontend": "cd apps/frontend && npm run lint",
    "lint:backend": "cd apps/backend && npm run lint"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "typescript": "^5.0.0"
  }
}
```

### 8. Git Configuration

Create comprehensive `.gitignore`:
```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db
*.sqlite

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Build outputs
dist/
build/
*.tsbuildinfo

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Temporary files
tmp/
temp/

# Coverage directory used by tools like istanbul
coverage/

# Uploads
uploads/
```

### 9. Development Workflow

#### Daily Development Routine:
```bash
# Start development servers
npm run dev

# Create new feature branch
git checkout -b feature/user-authentication

# Make changes and commit frequently
git add .
git commit -m "feat: implement JWT authentication"

# Run tests before pushing
npm run test
npm run lint

# Push and create PR
git push origin feature/user-authentication
```

#### Using Cursor AI Effectively:
1. **Use @rules** to reference security guidelines
2. **Ask for code reviews** with security focus
3. **Request test implementations** for new features
4. **Get architecture advice** for complex features
5. **Validate API designs** against best practices

### 10. Deployment Preparation

#### Vercel Configuration (`vercel.json` in frontend):
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "@api-url"
  }
}
```

#### Railway Configuration (`railway.toml` in backend):
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "backend"
source = "."
```

## Next Steps

1. **Clone/Initialize Repository**: Set up the project structure
2. **Install Dependencies**: Run npm install in all directories
3. **Configure Cursor Rules**: Add security and development rules
4. **Set Up Database**: Configure PostgreSQL and run migrations
5. **Implement Authentication**: Start with user registration and login
6. **Build MVP Features**: Follow the MVP PRD prioritization
7. **Add Zoom Integration**: Implement video calling capabilities
8. **Deploy and Test**: Set up staging environment

## Security Checklist

- [ ] Environment variables properly configured
- [ ] Git secrets scanning enabled
- [ ] HTTPS enforced in production
- [ ] Database migrations reviewed
- [ ] API rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Authentication middleware on protected routes
- [ ] Proper error handling without information leakage
- [ ] Dependencies audited for vulnerabilities
- [ ] CORS configured for production domains

This setup provides a robust foundation for developing the tutoring CRM platform with Cursor IDE, emphasizing security, maintainability, and developer productivity.