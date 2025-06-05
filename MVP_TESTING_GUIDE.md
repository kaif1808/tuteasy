# TutEasy MVP Testing Guide

This guide provides comprehensive testing instructions for all visible parts of the TutEasy MVP, including authentication flows, profile management, and UI components.

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+ LTS
- PostgreSQL 15+
- Git

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with these variables:
cat > .env << 'EOF'
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
EOF

# Setup database
npm run prisma:generate
npm run prisma:migrate

# Start backend server
npm run dev
```

Backend will be running on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory (in new terminal)
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

Frontend will be running on `http://localhost:5173`

## 🧪 Testing Scenarios

### 1. Authentication System Testing

#### A. User Registration Flow
**URL:** `http://localhost:5173/register`

**Test Cases:**
1. **Valid Registration**
   - Fill form: Name, Email, Password, Confirm Password, Role
   - Password requirements: 8+ chars, uppercase, lowercase, number, special char
   - Expected: Success message, redirect to email verification notice

2. **Password Strength Validation**
   - Try weak passwords: `123`, `password`, `Password1`
   - Expected: Real-time strength indicator updates, validation errors

3. **Email Validation**
   - Try invalid emails: `test`, `test@`, `@domain.com`
   - Expected: Validation errors prevent submission

4. **Password Confirmation**
   - Enter different passwords in confirmation field
   - Expected: Validation error for password mismatch

5. **Duplicate Email**
   - Register with existing email address
   - Expected: Server error message about existing account

#### B. Login Flow
**URL:** `http://localhost:5173/login`

**Test Cases:**
1. **Valid Login**
   - Use registered credentials
   - Expected: Redirect to dashboard

2. **Invalid Credentials**
   - Wrong email or password
   - Expected: Error message, account lockout after 5 attempts

3. **Unverified Email**
   - Login with unverified account
   - Expected: Redirect to email verification notice

4. **Remember Me** (if implemented)
   - Check remember me box
   - Expected: Longer session duration

#### C. Password Reset Flow
**URL:** `http://localhost:5173/forgot-password`

**Test Cases:**
1. **Request Password Reset**
   - Enter registered email
   - Expected: Success message (email sent simulation)

2. **Invalid Email**
   - Enter unregistered email
   - Expected: Generic success message (security best practice)

3. **Reset Password with Token**
   - Navigate to: `http://localhost:5173/reset-password?token=test-token`
   - Enter new password and confirmation
   - Expected: Success message, redirect to login

#### D. Email Verification
**URL:** `http://localhost:5173/verify-email?token=test-token`

**Test Cases:**
1. **Valid Verification Token**
   - Expected: Success message, account activated
2. **Invalid/Expired Token**
   - Expected: Error message with resend option

### 2. Dashboard Testing

#### Role-Based Dashboard Access
**URL:** `http://localhost:5173/dashboard` (requires login)

**Test Cases by Role:**
1. **Tutor Dashboard**
   - Create tutor account and login
   - Expected: Tutor-specific interface with profile management options

2. **Student Dashboard**
   - Create student account and login
   - Expected: Student-specific interface with profile creation

3. **Parent Dashboard**
   - Create parent account and login
   - Expected: Parent-specific interface with child management options

4. **Admin Dashboard**
   - Create admin account and login
   - Expected: Admin interface with user management capabilities

### 3. Student Profile Management Testing

#### A. Enhanced Student Profile Form
**URL:** `http://localhost:5173/student-profile` (requires student login)

**Test Cases:**
1. **UK Educational System**
   - Select UK Year Group (e.g., Year 10)
   - Expected: Automatic Key Stage derivation (KS4)
   - Add subjects: Should only allow GCSE-appropriate subjects

2. **IB Programme System**
   - Select IB Diploma Programme
   - Select Year 1 or 2
   - Expected: IB-specific subject options and validation

3. **Subject Interest Management**
   - Click "Add Subject Interest"
   - Select subject, qualification level, exam board, target grade
   - Expected: Modal opens, validation prevents incompatible combinations

4. **Academic Level Validation**
   - Try selecting both UK and IB systems
   - Expected: Validation error preventing dual selection

5. **Profile Completeness**
   - Fill out partial information
   - Expected: Progress indicator updates, shows completion percentage

#### B. Student Profile Demo
**URL:** `http://localhost:5173/demo/student-profile`

**Test Cases:**
1. **Demo Mode Functionality**
   - All form interactions without authentication
   - Expected: Full form functionality, no backend calls

2. **Form Validation**
   - Test all validation rules in safe environment
   - Expected: Real-time validation feedback

#### C. Student Profile API Test
**URL:** `http://localhost:5173/test/student-profile`

**Test Cases:**
1. **API Integration Testing**
   - Create, read, update profile data
   - Expected: Successful API calls, data persistence

2. **Error Handling**
   - Test network failures, validation errors
   - Expected: Proper error messages, graceful degradation

### 4. UI Component Testing

#### A. Component Test Suite
**URL:** `http://localhost:5173/test/components`

**Test Cases:**
1. **Button Component**
   - Test default, outline, secondary variants
   - Expected: Visual feedback, click handlers work

2. **Input Component**
   - Type in text field, test validation states
   - Expected: Real-time value updates, error states

3. **Textarea Component**
   - Enter multi-line text
   - Expected: Auto-resize, character counting (if implemented)

4. **Card Component**
   - Nested card display
   - Expected: Proper layout, responsive design

