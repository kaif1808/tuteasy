# TutEasy - Local Development Setup

## ✅ What's Been Completed

Your TutEasy development environment has been successfully set up with:

### Frontend (React + TypeScript)
- ✅ Vite build system with React 18
- ✅ TypeScript configuration
- ✅ Tailwind CSS with custom design system
- ✅ Essential dependencies (React Router, React Query, Zustand, etc.)
- ✅ Beautiful landing page with features showcase
- ✅ Custom UI components and utilities

### Backend (Node.js + Express)
- ✅ Express server with TypeScript
- ✅ Security middleware (Helmet, CORS, Rate Limiting)
- ✅ Comprehensive Prisma database schema
- ✅ Environment configuration structure
- ✅ Production-ready server setup

### Project Structure
- ✅ Monorepo with workspaces
- ✅ Proper TypeScript configurations
- ✅ Security-first development rules
- ✅ Git hooks with Husky
- ✅ Documentation and guides

## 🚀 Quick Start

### 1. Start the Development Servers

```bash
# Option 1: Start both frontend and backend together
npm run dev

# Option 2: Start them separately
# Terminal 1 - Frontend
npm run dev:frontend

# Terminal 2 - Backend  
npm run dev:backend
```

### 2. Access Your Applications

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🗄️ Database Setup (Next Step)

To complete your setup, you'll need to configure PostgreSQL:

### Option 1: Local PostgreSQL Installation

```bash
# macOS with Homebrew
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb tuteasy

# Create user (optional)
createuser -s postgres
```

### Option 2: Docker PostgreSQL

```bash
# Run PostgreSQL in Docker
docker run --name tuteasy-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=tuteasy \
  -p 5432:5432 \
  -d postgres:15

# Verify it's running
docker ps
```

### Configure Database Connection

1. Navigate to the backend directory:
```bash
cd apps/backend
```

2. Create your `.env` file:
```bash
# Copy from template
cp .env.example .env

# Edit with your database URL
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tuteasy?schema=public"
```

3. Run database migrations:
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio
npx prisma studio
```

## 🔧 Development Commands

### Root Commands
```bash
npm run dev           # Start both frontend and backend
npm run build         # Build both applications
npm run lint          # Lint both applications
npm test              # Run all tests
```

### Frontend Commands
```bash
cd apps/frontend
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Lint code
npm run type-check    # Check TypeScript
```

### Backend Commands
```bash
cd apps/backend
npm run dev              # Start dev server with hot reload
npm run build            # Build TypeScript
npm run start            # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Zustand** - Global state management
- **Zod** - Schema validation
- **Lucide React** - Icon library

### Backend
- **Node.js 22** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **Morgan** - Request logging
- **Rate Limiting** - API protection

## 📁 Project Structure

```
tuteasy/
├── apps/
│   ├── frontend/           # React application
│   │   ├── src/
│   │   │   ├── components/ # Reusable components
│   │   │   ├── pages/      # Page components
│   │   │   ├── hooks/      # Custom hooks
│   │   │   ├── stores/     # Zustand stores
│   │   │   └── utils/      # Utility functions
│   │   ├── public/         # Static assets
│   │   └── package.json
│   └── backend/            # Express API
│       ├── src/
│       │   ├── controllers/# Route handlers
│       │   ├── middleware/ # Express middleware
│       │   ├── routes/     # API routes
│       │   ├── services/   # Business logic
│       │   └── utils/      # Utility functions
│       ├── prisma/         # Database schema
│       └── package.json
├── docs/                   # Documentation
├── .cursorrules           # AI development rules
└── package.json           # Root configuration
```

## 🔐 Environment Variables

Create `apps/backend/.env` with these required variables:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tuteasy?schema=public"

# JWT
JWT_SECRET="your-secret-key-here"

# Application
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:5173"

# Optional: Add when ready
# ZOOM_CLIENT_ID="your-zoom-client-id"
# STRIPE_SECRET_KEY="sk_test_..."
# SENDGRID_API_KEY="SG...."
```

## 🚧 Next Development Steps

1. **Database Setup** (Required next)
   - Install PostgreSQL or use Docker
   - Configure DATABASE_URL
   - Run migrations

2. **Authentication System**
   - User registration/login
   - JWT token management
   - Password reset flow

3. **User Profiles**
   - Tutor profile creation
   - Student profile management
   - Profile image uploads

4. **Session Management**
   - Calendar integration
   - Booking system
   - Zoom meeting creation

5. **Payment Processing**
   - Stripe integration
   - Payment flows
   - Invoice generation

## 🐛 Troubleshooting

### Frontend Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check

# Restart dev server
npm run dev
```

### Backend Issues
```bash
# Check if database is running
pg_isready -h localhost -p 5432

# Reset database
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate
```

### Common Errors

**Error: "Cannot find module '@prisma/client'"**
```bash
cd apps/backend
npx prisma generate
```

**Error: "Database connection failed"**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file
- Verify database exists

**Error: "Port 3001 already in use"**
```bash
# Find and kill process using port
lsof -ti:3001 | xargs kill
```

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)

## 🤝 Development Workflow

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and test locally
3. Run linting: `npm run lint`
4. Commit changes: `git commit -m "feat: description"`
5. Push and create PR: `git push origin feature/feature-name`

Your development environment is ready! 🎉

Start by setting up the database, then begin implementing authentication. 