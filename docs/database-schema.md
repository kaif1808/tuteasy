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

```sql
CREATE TABLE student_profiles (
    id VARCHAR(30) PRIMARY KEY DEFAULT generate_cuid(),
    user_id VARCHAR(30) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id VARCHAR(30) REFERENCES users(id),
    year_group VARCHAR(15), -- e.g., "Year 1", "Year 10", "Year 13"
    key_stage VARCHAR(10), -- e.g., "KS1", "KS2", "KS3", "KS4", "KS5" (Optional)
    school_name VARCHAR(200),
    school_type VARCHAR(50), -- e.g., "State Comprehensive", "Grammar School", "Independent School" (Optional)
    subjects_of_interest TEXT[],
    learning_goals TEXT,
    special_needs TEXT,
    preferred_learning_style VARCHAR(50),
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX idx_student_profiles_parent_id ON student_profiles(parent_id);
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
    currency VARCHAR(3) DEFAULT 'GBP',
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
    currency VARCHAR(3) DEFAULT 'GBP',
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

-- Session status
CREATE TYPE session_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- Payment status
CREATE TYPE payment_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

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
The combination of subject_name and qualification_level forms the offering, e.g., "A-Level Economics".

```sql
CREATE TABLE tutor_subjects (
    id VARCHAR(30) PRIMARY KEY DEFAULT generate_cuid(),
    tutor_id VARCHAR(30) NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    subject_name VARCHAR(100) NOT NULL, -- e.g., "Mathematics", "Physics", "Economics"
    qualification_level VARCHAR(50) NOT NULL, -- e.g., "GCSE", "A-Level", "KS3", "Primary", "Degree"
    years_experience INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tutor_subjects_tutor_id ON tutor_subjects(tutor_id);
CREATE INDEX idx_tutor_subjects_name_level ON tutor_subjects(subject_name, qualification_level);
```

### Tutor Qualifications
Stores formal qualifications held by tutors, such as degrees, teaching certificates, and background checks.

```sql
CREATE TABLE tutor_qualifications (
    id VARCHAR(30) PRIMARY KEY DEFAULT generate_cuid(),
    tutor_id VARCHAR(30) NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    qualification_type VARCHAR(100) NOT NULL, -- e.g., "Degree", "PGCE", "QTS", "DBS Check", "A-Level Award", "Subject Specific Certificate"
    qualification_name VARCHAR(255) NOT NULL, -- e.g., "BSc Computer Science", "Qualified Teacher Status", "Enhanced DBS Certificate", "Grade 8 Piano"
    institution VARCHAR(255),
    document_url VARCHAR(500), -- Link to uploaded certificate/document
    verification_status VARCHAR(20) DEFAULT 'PENDING', -- e.g., PENDING, VERIFIED, REJECTED
    issue_date DATE,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tutor_qualifications_tutor_id ON tutor_qualifications(tutor_id);
CREATE INDEX idx_tutor_qualifications_type ON tutor_qualifications(qualification_type);
CREATE INDEX idx_tutor_qualifications_verification_status ON tutor_qualifications(verification_status);
``` 