5. **Badge Component**
   - Add/remove badges dynamically
   - Expected: Visual updates, interaction feedback

### 5. Tutor Profile Management Testing
**Note:** Currently disabled due to TypeScript errors

When available, test these features:
1. **Profile Information**
   - Bio, hourly rates, teaching preferences
   - Expected: Form validation, data persistence

2. **Subject Management**
   - Add/edit/delete teaching subjects
   - Expected: CRUD operations, UK/IB qualification support

3. **Qualification Management**
   - Upload qualification documents
   - Expected: File upload, verification status tracking

4. **Profile Image Upload**
   - Upload and crop profile images
   - Expected: Image processing, storage integration

### 6. Search System Testing (Backend Only)

#### API Testing with curl/Postman
**Base URL:** `http://localhost:5000/api/search`

**Test Cases:**
1. **Basic Search**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        "http://localhost:5000/api/search/tutors"
   ```

2. **Subject Filtering**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        "http://localhost:5000/api/search/tutors?subjects[]=Mathematics&subjects[]=Physics"
   ```

3. **Qualification Level Filtering**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        "http://localhost:5000/api/search/tutors?levels[]=GCSE&levels[]=A_LEVEL"
   ```

4. **Keyword Search**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        "http://localhost:5000/api/search/tutors?keywords=experienced%20cambridge"
   ```

5. **Pagination and Sorting**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        "http://localhost:5000/api/search/tutors?page=2&limit=5&sortBy=experience&sortOrder=desc"
   ```

6. **Search Statistics**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        "http://localhost:5000/api/search/tutors/statistics"
   ```

7. **Filter Options**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        "http://localhost:5000/api/search/filters"
   ```

## 📱 Responsive Design Testing

### Device Testing
Test on different screen sizes:
1. **Desktop (1920x1080)**
   - Full feature access
   - Multi-column layouts

2. **Tablet (768x1024)**
   - Responsive navigation
   - Touch-friendly interactions

3. **Mobile (375x667)**
   - Stacked layouts
   - Mobile-optimized forms

### Browser Testing
Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## ♿ Accessibility Testing

### Manual Testing
1. **Keyboard Navigation**
   - Tab through all interactive elements
   - Expected: Logical focus order, visible focus indicators

2. **Screen Reader Testing**
   - Use browser screen reader
   - Expected: All content announced, proper ARIA labels

3. **Color Contrast**
   - Check text/background contrast ratios
   - Expected: WCAG AA compliance (4.5:1 minimum)

### Automated Testing
Use browser dev tools accessibility scanner:
1. Open Chrome DevTools → Lighthouse
2. Run accessibility audit
3. Expected: Score of 90+ with minimal issues

## 🐛 Common Issues and Solutions

### Frontend Issues
1. **Port Conflicts**
   - If 5173 is busy, Vite will auto-increment
   - Check console for actual port

2. **Build Errors**
   - Run `npm run build` to check for TypeScript errors
   - Fix any type issues before testing

3. **Network Errors**
   - Ensure backend is running on port 5000
   - Check CORS configuration

### Backend Issues
1. **Database Connection**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env

2. **JWT Secret Issues**
   - Ensure JWT secrets are at least 32 characters
   - Use different secrets for access and refresh tokens

3. **File Upload Issues**
   - Configure Cloudinary or use local storage
   - Check file size and type restrictions

## 📊 Test Results Tracking

### Create Test Report
For each test session, document:

1. **Environment Details**
   - Browser/device used
   - Date and time
   - Tester name

2. **Test Results**
   - Pass/Fail for each test case
   - Screenshots of issues
   - Steps to reproduce bugs

3. **Performance Notes**
   - Page load times
   - API response times
   - User experience feedback

### Sample Test Report Template

```
# Test Session Report

**Date:** [Date]
**Tester:** [Name]
**Environment:** [Browser/Device]
**Backend Version:** [Git commit hash]
**Frontend Version:** [Git commit hash]

## Authentication Tests
- [ ] Registration Flow: PASS/FAIL
- [ ] Login Flow: PASS/FAIL
- [ ] Password Reset: PASS/FAIL
- [ ] Email Verification: PASS/FAIL

## Profile Management Tests
- [ ] Student Profile Creation: PASS/FAIL
- [ ] UK/IB System Selection: PASS/FAIL
- [ ] Subject Management: PASS/FAIL
- [ ] Form Validation: PASS/FAIL

## UI Component Tests
- [ ] Button Interactions: PASS/FAIL
- [ ] Form Inputs: PASS/FAIL
- [ ] Card Layouts: PASS/FAIL
- [ ] Responsive Design: PASS/FAIL

## Issues Found
1. [Description of issue]
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshot (if applicable)

## Performance Notes
- Page load times: [Average time]
- API response times: [Average time]
- Overall user experience: [Rating 1-10]
```

## 🎯 Success Criteria

The MVP is considered successfully tested when:

1. ✅ All authentication flows work without errors
2. ✅ Student profile management is fully functional
3. ✅ UI components render and interact properly
4. ✅ Forms validate correctly and show appropriate errors
5. ✅ Responsive design works on mobile, tablet, and desktop
6. ✅ Accessibility standards are met
7. ✅ Backend APIs respond correctly to all test scenarios
8. ✅ No critical security vulnerabilities are present
9. ✅ Performance is acceptable (< 3s page loads)
10. ✅ Error handling provides clear feedback to users

This comprehensive testing ensures the TutEasy MVP is ready for user acceptance testing and production deployment! 