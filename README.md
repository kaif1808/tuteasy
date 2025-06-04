# TutEasy - Tutoring CRM Management Platform

A comprehensive CRM platform designed for tutoring agencies and freelance tutors, featuring integrated video conferencing, scheduling, payment processing, and student management capabilities.

## 🚀 Project Overview

TutEasy is a full-stack web application that streamlines tutoring business operations by providing:

- **User Management**: Multi-role support for tutors, students, parents, and administrators
- **Scheduling System**: Advanced calendar integration with automated reminders
- **Video Conferencing**: Integrated Zoom support (with plans for custom WebRTC implementation)
- **Payment Processing**: Secure Stripe integration for seamless transactions
- **Student Progress Tracking**: Comprehensive learning analytics and reporting
- **Communication Tools**: In-app messaging and file sharing

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Headless UI, Lucide Icons

### Backend
- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Payment Processing**: Stripe
- **Email Service**: SendGrid
- **Video Integration**: Zoom API (MVP), WebRTC (future)

### Infrastructure
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Railway
- **Database**: PlanetScale or Railway PostgreSQL
- **File Storage**: Cloudinary or AWS S3
- **Monitoring**: Sentry
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ LTS
- npm or yarn
- Git
- PostgreSQL (for local development)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/tuteasy.git
cd tuteasy
```

### 2. Install Node.js

Since Node.js is not currently installed, please install it first:

**For macOS (recommended methods):**

Option 1: Download from official website
- Visit [nodejs.org](https://nodejs.org)
- Download the LTS version
- Run the installer

Option 2: Using Homebrew (if you have it)
```bash
# Install Homebrew first if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install Node.js
brew install node
```

Option 3: Using nvm (Node Version Manager)
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or source profile
source ~/.zshrc

# Install Node.js LTS
nvm install --lts
nvm use --lts
```

### 3. Environment Setup

Once Node.js is installed:

```bash
# Install dependencies
npm install

# Set up environment variables
cp apps/backend/.env.example apps/backend/.env
# Edit .env file with your actual values
```

### 4. Database Setup

```bash
# Navigate to backend
cd apps/backend

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 5. Start Development Servers

```bash
# From root directory
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 📁 Project Structure

```
tuteasy/
├── apps/
│   ├── frontend/          # React application
│   └── backend/           # Express API
├── docs/                  # Documentation
├── scripts/               # Utility scripts
├── .github/               # GitHub Actions workflows
├── .cursorrules           # Cursor IDE rules
└── package.json           # Root package.json
```

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Bcrypt password hashing (12+ salt rounds)
- Input validation and sanitization
- CORS configuration
- Rate limiting on API endpoints
- Environment variable management
- HTTPS enforcement in production
- FERPA, COPPA, and GDPR compliance features

## 🧪 Testing

```bash
# Run all tests
npm test

# Run frontend tests
npm run test:frontend

# Run backend tests
npm run test:backend

# Run with coverage
npm run test:coverage
```

## 📦 Building for Production

```bash
# Build all applications
npm run build

# Build frontend only
npm run build:frontend

# Build backend only
npm run build:backend
```

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic builds on push

### Backend (Railway)

1. Create a new Railway project
2. Connect your GitHub repository
3. Add PostgreSQL database
4. Configure environment variables
5. Deploy with automatic builds

## 📊 Development Roadmap

### Phase 1: MVP (Months 1-3) ✅
- User authentication and profiles
- Basic scheduling system
- Zoom integration
- Payment processing
- Email notifications

### Phase 2: Enhanced Features (Months 4-6)
- Advanced scheduling features
- Student progress tracking
- Analytics dashboard
- Mobile responsiveness

### Phase 3: Video Platform (Months 7-9)
- Custom WebRTC implementation
- Interactive whiteboard
- Session recording
- Screen sharing

### Phase 4: Scale & Optimize (Months 10-12)
- Mobile applications
- API for integrations
- Performance optimization
- Multi-tenant architecture

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

- Documentation: [docs/](./docs)
- Issues: [GitHub Issues](https://github.com/yourusername/tuteasy/issues)
- Email: support@tuteasy.com

## 🙏 Acknowledgments

- Built with Cursor IDE and AI assistance
- Inspired by MyTutor and similar platforms
- Thanks to all open-source contributors

---

**Note**: This project is currently in active development. Features and documentation may change frequently. 