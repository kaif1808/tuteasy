# Tutor Profile Management System - Sub-PRD

## Overview
The Tutor Profile Management System serves as the foundation for tutor identity and credibility within the tutoring CRM platform. This system enables tutors to create comprehensive professional profiles, verify credentials, and manage their public presence to attract students and agencies.

## Target Users
- **Primary**: Freelance tutors, tutoring agency tutors
- **Secondary**: Students and parents browsing tutor profiles
- **Tertiary**: Agency administrators managing tutor rosters

## Feature Requirements

### Core Features (MVP)
- **Profile Creation & Editing**
  - Basic information (name, email, phone, location)
  - Professional bio and introduction (up to 500 words)
  - Profile photo upload with automatic resizing
  - Subject expertise listings: displayed as "Qualification Level Subject" (e.g., "A-Level Maths", "GCSE History"). Tutors will input Qualification Level and Subject separately.
  - Education background and qualifications (e.g., QTS, PGCE, BSc Physics, A-Levels. Explicitly mention options for UK qualifications and experience with UK exam boards like AQA, Edexcel, OCR).
  - Teaching experience history
  - **Qualification Levels (MVP)**: GCSE/IGCSE, A-Level, IB (PYP/MYP/DP/CP), BTEC, Key Stage 1-5, Primary level teaching capabilities. These levels will be selectable when a tutor adds a subject they teach.

- **Qualification Levels Specification (MVP)**
  - **GCSE/IGCSE**: General Certificate of Secondary Education and International GCSE
    - Target age group: 14-16 years
    - Key UK qualifications for this age group
    - Core subjects: Mathematics, English, Sciences, Humanities
  - **A-Level**: Advanced Level qualifications
    - Target age group: 16-18 years  
    - Advanced secondary education
    - Specialized subject focus
  - **IB (International Baccalaureate)**: Comprehensive international education programmes
    - **IB PYP (Primary Years Programme)**: Ages 3-12, inquiry-based learning framework
    - **IB MYP (Middle Years Programme)**: Ages 11-16, developing skills for academic and personal success
    - **IB DP (Diploma Programme)**: Ages 16-19, preparing students for university and life beyond
      - Standard Level (SL) and Higher Level (HL) subjects
      - Core components: Extended Essay, Theory of Knowledge, Creativity/Activity/Service
    - **IB CP (Career-related Programme)**: Ages 16-19, combining academic and career-related learning
  - **BTEC**: Business and Technology Education Council qualifications
    - Vocational qualifications, various levels corresponding to GCSE/A-Level equivalence
    - Level 1, Level 2 (GCSE equivalent), Level 3 (A-Level equivalent)
  - **Key Stages (KS1-KS5)**: Covering the complete UK educational pathway
    - **Early Years**: Nursery, Reception (Ages 3-5)
    - **KS1**: Years 1-2 (Ages 5-7) - Foundation subjects
    - **KS2**: Years 3-6 (Ages 7-11) - Building core skills
    - **KS3**: Years 7-9 (Ages 11-14) - Broad curriculum introduction
    - **KS4**: Years 10-11 (Ages 14-16) - GCSE preparation and completion
    - **KS5**: Years 12-13 (Ages 16-18) - A-Levels, BTEC Level 3, IB DP
  - **Primary**: General primary school level teaching (Early Years through Year 6)

- **Credential Verification**
  - DBS/Background check certificate upload
  - Educational certificate uploads (degree, teaching qualifications)
  - Professional reference contact information
  - Verification status indicators (pending, verified, rejected)

- **Professional Settings**
  - Hourly rate configuration per subject
  - Teaching preferences (online/in-person/hybrid)
  - Age group specializations
  - Language proficiencies

### Advanced Features (Phase 2)
- **Video Introduction**
  - 2-3 minute introduction video upload
  - Video compression and optimization
  - Thumbnail generation

- **Portfolio & Reviews**
  - Teaching portfolio uploads (lesson plans, student work examples)
  - Student review and rating system
  - Achievement badges and certifications

- **Analytics Dashboard**
  - Profile view statistics
  - Student inquiry conversion rates
  - Performance insights and suggestions

## Technical Requirements

### Recommended Tech Stack

#### Frontend
```typescript
// Core Framework
- React 18+ with TypeScript
- Vite for build optimization
- Tailwind CSS for styling
- React Hook Form for form management
- Zod for form validation

// UI Components
- Shadcn/ui component library
- React Dropzone for file uploads
- React Query (TanStack Query) for data fetching
- Framer Motion for animations

// Profile Image Handling
- React Image Crop for photo editing
- Sharp (via API) for server-side image processing
```

#### Backend
```typescript
// Core Server
- Node.js 18+ LTS
- Express.js 4.x
- TypeScript for type safety

// Database & Storage
- PostgreSQL 15+ for structured data
- Prisma ORM for database management
- AWS S3 or Cloudinary for file storage
- Redis for caching profile data

// Authentication & Security
- JWT with refresh tokens
- bcrypt for password hashing
- helmet.js for security headers
- rate limiting with express-rate-limit
```

