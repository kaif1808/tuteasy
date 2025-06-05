# Practical TutEasy MVP Testing Guide

This guide focuses on testing the **currently working** parts of the TutEasy MVP that you can interact with right now.

## 🚀 Quick Start (5 minutes)

### 1. Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🧪 Immediately Testable Components

### 1. UI Component Test Suite ✅ WORKING
**URL:** `http://localhost:5173/test/components`

**What to Test:**
- **Button Components**: Click different button variants (default, outline, secondary)
- **Input Field**: Type text and see real-time updates
- **Textarea**: Multi-line text input with auto-resize
- **Card Components**: Nested card layouts and styling
- **Badge System**: Add/remove badges dynamically
- **Real-time Test Results**: See interaction logs in real-time

**Expected Results:** 
- All components respond immediately to interaction
- Test results appear in the bottom panel
- Visual feedback for all button clicks and form inputs

### 2. Student Profile Demo ✅ WORKING
**URL:** `http://localhost:5173/demo/student-profile`

**What to Test:**
- **UK Educational System**: Select Year Groups (Year 7-13) and see Key Stage auto-mapping
- **IB Programme System**: Select IB programmes (PYP, MYP, DP, CP) with year validation
- **Subject Management**: Add subjects with qualification levels and exam boards
- **Academic Level Validation**: Try selecting incompatible combinations
- **Form Validation**: Leave fields empty and see validation messages
- **Responsive Design**: Resize browser window to test mobile layout

**Expected Results:**
- Form updates without backend calls (demo mode)
- All validation rules work in real-time
- Academic system switching prevents conflicts

### 3. Authentication Pages ✅ WORKING

#### Registration Page
**URL:** `http://localhost:5173/register`

**Test Cases:**
- **Password Strength**: Watch strength indicator change as you type
- **Email Validation**: Try invalid email formats
- **Form Validation**: Submit with missing fields
- **Password Confirmation**: Enter mismatched passwords

#### Login Page  
**URL:** `http://localhost:5173/login`

**Test Cases:**
- **Form Submission**: Try with fake credentials
- **Validation**: Submit empty form
- **Navigation**: Use "Forgot Password" and "Register" links

#### Password Reset Flow
**URL:** `http://localhost:5173/forgot-password`

**Test Cases:**
- **Email Submission**: Enter any email address
- **Form Validation**: Submit empty form
- **Navigation**: Return to login page

### 4. Demo Pages ✅ WORKING

#### Component Test Page
**URL:** `http://localhost:5173/test/components`
- Interactive testing environment for all UI components
- Real-time feedback and test result logging

#### Student Profile Test
**URL:** `http://localhost:5173/test/student-profile`
- API integration testing (if backend is running)
- Profile creation and validation testing

## 📱 Device & Browser Testing

### Quick Responsive Test
1. **Desktop**: Full browser window - check all layouts
2. **Tablet**: Resize to ~768px wide - check responsive behavior
3. **Mobile**: Resize to ~375px wide - check mobile layout

### Browser Compatibility Test
Test the component pages on:
- Chrome (primary)
- Firefox 
- Safari (if on Mac)
- Edge

## 🔧 Backend API Testing (If Running)

### Authentication Endpoints
```bash
# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "role": "STUDENT"
  }'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com", 
    "password": "TestPassword123!"
  }'
```

### Search API (New Feature)
```bash
# Get available filters
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/search/filters

# Basic tutor search
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/search/tutors

# Search with filters
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/search/tutors?subjects[]=Mathematics&levels[]=GCSE"
```

## ✅ Test Checklist

### Frontend Components (No Backend Required)
- [ ] **Component Test Page**: All UI components work and show feedback
- [ ] **Button Variants**: Default, outline, secondary buttons respond to clicks
- [ ] **Form Inputs**: Text input, textarea show real-time value updates
- [ ] **Badge System**: Add/remove badges dynamically
- [ ] **Card Layouts**: Nested cards display properly
- [ ] **Responsive Design**: Works on mobile, tablet, desktop sizes

### Authentication UI (Frontend Only)
- [ ] **Registration Form**: Password strength indicator works
- [ ] **Login Form**: Form validation prevents empty submission
- [ ] **Password Reset**: Form accepts email input
- [ ] **Navigation**: All page links work correctly
- [ ] **Form Validation**: Proper error messages for invalid input

### Student Profile Demo (Frontend Only)
- [ ] **UK System**: Year Group selection auto-maps to Key Stages
- [ ] **IB System**: Programme selection enables year validation
- [ ] **Subject Management**: Add/remove subjects with proper validation
- [ ] **Academic Validation**: Prevents UK + IB system conflicts
- [ ] **Form Validation**: Required field validation works
- [ ] **Responsive Layout**: Mobile-friendly design

### Backend APIs (If Running)
- [ ] **Health Check**: `GET http://localhost:5000/health` returns OK
- [ ] **Registration**: Can create new user accounts
- [ ] **Login**: Can authenticate users
- [ ] **Search Filters**: Returns available subjects and levels
- [ ] **Tutor Search**: Returns structured search results

## 🚨 Known Issues (Don't Test These)

### Currently Broken/Unavailable
- **Tutor Profile Management**: Disabled due to TypeScript errors
- **Full Authentication Flow**: Email verification requires email service setup
- **File Uploads**: Requires Cloudinary or S3 configuration
- **Protected Dashboard**: Requires complete authentication setup

### TypeScript Warnings
- Various unused imports and type issues
- Don't affect functionality but prevent production builds
- Frontend runs fine in development mode despite warnings

## 🎯 5-Minute Quick Test

For a rapid demonstration:

1. **Open Component Test**: `http://localhost:5173/test/components`
   - Click all buttons, type in inputs, add/remove badges
   - Verify test results log appears

2. **Try Student Profile Demo**: `http://localhost:5173/demo/student-profile`
   - Select "Year 10" → should show "Key Stage 4"
   - Switch to "IB Diploma Programme" → should clear UK selection
   - Add a subject → modal should open with options

3. **Test Registration Form**: `http://localhost:5173/register`
   - Type weak password → strength indicator should show red
   - Type strong password → should show green
   - Try invalid email → should show validation error

4. **Check Responsiveness**: Resize browser window
   - Should adapt to mobile/tablet/desktop layouts

## 📊 Expected Test Results

### All Green (Working) ✅
- UI components respond to interaction
- Form validation shows appropriate messages  
- Responsive design adapts to screen sizes
- Navigation between pages works
- Demo functionality works without backend

### Expected Limitations 🟡
- Full authentication requires backend setup
- File uploads need cloud storage configuration
- Some advanced features disabled due to TypeScript issues
- Production build fails (development mode works fine)

This testing approach focuses on what's immediately demonstrable and interactive, giving you a clear view of the MVP's current functionality! 