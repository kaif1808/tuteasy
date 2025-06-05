# Database Schema Documentation

## Overview

The TutEasy platform uses PostgreSQL as its primary database with Prisma ORM for type-safe database access. This document outlines the complete database schema for the MVP version.

## Core Tables

### Users Table
Stores all user accounts regardless of role (tutors, students, parents, administrators).

```sql
CREATE TABLE users (
    id VARCHAR(30) PRIMARY KEY DEFAULT generate_cuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'STUDENT',
    status user_status NOT NULL DEFAULT 'ACTIVE',
    last_login TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

### Tutor Profiles
Extended profile information for users with the TUTOR role.

```sql
CREATE TABLE tutor_profiles (
    id VARCHAR(30) PRIMARY KEY DEFAULT generate_cuid(),
    user_id VARCHAR(30) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    profile_image_url VARCHAR(500),
    hourly_rate DECIMAL(10,2) NOT NULL,
    subjects TEXT[], -- Denormalized array of combined subject strings (e.g., "A-Level Economics", "GCSE Maths") for display. Primary data in tutor_subjects table.
    qualifications TEXT[], -- Denormalized array of qualification summaries for display. Primary data in tutor_qualifications table.
    experience_years INTEGER DEFAULT 0,
    languages TEXT[] DEFAULT ARRAY['English'],
    timezone VARCHAR(50) DEFAULT 'UTC',
    verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_sessions INTEGER DEFAULT 0,
    total_students INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tutor_profiles_user_id ON tutor_profiles(user_id);
CREATE INDEX idx_tutor_profiles_subjects ON tutor_profiles USING GIN(subjects);
CREATE INDEX idx_tutor_profiles_verified ON tutor_profiles(verified);
CREATE INDEX idx_tutor_profiles_rating ON tutor_profiles(rating);
```

### Student Profiles
Extended profile information for users with the STUDENT role.
Supports both UK educational system (Year Groups/Key Stages) and International Baccalaureate programmes.

```sql
CREATE TABLE student_profiles (
    id VARCHAR(30) PRIMARY KEY DEFAULT generate_cuid(),
    user_id VARCHAR(30) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id VARCHAR(30) REFERENCES users(id),
    
    -- UK Educational System
    uk_year_group uk_year_group,           -- e.g., 'YEAR_10', 'YEAR_13'
    uk_key_stage uk_key_stage,             -- e.g., 'KS4', 'KS5' (can be derived but stored for performance)
    
    -- International Baccalaureate System
    ib_programme ib_programme,             -- e.g., 'PYP', 'MYP', 'DP', 'CP'
    ib_year INTEGER,                       -- Programme year (e.g., 1, 2 for DP; 1-5 for MYP)
    
    -- Display field for mixed or custom academic levels
    academic_level_display VARCHAR(100),   -- e.g., "Year 10", "IB DP Year 1", "Mixed Year 12/IB DP"
    
    -- School Information
    school_name VARCHAR(200),
    school_type school_type,               -- Using enum for consistency
    
    -- Learning Profile
    subjects_of_interest TEXT[],           -- e.g., ["A-Level Maths", "IB Physics HL", "GCSE History"]
    learning_goals TEXT,
    special_needs TEXT,
    preferred_learning_style VARCHAR(50),  -- e.g., "Visual", "Kinesthetic", "Auditory"
    
    -- System Fields
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints to ensure valid academic level combinations
    CONSTRAINT valid_academic_system CHECK (
        (uk_year_group IS NOT NULL AND uk_key_stage IS NOT NULL AND ib_programme IS NULL AND ib_year IS NULL) OR
        (ib_programme IS NOT NULL AND ib_year IS NOT NULL AND uk_year_group IS NULL AND uk_key_stage IS NULL) OR
        (academic_level_display IS NOT NULL AND uk_year_group IS NULL AND uk_key_stage IS NULL AND ib_programme IS NULL AND ib_year IS NULL)
    ),
    
    -- IB year validation
    CONSTRAINT valid_ib_year CHECK (
        (ib_programme = 'PYP' AND ib_year BETWEEN 1 AND 6) OR
        (ib_programme = 'MYP' AND ib_year BETWEEN 1 AND 5) OR  
        (ib_programme = 'DP' AND ib_year BETWEEN 1 AND 2) OR
        (ib_programme = 'CP' AND ib_year BETWEEN 1 AND 2) OR
        (ib_programme IS NULL AND ib_year IS NULL)
    )
);

-- Indexes
CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX idx_student_profiles_parent_id ON student_profiles(parent_id);
CREATE INDEX idx_student_profiles_uk_year_group ON student_profiles(uk_year_group);
CREATE INDEX idx_student_profiles_uk_key_stage ON student_profiles(uk_key_stage);
CREATE INDEX idx_student_profiles_ib_programme ON student_profiles(ib_programme);
CREATE INDEX idx_student_profiles_school_type ON student_profiles(school_type);
```

### Availability
Stores tutor availability schedules.

```sql
CREATE TABLE availability (
    id VARCHAR(30) PRIMARY KEY DEFAULT generate_cuid(),
    tutor_id VARCHAR(30) NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_recurring BOOLEAN DEFAULT true,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Indexes
CREATE INDEX idx_availability_tutor_id ON availability(tutor_id);
CREATE INDEX idx_availability_day_of_week ON availability(day_of_week);
```

### Sessions
Stores all tutoring sessions (scheduled, completed, and cancelled).

```sql
CREATE TABLE sessions (
    id VARCHAR(30) PRIMARY KEY DEFAULT generate_cuid(),
    tutor_id VARCHAR(30) NOT NULL REFERENCES tutor_profiles(id),
    student_id VARCHAR(30) NOT NULL REFERENCES student_profiles(id),
    subject VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    status session_status NOT NULL DEFAULT 'SCHEDULED',
    zoom_meeting_id VARCHAR(100),
    zoom_join_url VARCHAR(500),
    zoom_password VARCHAR(50),
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    cancelled_by VARCHAR(30) REFERENCES users(id),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    price DECIMAL(10,2) NOT NULL,
    currency currency_code DEFAULT 'GBP',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_tutor_id ON sessions(tutor_id);
CREATE INDEX idx_sessions_student_id ON sessions(student_id);
CREATE INDEX idx_sessions_scheduled_at ON sessions(scheduled_at);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_subject ON sessions(subject);
```

### Session Notes
Stores notes and feedback for completed sessions.

```sql
CREATE TABLE session_notes (
    id VARCHAR(30) PRIMARY KEY DEFAULT generate_cuid(),
    session_id VARCHAR(30) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    author_id VARCHAR(30) NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false,
    attachments JSONB, -- Array of attachment objects
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_session_notes_session_id ON session_notes(session_id);
CREATE INDEX idx_session_notes_author_id ON session_notes(author_id);
```

### Reviews
Stores reviews and ratings for sessions.

```sql
CREATE TABLE reviews (
    id VARCHAR(30) PRIMARY KEY DEFAULT generate_cuid(),
    session_id VARCHAR(30) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    reviewer_id VARCHAR(30) NOT NULL REFERENCES users(id),
    reviewee_id VARCHAR(30) NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_session_review UNIQUE (session_id, reviewer_id)
);

-- Indexes
CREATE INDEX idx_reviews_session_id ON reviews(session_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
```

### Messages
Stores direct messages between users.

```sql
CREATE TABLE messages (
    id VARCHAR(30) PRIMARY KEY DEFAULT generate_cuid(),
    sender_id VARCHAR(30) NOT NULL REFERENCES users(id),
    recipient_id VARCHAR(30) NOT NULL REFERENCES users(id),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    attachments JSONB, -- Array of attachment objects
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

### Payments
Stores all payment transactions.

```sql
CREATE TABLE payments (
    id VARCHAR(30) PRIMARY KEY DEFAULT generate_cuid(),
    session_id VARCHAR(30) NOT NULL REFERENCES sessions(id),
    payer_id VARCHAR(30) NOT NULL REFERENCES users(id),
    payee_id VARCHAR(30) NOT NULL REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    currency currency_code DEFAULT 'GBP',
    status payment_status NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_charge_id VARCHAR(255),
    stripe_refund_id VARCHAR(255),
    platform_fee DECIMAL(10,2) DEFAULT 0.00,
    tutor_earnings DECIMAL(10,2) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    refund_reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_session_id ON payments(session_id);
CREATE INDEX idx_payments_payer_id ON payments(payer_id);
CREATE INDEX idx_payments_payee_id ON payments(payee_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
```

### Notifications
Stores system notifications for users.

```sql
CREATE TABLE notifications (
    id VARCHAR(30) PRIMARY KEY DEFAULT generate_cuid(),
    user_id VARCHAR(30) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional data for the notification
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### Audit Logs
Stores audit trail for compliance and security.

```sql
CREATE TABLE audit_logs (
    id VARCHAR(30) PRIMARY KEY DEFAULT generate_cuid(),
    user_id VARCHAR(30) REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(30),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type_id ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

## Enums

```sql
-- User roles
CREATE TYPE user_role AS ENUM ('ADMIN', 'TUTOR', 'STUDENT', 'PARENT');

-- User status
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');

-- UK Year Groups (Complete UK educational system)
CREATE TYPE uk_year_group AS ENUM (
    'NURSERY',
    'RECEPTION', 
    'YEAR_1', 'YEAR_2', 'YEAR_3', 'YEAR_4', 'YEAR_5', 'YEAR_6',
    'YEAR_7', 'YEAR_8', 'YEAR_9', 'YEAR_10', 'YEAR_11', 'YEAR_12', 'YEAR_13'
);

-- UK Key Stages
CREATE TYPE uk_key_stage AS ENUM (
    'EARLY_YEARS',  -- Nursery, Reception
    'KS1',          -- Years 1-2 (Ages 5-7)
    'KS2',          -- Years 3-6 (Ages 7-11)  
    'KS3',          -- Years 7-9 (Ages 11-14)
    'KS4',          -- Years 10-11 (Ages 14-16, GCSE level)
    'KS5'           -- Years 12-13 (Ages 16-18, A-Level/BTEC level)
);

-- International Baccalaureate Programmes
CREATE TYPE ib_programme AS ENUM (
    'PYP',          -- Primary Years Programme (Ages 3-12)
    'MYP',          -- Middle Years Programme (Ages 11-16)
    'DP',           -- Diploma Programme (Ages 16-19)
    'CP'            -- Career-related Programme (Ages 16-19)
);

-- Academic Level/Qualification Levels (for subject teaching)
CREATE TYPE qualification_level AS ENUM (
    'EARLY_YEARS',
    'PRIMARY',
    'KS1', 'KS2', 'KS3',
    'GCSE', 'IGCSE',
    'A_LEVEL', 'AS_LEVEL',
    'BTEC_LEVEL_1', 'BTEC_LEVEL_2', 'BTEC_LEVEL_3',
    'IB_PYP',
    'IB_MYP', 
    'IB_DP_SL',     -- Standard Level
    'IB_DP_HL',     -- Higher Level
    'IB_CP',
    'UNDERGRADUATE', 'POSTGRADUATE',
    'ADULT_EDUCATION',
    'OTHER'
);

-- Tutor Qualification Types (formal qualifications held by tutors)
CREATE TYPE tutor_qualification_type AS ENUM (
    -- Degrees
    'BACHELORS_DEGREE', 'MASTERS_DEGREE', 'DOCTORAL_DEGREE',
    -- Teaching Qualifications
    'QTS',              -- Qualified Teacher Status
    'PGCE',             -- Postgraduate Certificate in Education
    'PGDE',             -- Postgraduate Diploma in Education
    'TEACHING_DIPLOMA', 'TEACHING_CERTIFICATE',
    -- IB Specific Qualifications
    'IB_CERTIFICATE_TEACHING_LEARNING',     -- IB Certificate in Teaching and Learning
    'IB_ADVANCED_CERTIFICATE',             -- IB Advanced Certificate
    'IB_LEADERSHIP_CERTIFICATE',           -- IB Leadership Certificate
    'IB_SUBJECT_WORKSHOP_CERTIFICATE',     -- Subject-specific workshop certificates
    'IB_CATEGORY_1_WORKSHOP',              -- IB Category 1 Workshop
    'IB_CATEGORY_2_WORKSHOP',              -- IB Category 2 Workshop
    'IB_CATEGORY_3_WORKSHOP',              -- IB Category 3 Workshop
    -- UK Academic Qualifications (when held as credentials)
    'A_LEVEL_QUALIFICATION', 'GCSE_QUALIFICATION',
    'BTEC_QUALIFICATION',
    -- Professional Qualifications
    'DBS_CHECK',            -- Disclosure and Barring Service
    'SAFEGUARDING_CERTIFICATE',
    'FIRST_AID_CERTIFICATE',
    -- Subject-Specific Professional Qualifications
    'PROFESSIONAL_CERTIFICATION',  -- e.g., CPA, ACCA, etc.
    'LANGUAGE_PROFICIENCY',        -- e.g., CELTA, TESOL
    'MUSIC_QUALIFICATION',         -- e.g., ABRSM Grade 8, Diploma
    'OTHER'
);

-- School Types (UK Educational Institutions)
CREATE TYPE school_type AS ENUM (
    'STATE_COMPREHENSIVE',
    'STATE_GRAMMAR',
    'ACADEMY',
    'FREE_SCHOOL',
    'INDEPENDENT_SCHOOL',
    'SIXTH_FORM_COLLEGE',
    'FE_COLLEGE',               -- Further Education
    'INTERNATIONAL_SCHOOL',
    'SPECIAL_SCHOOL',
    'PUPIL_REFERRAL_UNIT',
    'HOME_EDUCATED',
    'OTHER'
);

-- Currency codes
CREATE TYPE currency_code AS ENUM ('GBP', 'USD', 'EUR', 'CAD', 'AUD');

-- Session status
CREATE TYPE session_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- Payment status  
CREATE TYPE payment_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- Verification status
CREATE TYPE verification_status AS ENUM ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- Notification types
CREATE TYPE notification_type AS ENUM (
    'SESSION_SCHEDULED',
    'SESSION_REMINDER', 
    'SESSION_CANCELLED',
    'SESSION_COMPLETED',
    'PAYMENT_RECEIVED',
    'PAYMENT_FAILED',
    'MESSAGE_RECEIVED',
    'REVIEW_RECEIVED',
    'PROFILE_VERIFIED',
    'QUALIFICATION_VERIFIED',
    'SYSTEM_ANNOUNCEMENT'
);
```

## Database Functions

### Generate CUID Function
```sql
CREATE OR REPLACE FUNCTION generate_cuid() RETURNS VARCHAR(30) AS $$
BEGIN
    -- Implementation of CUID generation
    -- This is a placeholder - use a proper CUID library
    RETURN 'c' || substr(md5(random()::text || clock_timestamp()::text), 1, 29);
END;
$$ LANGUAGE plpgsql;
```

### Update Updated At Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutor_profiles_updated_at BEFORE UPDATE ON tutor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... (apply to all tables with updated_at)
```

## Security Considerations

1. **Row Level Security (RLS)**: Implement RLS policies to ensure users can only access their own data
2. **Encryption**: Sensitive fields should be encrypted at rest
3. **Audit Trail**: All data modifications should be logged in audit_logs
4. **Data Retention**: Implement policies for data deletion and anonymization
5. **Backup Strategy**: Regular automated backups with point-in-time recovery

## Performance Optimization

1. **Indexing Strategy**: Create indexes on frequently queried columns
2. **Partitioning**: Consider partitioning large tables (sessions, audit_logs) by date
3. **Connection Pooling**: Use PgBouncer or similar for connection pooling
4. **Query Optimization**: Regular EXPLAIN ANALYZE on slow queries
5. **Caching**: Implement Redis caching for frequently accessed data

## Migration Strategy

1. Use Prisma migrations for schema changes
2. Always test migrations on staging environment first
3. Maintain backward compatibility during deployments
4. Document all schema changes in migration files
5. Implement rollback procedures for critical changes 

### Tutor Subjects
Stores the specific subjects a tutor teaches and at what level.
The combination of subject_name and qualification_level forms the offering, e.g., "A-Level Economics", "IB Physics HL".

```sql
CREATE TABLE tutor_subjects (
    id VARCHAR(30) PRIMARY KEY DEFAULT generate_cuid(),
    tutor_id VARCHAR(30) NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    subject_name VARCHAR(100) NOT NULL,        -- e.g., "Mathematics", "Physics", "Economics", "English Literature"
    qualification_level qualification_level NOT NULL, -- Using enum for validation
    years_experience INTEGER CHECK (years_experience >= 0),
    exam_boards TEXT[],                        -- e.g., ["AQA", "Edexcel", "OCR"] for UK subjects
    
    -- Additional metadata for IB subjects
    ib_subject_group VARCHAR(50),              -- e.g., "Group 1: Studies in Language and Literature"
    ib_language VARCHAR(50),                   -- For language subjects, e.g., "English", "Spanish"
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate subject/level combinations per tutor
    UNIQUE(tutor_id, subject_name, qualification_level)
);

-- Indexes
CREATE INDEX idx_tutor_subjects_tutor_id ON tutor_subjects(tutor_id);
CREATE INDEX idx_tutor_subjects_name_level ON tutor_subjects(subject_name, qualification_level);
CREATE INDEX idx_tutor_subjects_qualification_level ON tutor_subjects(qualification_level);
CREATE INDEX idx_tutor_subjects_exam_boards ON tutor_subjects USING GIN(exam_boards);
```

### Tutor Qualifications  
Stores formal qualifications held by tutors, such as degrees, teaching certificates, and background checks.
Includes comprehensive support for UK and IB-specific qualifications.

```sql
CREATE TABLE tutor_qualifications (
    id VARCHAR(30) PRIMARY KEY DEFAULT generate_cuid(),
    tutor_id VARCHAR(30) NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    qualification_type tutor_qualification_type NOT NULL, -- Using enum for validation
    qualification_name VARCHAR(255) NOT NULL,             -- e.g., "BSc Computer Science", "IB Certificate in Teaching and Learning"
    institution VARCHAR(255),                             -- Institution that awarded the qualification
    subject_specialization VARCHAR(255),                  -- e.g., "Mathematics", "Physics", "Primary Education"
    grade_or_classification VARCHAR(100),                 -- e.g., "First Class Honours", "Pass", "Merit"
    
    -- Document management
    document_url VARCHAR(500),                            -- Link to uploaded certificate/document
    document_filename VARCHAR(255),                       -- Original filename for reference
    verification_status verification_status DEFAULT 'PENDING',
    verified_by VARCHAR(30) REFERENCES users(id),        -- Admin who verified the qualification
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,                              -- Notes from verification process
    
    -- Dates
    issue_date DATE,
    expiry_date DATE,                                     -- For qualifications that expire (DBS, First Aid, etc.)
    
    -- Additional metadata for specific qualification types
    awarding_body VARCHAR(255),                           -- e.g., "University of Cambridge", "IBO", "Edexcel"
    certificate_number VARCHAR(100),                      -- Official certificate/reference number
    cpd_hours INTEGER,                                    -- Continuing Professional Development hours (if applicable)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint to ensure expiry date is after issue date
    CONSTRAINT valid_date_range CHECK (expiry_date IS NULL OR expiry_date > issue_date)
);

-- Indexes
CREATE INDEX idx_tutor_qualifications_tutor_id ON tutor_qualifications(tutor_id);
CREATE INDEX idx_tutor_qualifications_type ON tutor_qualifications(qualification_type);
CREATE INDEX idx_tutor_qualifications_verification_status ON tutor_qualifications(verification_status);
CREATE INDEX idx_tutor_qualifications_subject ON tutor_qualifications(subject_specialization);
CREATE INDEX idx_tutor_qualifications_expiry ON tutor_qualifications(expiry_date) WHERE expiry_date IS NOT NULL;
```

## Data Migration Strategy

### Overview
This section outlines the migration strategy for adapting existing data to the UK educational conventions and IB support.

### 1. Student Academic Level Migration

#### US Grade Level to UK Year Group Mapping
```sql
-- Migration mapping table for grade level conversion
CREATE TEMPORARY TABLE grade_level_mapping AS
SELECT 
    us_grade, uk_year_group, uk_key_stage, typical_age_range
FROM (VALUES 
    -- Early Years
    ('Pre-K', 'NURSERY', 'EARLY_YEARS', '3-4'),
    ('Kindergarten', 'RECEPTION', 'EARLY_YEARS', '4-5'),
    
    -- Primary School (Key Stage 1 & 2)
    ('Grade 1', 'YEAR_2', 'KS1', '6-7'),     -- Note: US Grade 1 ≈ UK Year 2
    ('Grade 2', 'YEAR_3', 'KS2', '7-8'),
    ('Grade 3', 'YEAR_4', 'KS2', '8-9'),
    ('Grade 4', 'YEAR_5', 'KS2', '9-10'),
    ('Grade 5', 'YEAR_6', 'KS2', '10-11'),
    
    -- Secondary School (Key Stage 3)
    ('Grade 6', 'YEAR_7', 'KS3', '11-12'),
    ('Grade 7', 'YEAR_8', 'KS3', '12-13'),
    ('Grade 8', 'YEAR_9', 'KS3', '13-14'),
    
    -- GCSE Level (Key Stage 4)
    ('Grade 9', 'YEAR_10', 'KS4', '14-15'),
    ('Grade 10', 'YEAR_11', 'KS4', '15-16'),
    
    -- A-Level / IB (Key Stage 5)
    ('Grade 11', 'YEAR_12', 'KS5', '16-17'),
    ('Grade 12', 'YEAR_13', 'KS5', '17-18'),
    
    -- Special cases
    ('College Prep', 'YEAR_13', 'KS5', '17-18'),
    ('High School', NULL, NULL, 'Variable'),  -- Requires manual review
    ('University', NULL, NULL, 'Adult')       -- Convert to adult education context
) AS mapping(us_grade, uk_year_group, uk_key_stage, typical_age_range);

-- Migration script for student profiles
-- Step 1: Add new columns (already done in schema)
-- Step 2: Migrate existing data
UPDATE student_profiles sp
SET 
    uk_year_group = glm.uk_year_group::uk_year_group,
    uk_key_stage = glm.uk_key_stage::uk_key_stage,
    academic_level_display = CASE 
        WHEN glm.uk_year_group IS NOT NULL THEN glm.uk_year_group::text
        WHEN sp.grade_level LIKE '%IB%' THEN sp.grade_level -- Preserve IB references
        ELSE sp.grade_level -- Fallback for manual review
    END
FROM grade_level_mapping glm
WHERE sp.grade_level = glm.us_grade;

-- Step 3: Handle IB students (if any existing data contains IB references)
UPDATE student_profiles 
SET 
    ib_programme = CASE
        WHEN grade_level ILIKE '%PYP%' THEN 'PYP'::ib_programme
        WHEN grade_level ILIKE '%MYP%' THEN 'MYP'::ib_programme  
        WHEN grade_level ILIKE '%DP%' OR grade_level ILIKE '%diploma%' THEN 'DP'::ib_programme
        WHEN grade_level ILIKE '%CP%' OR grade_level ILIKE '%career%' THEN 'CP'::ib_programme
    END,
    ib_year = CASE
        WHEN grade_level ~ '\d+' THEN 
            CAST(regexp_replace(grade_level, '\D', '', 'g') AS INTEGER)
        ELSE 1 -- Default to year 1 if no number found
    END,
    academic_level_display = grade_level
WHERE grade_level ILIKE '%IB%' OR grade_level ILIKE '%baccalaureate%';

-- Step 4: Manual review query for unmapped records
SELECT id, user_id, grade_level, academic_level_display
FROM student_profiles 
WHERE uk_year_group IS NULL 
  AND ib_programme IS NULL 
  AND academic_level_display IS NULL;
```

#### Migration Verification Queries
```sql
-- Verify migration completeness
SELECT 
    'Total students' as metric,
    COUNT(*) as count
FROM student_profiles
UNION ALL
SELECT 
    'UK system students',
    COUNT(*)
FROM student_profiles 
WHERE uk_year_group IS NOT NULL
UNION ALL  
SELECT 
    'IB students',
    COUNT(*)
FROM student_profiles
WHERE ib_programme IS NOT NULL
UNION ALL
SELECT 
    'Custom/unmapped students', 
    COUNT(*)
FROM student_profiles
WHERE academic_level_display IS NOT NULL 
  AND uk_year_group IS NULL 
  AND ib_programme IS NULL;

-- Validate IB year constraints
SELECT id, ib_programme, ib_year
FROM student_profiles
WHERE ib_programme IS NOT NULL
  AND (
    (ib_programme = 'PYP' AND (ib_year < 1 OR ib_year > 6)) OR
    (ib_programme = 'MYP' AND (ib_year < 1 OR ib_year > 5)) OR  
    (ib_programme = 'DP' AND (ib_year < 1 OR ib_year > 2)) OR
    (ib_programme = 'CP' AND (ib_year < 1 OR ib_year > 2))
  );
```

### 2. Tutor Qualification Type Migration

#### Migration for Qualification Types
```sql
-- Create mapping for existing qualification types to new enum values
CREATE TEMPORARY TABLE qualification_type_mapping AS
SELECT old_type, new_type FROM (VALUES
    ('degree', 'BACHELORS_DEGREE'),
    ('masters', 'MASTERS_DEGREE'), 
    ('phd', 'DOCTORAL_DEGREE'),
    ('doctorate', 'DOCTORAL_DEGREE'),
    ('pgce', 'PGCE'),
    ('qts', 'QTS'),
    ('teaching certificate', 'TEACHING_CERTIFICATE'),
    ('teaching diploma', 'TEACHING_DIPLOMA'),
    ('dbs', 'DBS_CHECK'),
    ('dbs check', 'DBS_CHECK'),
    ('background check', 'DBS_CHECK'),
    ('a-level', 'A_LEVEL_QUALIFICATION'),
    ('a level', 'A_LEVEL_QUALIFICATION'),
    ('gcse', 'GCSE_QUALIFICATION'),
    ('btec', 'BTEC_QUALIFICATION'),
    ('ib certificate', 'IB_CERTIFICATE_TEACHING_LEARNING'),
    ('ib qualification', 'IB_CERTIFICATE_TEACHING_LEARNING'),
    ('safeguarding', 'SAFEGUARDING_CERTIFICATE'),
    ('first aid', 'FIRST_AID_CERTIFICATE'),
    ('professional certification', 'PROFESSIONAL_CERTIFICATION'),
    ('other', 'OTHER')
) AS mapping(old_type, new_type);

-- Migrate existing qualification types
UPDATE tutor_qualifications tq
SET qualification_type = qtm.new_type::tutor_qualification_type
FROM qualification_type_mapping qtm
WHERE LOWER(tq.qualification_type) = qtm.old_type;

-- Handle partial matches and common variations
UPDATE tutor_qualifications 
SET qualification_type = CASE
    WHEN LOWER(qualification_type) LIKE '%bachelor%' OR LOWER(qualification_type) LIKE '%bsc%' OR LOWER(qualification_type) LIKE '%ba%' THEN 'BACHELORS_DEGREE'::tutor_qualification_type
    WHEN LOWER(qualification_type) LIKE '%master%' OR LOWER(qualification_type) LIKE '%msc%' OR LOWER(qualification_type) LIKE '%ma%' THEN 'MASTERS_DEGREE'::tutor_qualification_type
    WHEN LOWER(qualification_type) LIKE '%phd%' OR LOWER(qualification_type) LIKE '%doctor%' THEN 'DOCTORAL_DEGREE'::tutor_qualification_type
    WHEN LOWER(qualification_type) LIKE '%pgce%' THEN 'PGCE'::tutor_qualification_type
    WHEN LOWER(qualification_type) LIKE '%qts%' THEN 'QTS'::tutor_qualification_type
    WHEN LOWER(qualification_type) LIKE '%dbs%' OR LOWER(qualification_type) LIKE '%disclosure%' THEN 'DBS_CHECK'::tutor_qualification_type
    WHEN LOWER(qualification_type) LIKE '%ib%' AND LOWER(qualification_type) LIKE '%certificate%' THEN 'IB_CERTIFICATE_TEACHING_LEARNING'::tutor_qualification_type
    ELSE 'OTHER'::tutor_qualification_type
END
WHERE qualification_type NOT IN (
    SELECT unnest(enum_range(NULL::tutor_qualification_type))::text
);
```

### 3. Currency Migration

#### Existing Currency Data Migration
```sql
-- Migrate currency fields from VARCHAR to enum
-- Sessions table
UPDATE sessions 
SET currency = CASE
    WHEN UPPER(currency) IN ('GBP', 'USD', 'EUR', 'CAD', 'AUD') THEN UPPER(currency)::currency_code
    WHEN UPPER(currency) = 'POUND' OR UPPER(currency) = 'STERLING' THEN 'GBP'::currency_code
    WHEN UPPER(currency) = 'DOLLAR' THEN 'USD'::currency_code  -- Assuming USD for generic 'DOLLAR'
    WHEN UPPER(currency) = 'EURO' THEN 'EUR'::currency_code
    ELSE 'GBP'::currency_code  -- Default for UK market
END;

-- Payments table  
UPDATE payments
SET currency = CASE
    WHEN UPPER(currency) IN ('GBP', 'USD', 'EUR', 'CAD', 'AUD') THEN UPPER(currency)::currency_code
    WHEN UPPER(currency) = 'POUND' OR UPPER(currency) = 'STERLING' THEN 'GBP'::currency_code
    WHEN UPPER(currency) = 'DOLLAR' THEN 'USD'::currency_code
    WHEN UPPER(currency) = 'EURO' THEN 'EUR'::currency_code
    ELSE 'GBP'::currency_code
END;
```

### 4. Subject Level Migration

#### Migrate Subject Qualification Levels
```sql
-- For tutor_subjects table, migrate string levels to enum
UPDATE tutor_subjects
SET qualification_level = CASE
    WHEN LOWER(qualification_level) = 'primary' THEN 'PRIMARY'::qualification_level
    WHEN LOWER(qualification_level) = 'ks1' OR LOWER(qualification_level) = 'key stage 1' THEN 'KS1'::qualification_level
    WHEN LOWER(qualification_level) = 'ks2' OR LOWER(qualification_level) = 'key stage 2' THEN 'KS2'::qualification_level
    WHEN LOWER(qualification_level) = 'ks3' OR LOWER(qualification_level) = 'key stage 3' THEN 'KS3'::qualification_level
    WHEN LOWER(qualification_level) = 'gcse' OR LOWER(qualification_level) = 'igcse' THEN 'GCSE'::qualification_level
    WHEN LOWER(qualification_level) = 'a-level' OR LOWER(qualification_level) = 'a level' OR LOWER(qualification_level) = 'as level' THEN 'A_LEVEL'::qualification_level
    WHEN LOWER(qualification_level) LIKE '%btec%' AND LOWER(qualification_level) LIKE '%1%' THEN 'BTEC_LEVEL_1'::qualification_level
    WHEN LOWER(qualification_level) LIKE '%btec%' AND LOWER(qualification_level) LIKE '%2%' THEN 'BTEC_LEVEL_2'::qualification_level
    WHEN LOWER(qualification_level) LIKE '%btec%' AND LOWER(qualification_level) LIKE '%3%' THEN 'BTEC_LEVEL_3'::qualification_level
    WHEN LOWER(qualification_level) LIKE '%ib%' AND LOWER(qualification_level) LIKE '%pyp%' THEN 'IB_PYP'::qualification_level
    WHEN LOWER(qualification_level) LIKE '%ib%' AND LOWER(qualification_level) LIKE '%myp%' THEN 'IB_MYP'::qualification_level
    WHEN LOWER(qualification_level) LIKE '%ib%' AND LOWER(qualification_level) LIKE '%sl%' THEN 'IB_DP_SL'::qualification_level
    WHEN LOWER(qualification_level) LIKE '%ib%' AND LOWER(qualification_level) LIKE '%hl%' THEN 'IB_DP_HL'::qualification_level
    WHEN LOWER(qualification_level) LIKE '%ib%' AND LOWER(qualification_level) LIKE '%cp%' THEN 'IB_CP'::qualification_level
    WHEN LOWER(qualification_level) LIKE '%university%' OR LOWER(qualification_level) LIKE '%undergraduate%' THEN 'UNDERGRADUATE'::qualification_level
    WHEN LOWER(qualification_level) LIKE '%postgraduate%' OR LOWER(qualification_level) LIKE '%graduate%' THEN 'POSTGRADUATE'::qualification_level
    ELSE 'OTHER'::qualification_level
END;
```

### 5. Migration Rollback Plan

#### Emergency Rollback Procedures
```sql
-- 1. Backup original data (run before migration)
CREATE TABLE student_profiles_backup AS SELECT * FROM student_profiles;
CREATE TABLE tutor_qualifications_backup AS SELECT * FROM tutor_qualifications;
CREATE TABLE tutor_subjects_backup AS SELECT * FROM tutor_subjects;

-- 2. Rollback to original schema (if needed)
-- This would involve dropping the new columns and restoring from backup
-- Should only be used in emergency situations

-- 3. Validation queries to run after migration
SELECT 'Migration Validation Report' as report_type;

-- Check for any NULL values in required enum fields
SELECT 'Students with invalid academic levels' as issue,
       COUNT(*) as count
FROM student_profiles 
WHERE uk_year_group IS NULL 
  AND ib_programme IS NULL 
  AND (academic_level_display IS NULL OR academic_level_display = '');

-- Check for any tutor qualifications that failed to migrate
SELECT 'Tutor qualifications with invalid types' as issue,
       COUNT(*) as count  
FROM tutor_qualifications
WHERE qualification_type IS NULL;

-- Check currency migration
SELECT 'Invalid currency codes' as issue,
       COUNT(*) as count
FROM sessions 
WHERE currency NOT IN ('GBP', 'USD', 'EUR', 'CAD', 'AUD');
```

### 6. Post-Migration Tasks

#### Data Quality Assurance
1. **Manual Review Required**: Any records that couldn't be automatically migrated
2. **User Communication**: Notify users of any changes to their profiles
3. **Testing**: Comprehensive testing of all CRUD operations with new schema
4. **Performance Monitoring**: Monitor query performance with new indexes
5. **Documentation Updates**: Update API documentation and frontend validation rules

#### Migration Timeline
```
Phase 1 (Week 1): Schema updates and enum creation
Phase 2 (Week 2): Data migration scripts development and testing
Phase 3 (Week 3): Staging environment migration and validation  
Phase 4 (Week 4): Production migration during maintenance window
Phase 5 (Week 5): Post-migration monitoring and cleanup
``` 