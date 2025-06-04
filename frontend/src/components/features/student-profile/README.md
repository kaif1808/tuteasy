# Student Profile Management System

A comprehensive student profile management system for the TutEasy platform, designed to capture academic information, learning preferences, and accessibility needs.

## 🎯 Overview

The Student Profile Management system allows students (and their parents) to create and manage detailed academic profiles that help match them with suitable tutors. The system emphasizes accessibility, compliance with educational data protection standards (FERPA/COPPA), and a smooth user experience.

## 🌟 Features

### Core Functionality
- ✅ Complete student profile creation and editing
- ✅ Academic information capture (grade level, school, subjects)
- ✅ Learning preferences and style assessment
- ✅ Special accommodations and accessibility needs
- ✅ Parent-child profile linking
- ✅ Profile completeness tracking
- ✅ Real-time form validation
- ✅ Responsive design for all devices

### Security & Compliance
- 🔐 JWT authentication and authorization
- 🛡️ Input validation and sanitization
- 📋 FERPA/COPPA compliance features
- 🔒 Parent permission for minors
- 📊 Audit logging capability

## 🏗️ Architecture

### Frontend Structure
```
frontend/src/components/features/student-profile/
├── components/
│   └── StudentProfileForm.tsx      # Main form component
├── hooks/
│   └── useStudentProfile.ts        # React Query hooks
├── pages/
│   └── StudentProfilePage.tsx      # Main page component
├── services/
│   └── studentProfileApi.ts        # API service layer
├── types/
│   └── index.ts                    # TypeScript definitions
└── README.md                       # This file
```

### Backend Structure
```
backend/src/
├── controllers/
│   └── studentProfile.controller.ts
├── services/
│   └── studentProfile.service.ts
├── routes/
│   └── studentProfile.routes.ts
└── types/
    └── validation.ts
```

## 🔧 Technical Implementation

### Frontend Technologies
- **React** with **TypeScript** for component development
- **React Hook Form** with **Zod** for form validation
- **TanStack Query** for state management and API caching
- **Tailwind CSS** for responsive styling
- **Lucide React** for icons

### Backend Technologies
- **Express.js** with **TypeScript** for API development
- **Prisma ORM** with **PostgreSQL** for data persistence
- **Zod** for input validation
- **JWT** for authentication

### Database Schema
```sql
model StudentProfile {
  id                      String               @id @default(uuid())
  userId                  String               @unique
  user                    User                 @relation(fields: [userId], references: [id])
  
  parentId                String?              
  parent                  User?                @relation("StudentParent", fields: [parentId], references: [id])
  gradeLevel              String?              
  schoolName              String?
  
  subjectsOfInterest      String[]             @default([])
  learningGoals           String?              @db.Text
  specialNeeds            String?              @db.Text
  preferredLearningStyle  LearningStyle?
  
  timezone                String               @default("UTC")
  profileCompleteness     Int                  @default(0)
  
  createdAt               DateTime             @default(now())
  updatedAt               DateTime             @updatedAt
}
```

## 🎨 UI Components

### StudentProfileForm
The main form component with sections for:
- **Basic Information**: Grade level, school name, timezone
- **Subjects of Interest**: Interactive subject selection with custom additions
- **Learning Preferences**: Learning style, goals, special accommodations

### Key Features:
- Dynamic subject selection with badges
- Custom subject addition
- Learning style descriptions
- Real-time validation feedback
- Progress saving indicators

## 📡 API Endpoints

### Core Endpoints
```
GET    /api/v1/student/profile              # Get current user's profile
POST   /api/v1/student/profile              # Create new profile
PUT    /api/v1/student/profile              # Update existing profile
DELETE /api/v1/student/profile              # Delete profile

GET    /api/v1/student/profile/:studentId   # Get specific student (with access control)
GET    /api/v1/student/children             # Get children profiles (for parents)
```

### Parent Management
```
POST   /api/v1/student/link-parent          # Link parent to student
DELETE /api/v1/student/link-parent          # Unlink parent from student
```

## 🎭 Demo Usage

Visit `/demo/student-profile` to see a fully functional demo of the student profile system without authentication requirements.

### Demo Features:
- Interactive form with all functionality
- Real-time validation
- Profile preview after submission
- Technical implementation overview

## 🔄 State Management

### React Query Hooks
```typescript
// Get current user's profile
const { data, isLoading, error } = useStudentProfile();

// Create or update profile
const upsertMutation = useUpsertStudentProfile();

// Handle form submission
const handleSubmit = async (data: StudentProfileFormData) => {
  const isCreating = !profile;
  await upsertMutation.mutateAsync({ ...data, isCreating });
};
```

### Caching Strategy
- Profile data cached for 5 minutes
- Automatic cache invalidation on updates
- Optimistic updates for better UX
- Error handling with retry logic

## 🎯 Form Validation

### Frontend Validation (Zod)
```typescript
const studentProfileSchema = z.object({
  gradeLevel: z.string().optional(),
  schoolName: z.string().max(200).optional(),
  subjectsOfInterest: z.array(z.string()).default([]),
  learningGoals: z.string().max(1000).optional(),
  specialNeeds: z.string().max(1000).optional(),
  preferredLearningStyle: z.enum(['VISUAL', 'AUDITORY', 'KINESTHETIC', 'READING_WRITING', 'MULTIMODAL']).optional(),
  timezone: z.string().max(50).default('UTC'),
});
```

### Backend Validation
- Input sanitization
- Length limits
- Type checking
- Required field validation
- Parent permission verification

## 🌐 Accessibility Features

### WCAG Compliance
- ✅ Proper ARIA labels
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ High contrast mode support
- ✅ Focus management

### Special Accommodations
- Text area for detailed special needs
- Learning style preferences
- Timezone considerations
- Parent/guardian involvement

## 🔒 Security Features

### Data Protection
- All inputs validated and sanitized
- SQL injection prevention via Prisma
- XSS protection
- CSRF token validation
- Rate limiting on API endpoints

### Privacy Compliance
- FERPA compliance for educational records
- COPPA compliance for users under 13
- GDPR features (data export/deletion)
- Parental consent management
- Audit trail logging

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis (optional, for caching)

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp backend/.env.example backend/.env
# Edit .env with your database URL and JWT secrets

# Run database migrations
cd backend && npm run prisma:migrate

# Start development servers
npm run dev
```

### Development URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Demo: http://localhost:5173/demo/student-profile

## 🧪 Testing

### Manual Testing
1. Visit the demo page at `/demo/student-profile`
2. Fill out the form with various combinations
3. Test form validation by submitting incomplete data
4. Verify responsive design on different screen sizes

### Automated Testing (TODO)
- Unit tests for form validation
- Integration tests for API endpoints
- E2E tests for complete user flows

## 📈 Future Enhancements

### Planned Features
- [ ] Profile photo upload
- [ ] Learning assessment quiz
- [ ] Progress tracking dashboard
- [ ] Tutor recommendation engine
- [ ] Parent notification system
- [ ] Multi-language support

### Performance Optimizations
- [ ] Virtual scrolling for large subject lists
- [ ] Image optimization and lazy loading
- [ ] Service worker for offline support
- [ ] GraphQL migration for efficient queries

## 🤝 Contributing

1. Follow the established code style and patterns
2. Add proper TypeScript types for all new code
3. Include error handling and loading states
4. Test accessibility features
5. Update documentation for new features

## 📄 License

This student profile system is part of the TutEasy platform. See the main LICENSE file for details.

---

**Built with ❤️ for better educational experiences** 