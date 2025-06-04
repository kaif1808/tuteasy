# TutEasy Setup Instructions

## Prerequisites Installation

### 1. Install Node.js (Required)

Since Node.js is not installed on your system, you need to install it first. Here are three methods:

#### Option A: Official Installer (Recommended for beginners)
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS version (18.x or higher)
3. Run the installer and follow the instructions
4. Restart your terminal after installation

#### Option B: Using Homebrew (Recommended for macOS developers)
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

#### Option C: Using NVM (Recommended for managing multiple Node versions)
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Add nvm to your shell profile
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.zshrc
echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.zshrc

# Reload your shell configuration
source ~/.zshrc

# Install and use Node.js LTS
nvm install --lts
nvm use --lts
nvm alias default node
```

### 2. Verify Installation
```bash
# Check Node.js version (should be 18.x or higher)
node --version

# Check npm version (should be 9.x or higher)
npm --version
```

### 3. Install PostgreSQL (For local development)

#### macOS:
```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15

# Create a database user
createuser -s postgres

# Or download Postgres.app from https://postgresapp.com/
```

#### Alternative: Use Docker
```bash
# Create a docker-compose.yml file for PostgreSQL
docker run --name tuteasy-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=tuteasy \
  -p 5432:5432 \
  -d postgres:15
```

## Project Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/kaif1808/tuteasy.git
cd tuteasy

# Install root dependencies
npm install

# Install frontend dependencies
cd apps/frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Return to root
cd ../..
```

### 2. Create Frontend Application

Since the frontend doesn't exist yet, let's create it:

```bash
cd apps
npm create vite@latest frontend -- --template react-ts
cd frontend

# Install additional frontend dependencies
npm install zustand react-router-dom @tanstack/react-query
npm install @hookform/react-hook-form zod
npm install lucide-react @headlessui/react
npm install axios date-fns clsx

# Install dev dependencies
npm install -D tailwindcss postcss autoprefixer @types/react @types/react-dom
npm install -D @tailwindcss/forms @tailwindcss/typography

# Initialize Tailwind CSS
npx tailwindcss init -p

# Return to root
cd ../..
```

### 3. Create Backend Application

```bash
cd apps/backend

# Initialize package.json
npm init -y

# Install production dependencies
npm install express cors helmet morgan compression
npm install jsonwebtoken bcryptjs dotenv
npm install @prisma/client prisma
npm install stripe @sendgrid/mail
npm install express-rate-limit express-validator
npm install multer cloudinary

# Install dev dependencies
npm install -D typescript @types/node @types/express
npm install -D @types/cors @types/jsonwebtoken @types/bcryptjs
npm install -D @types/morgan @types/multer @types/compression
npm install -D nodemon ts-node tsx
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint prettier eslint-config-prettier

# Initialize TypeScript
npx tsc --init

# Initialize Prisma
npx prisma init

# Return to root
cd ../..
```

### 4. Configure Environment Variables

```bash
# Copy environment template
cp apps/backend/.env.example apps/backend/.env

# Edit the .env file with your actual values
# At minimum, configure:
# - DATABASE_URL
# - JWT_SECRET
# - Frontend URL
```

### 5. Setup Database

```bash
cd apps/backend

# Update DATABASE_URL in .env file
# Format: postgresql://username:password@localhost:5432/tuteasy?schema=public

# Create Prisma schema (create/update schema.prisma file)
# Then run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# (Optional) Seed the database
npx prisma db seed

cd ../..
```

### 6. Configure Frontend

Update `apps/frontend/tailwind.config.js`:
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
          DEFAULT: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93BBFC',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

Update `apps/frontend/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 7. Create Basic TypeScript Configs

Backend `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowJs": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 8. Update Package Scripts

Backend `package.json` scripts:
```json
{
  "scripts": {
    "dev": "nodemon --exec tsx src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

Frontend `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\""
  }
}
```

## Running the Application

### Development Mode

```bash
# From the root directory, run both frontend and backend
npm run dev

# Or run them separately:
# Terminal 1 - Backend
cd apps/backend && npm run dev

# Terminal 2 - Frontend
cd apps/frontend && npm run dev
```

### Access Points
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Health Check: http://localhost:3001/health

## Common Issues & Solutions

### Issue: Command not found: npm
**Solution**: Node.js is not installed. Follow the installation instructions above.

### Issue: Cannot connect to PostgreSQL
**Solution**: 
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in .env file
3. Create the database if it doesn't exist: `createdb tuteasy`

### Issue: Prisma migration fails
**Solution**:
1. Check database connection
2. Ensure DATABASE_URL is correct
3. Try resetting: `npx prisma migrate reset`

### Issue: Port already in use
**Solution**:
1. Change port in .env file
2. Or kill the process: `lsof -ti:3001 | xargs kill`

## Next Steps

1. **Setup Zoom Integration**
   - Create a Zoom OAuth app
   - Add credentials to .env file

2. **Setup Stripe**
   - Create a Stripe account
   - Add API keys to .env file

3. **Setup SendGrid**
   - Create a SendGrid account
   - Add API key to .env file

4. **Configure Cloudinary** (for file uploads)
   - Create a Cloudinary account
   - Add credentials to .env file

## Development Workflow

1. Create a new feature branch
2. Make changes
3. Run tests and linting
4. Commit with conventional commits
5. Push and create a pull request

```bash
# Example workflow
git checkout -b feature/user-authentication
# ... make changes ...
npm run lint
npm run test
git add .
git commit -m "feat: implement JWT authentication"
git push origin feature/user-authentication
```

## Additional Resources

- [Project Documentation](./docs/)
- [Database Schema](./docs/database-schema.md)
- [API Documentation](./docs/api/)
- [Contributing Guidelines](./CONTRIBUTING.md)

## Support

If you encounter any issues:
1. Check the [Common Issues](#common-issues--solutions) section
2. Review the error logs
3. Check existing GitHub issues
4. Create a new issue with details

Happy coding! 🚀 