#### File Processing
```typescript
// Image Processing
- Sharp for image optimization
- Multer for file upload handling
- File type validation
- Virus scanning integration

// Document Processing
- PDF-lib for certificate processing
- File compression utilities
```

### Database Schema

```sql
-- Tutors table
CREATE TABLE tutors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    bio TEXT,
    hourly_rate_min DECIMAL(8,2),
    hourly_rate_max DECIMAL(8,2),
    profile_image_url VARCHAR(255),
    video_intro_url VARCHAR(255),
    verification_status VARCHAR(20) DEFAULT 'pending',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tutor subjects
CREATE TABLE tutor_subjects (
    id SERIAL PRIMARY KEY,
    tutor_id INTEGER REFERENCES tutors(id),
    subject_name VARCHAR(100), -- e.g., "Mathematics", "Physics", "Economics"
    qualification_level VARCHAR(50), -- e.g., "GCSE", "A-Level", "KS3", "Degree"
    -- The combination of subject_name and qualification_level gives entries like "A-Level Physics"
    years_experience INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Qualifications (This table stores formal qualifications like degrees, teaching certs, DBS)
CREATE TABLE tutor_qualifications (
    id SERIAL PRIMARY KEY,
    tutor_id INTEGER REFERENCES tutors(id),
    qualification_type VARCHAR(50), -- e.g., "Degree", "PGCE", "QTS", "DBS Check", "A-Level Award"
    institution VARCHAR(255),
    qualification_name VARCHAR(255), -- e.g., "BSc Computer Science", "Qualified Teacher Status", "Enhanced DBS Certificate"
    document_url VARCHAR(255),
    verification_status VARCHAR(20) DEFAULT 'pending',
    issue_date DATE,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## User Stories

### As a Freelance Tutor
- I want to create a compelling profile so that students can understand my expertise
- I want to upload my credentials so that parents trust my qualifications
- I want to set different rates for different subjects so that I can price appropriately
- I want to track how many people view my profile so that I can optimize it
- I want to specify which qualification levels I teach (GCSE/IGCSE, A-Level, IB) so students can find the right level of support

### As a Student/Parent
- I want to see verified tutor credentials so that I can trust their qualifications
- I want to view tutor introduction videos so that I can get a sense of their teaching style
- I want to see transparent pricing so that I can budget appropriately
- I want to filter tutors by qualification level (GCSE/IGCSE, A-Level, IB) so I can find appropriate help for my child's curriculum

### As an Agency Administrator
- I want to verify tutor credentials efficiently so that we maintain quality standards
- I want to manage tutor profile completeness so that our listings are professional

## Success Metrics
- Profile completion rate: >90% for active tutors
- Credential verification time: <48 hours average
- Profile view to inquiry conversion: >5%
- User satisfaction rating: >4.5/5

## Security Considerations
- All uploaded documents encrypted at rest
- PII data masked in non-production environments
- GDPR-compliant data deletion capabilities
- Rate limiting on profile updates
- File type and size validation
- Virus scanning for uploaded documents

## API Endpoints

```typescript
// Profile Management
GET    /api/tutors/profile              // Get current tutor profile
PUT    /api/tutors/profile              // Update tutor profile
POST   /api/tutors/profile/image        // Upload profile image
DELETE /api/tutors/profile/image        // Delete profile image

// Subjects & Qualifications
GET    /api/tutors/subjects             // Get tutor subjects
POST   /api/tutors/subjects             // Add subject
PUT    /api/tutors/subjects/:id         // Update subject (subject_name and/or qualification_level)
DELETE /api/tutors/subjects/:id         // Remove subject

POST   /api/tutors/qualifications       // Upload formal qualification (degree, QTS, DBS)
GET    /api/tutors/qualifications       // Get formal qualifications
PUT    /api/tutors/qualifications/:id   // Update formal qualification status
DELETE /api/tutors/qualifications/:id   // Remove formal qualification

// Public Profile Views
GET    /api/tutors/:id/public           // Get public tutor profile
GET    /api/tutors/search               // Search tutors. Query params for combined subject/level, e.g. ?subject=A-Level%20Mathematics
                                       // Query params: ?qualification_levels=GCSE,A_LEVEL,IB (This might be better as a filter on the combined subject string)
```

## Implementation Timeline
- **Week 1-2**: Database setup and basic profile CRUD
- **Week 3-4**: File upload and image processing
- **Week 5-6**: Credential verification system
- **Week 7-8**: Public profile views and search
- **Week 9-10**: Testing and optimization

## Future Enhancements
- AI-powered profile optimization suggestions
- Integration with LinkedIn for automatic profile import
- Multi-language profile support
- Advanced analytics and insights
- Social media integration
- Professional network connections