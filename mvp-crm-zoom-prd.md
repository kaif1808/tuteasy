# MVP PRD: Tutoring CRM with External Video Calling

## Executive Summary

This document defines the Minimum Viable Product (MVP) for a tutoring Customer Relationship Management (CRM) platform with external Zoom integration. The MVP focuses purely on core CRM functionality while leveraging Zoom's API for video conferencing, providing a foundation for future internal video conferencing development.

## MVP Scope and Timeline

### Development Timeline: 3 Months
- **Month 1**: User management and authentication
- **Month 2**: Scheduling and payment systems  
- **Month 3**: Zoom integration and polish

### Target Launch Date: 3 months from project start

## Target Users

### Primary Users
- **Tutoring Agencies**: Managing 5-50 tutors with multiple students each
- **Freelance Tutors**: Individual tutors seeking professional CRM capabilities

### Secondary Users
- **Students**: End users booking and attending sessions
- **Parents**: Monitoring student progress (for minors)

## Core MVP Features (Must Have)

### 1. User Authentication & Authorization
**User Stories**:
- As a tutor, I want to create an account so I can manage my tutoring business
- As a student, I want to register so I can book tutoring sessions
- As an admin, I want role-based access to manage the platform

**Technical Requirements**:
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, Tutor, Student, Parent)
- Password reset functionality via email
- Two-factor authentication optional for enhanced security
- Session management with 30-minute idle timeout

**Acceptance Criteria**:
- Users can register with email verification
- Secure login/logout functionality
- Password requirements enforced (8+ chars, mixed case, numbers)
- Role-based dashboard redirection after login

### 2. Tutor Profile Management
**User Stories**:
- As a tutor, I want to create a comprehensive profile showcasing my expertise
- As a student, I want to view tutor qualifications to make informed decisions
- As an agency, I want to manage multiple tutor profiles efficiently

**Technical Requirements**:
- Profile creation wizard with step-by-step guidance
- File upload for credentials and certificates (PDF, images)
- Subject expertise with proficiency levels
- Availability calendar integration
- Hourly rate settings with different rates for different subjects
- Bio and introduction video upload capability

**Acceptance Criteria**:
- Complete profile creation in under 10 minutes
- Profile visibility controls (public/private sections)
- Real-time profile completion percentage
- Mobile-responsive profile viewing

### 3. Student Profile & Management
**User Stories**:
- As a student, I want to maintain my learning profile and preferences
- As a tutor, I want to track student progress and session history
- As a parent, I want to monitor my child's tutoring activities

**Technical Requirements**:
- Student registration with grade level and subjects
- Learning goals and preferences tracking
- Session history with notes and ratings
- Parent account linking for minors
- Progress tracking dashboard
- Document storage for assignments and resources

**Acceptance Criteria**:
- Students can set learning objectives
- Progress visualization with charts/graphs
- Secure parent access for users under 18
- Session feedback system for continuous improvement

### 4. Session Scheduling System
**User Stories**:
- As a student, I want to easily book available time slots with my preferred tutor
- As a tutor, I want to manage my availability and accept/decline bookings
- As an agency, I want to see overall scheduling patterns and utilization

**Technical Requirements**:
- Calendar integration with Google Calendar and Outlook
- Real-time availability display with timezone handling
- Automated booking confirmations and reminders
- Recurring session scheduling capability
- Conflict detection and resolution
- Cancellation and rescheduling with policy enforcement

**Acceptance Criteria**:
- One-click booking for available slots
- Email/SMS reminders 24 hours and 1 hour before sessions
- Easy rescheduling with automatic notifications
- Mobile calendar sync functionality

### 5. Zoom Integration for Video Calls
**User Stories**:
- As a tutor, I want to automatically create Zoom meetings for my sessions
- As a student, I want to easily join my tutoring session with one click
- As an agency, I want centralized management of all video sessions

**Technical Requirements**:
- Zoom API integration for meeting creation and management
- Automatic meeting link generation for scheduled sessions
- Meeting recording capabilities (with consent)
- Waiting room and security features enabled by default
- Meeting URL distribution via email and in-app notifications
- Session attendance tracking

**Acceptance Criteria**:
- Zoom meetings auto-created for all scheduled sessions
- Students receive join links 15 minutes before session start
- Meeting security features (password, waiting room) enabled
- One-click join from platform dashboard

### 6. Payment Processing
**User Stories**:
- As a student, I want to securely pay for tutoring sessions online
- As a tutor, I want to receive payments automatically after session completion
- As an agency, I want to handle payment processing with transparent fee structure

**Technical Requirements**:
- Stripe integration for secure payment processing
- Multiple payment methods (credit card, debit card, digital wallets)
- Automated invoicing and receipt generation
- Commission calculation and distribution for agencies
- Refund management for cancelled sessions
- Payment history and reporting

**Acceptance Criteria**:
- PCI-compliant payment processing
- Instant payment confirmation and receipts
- Automated tutor payouts within 24-48 hours
- Clear fee breakdown for all parties

### 7. Session History & Management
**User Stories**:
- As a tutor, I want to track all my completed sessions and earnings
- As a student, I want to access my learning history and materials
- As an agency, I want comprehensive reporting on all activities

**Technical Requirements**:
- Complete session database with searchable records
- Session notes and feedback system
- File attachment capability for session materials
- Rating and review system for quality assurance
- Export functionality for reports and records
- Integration with Zoom for automatic session recording links

**Acceptance Criteria**:
- All sessions logged automatically upon completion
- Tutor and student can add private notes
- Searchable session history with filters
- Downloadable session reports

### 8. Email Notifications & Communication
**User Stories**:
- As a user, I want timely notifications about important platform activities
- As a tutor, I want to communicate with students through the platform
- As an agency, I want automated communication workflows

**Technical Requirements**:
- Email notification system using SendGrid or similar service
- In-app messaging system between tutors and students
- SMS notifications for critical events (session starting soon)
- Customizable notification preferences
- Email templates for common communications
- Automated follow-up sequences

**Acceptance Criteria**:
- Users receive notifications within 1 minute of trigger events
- Email deliverability rate >95%
- Users can customize notification preferences
- Mobile push notifications for urgent communications

## Secondary Features (Should Have - Phase 1.5)

### Calendar Integration Enhancement
- Two-way sync with external calendars
- Bulk availability updates
- Holiday and vacation management

### Basic Reporting Dashboard
- Session completion rates
- Revenue tracking for tutors
- Student progress summaries
- Platform usage analytics

### Document Sharing
- Secure file sharing between tutors and students
- Assignment submission and feedback system
- Resource library for educational materials

### Recurring Session Management
- Automated weekly/monthly session booking
- Subscription-style pricing options
- Advanced scheduling rules

## Technical Architecture

### Frontend Stack
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for global state
- **Build Tool**: Vite for fast development and builds
- **Calendar**: React Big Calendar for scheduling interface
- **Forms**: React Hook Form with Zod validation

### Backend Stack
- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with connection pooling
- **ORM**: Prisma for type-safe database operations
- **Authentication**: JWT with Passport.js
- **File Storage**: AWS S3 or Cloudinary for document uploads
- **Email**: SendGrid for transactional emails

### Third-party Integrations
- **Video Calling**: Zoom API for meeting management
- **Payments**: Stripe for secure payment processing
- **Calendar**: Google Calendar and Outlook APIs
- **Notifications**: SendGrid for email, Twilio for SMS

### Infrastructure
- **Frontend Hosting**: Vercel for optimal React deployment
- **Backend Hosting**: Railway for Node.js applications
- **Database**: PlanetScale for managed PostgreSQL
- **CDN**: Automatic with Vercel Edge Network
- **Monitoring**: Sentry for error tracking
- **Analytics**: Vercel Analytics for performance metrics

## Security Requirements

### Data Protection
- All data encrypted in transit (HTTPS) and at rest (AES-256)
- GDPR compliance with data export and deletion capabilities
- COPPA compliance for users under 13
- FERPA guidelines for educational records

### Authentication Security
- Bcrypt password hashing with salt rounds ≥ 12
- JWT tokens with 24-hour expiration
- Rate limiting on authentication endpoints
- Optional two-factor authentication

### API Security
- API rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration for production domains
- SQL injection prevention through ORM usage

## Performance Requirements

### Response Times
- Page load times: <3 seconds on 4G networks
- API response times: <500ms for 95% of requests
- Real-time notifications: <1 second delivery
- File uploads: Progress indicators for files >5MB

### Scalability
- Support for 100 concurrent users initially
- Database optimization with proper indexing
- Caching strategy with Redis for frequently accessed data
- CDN usage for static assets

## User Experience Requirements

### Design Principles
- Mobile-first responsive design
- Intuitive navigation with minimal clicks to key actions
- Consistent design system across all interfaces
- Accessibility compliance (WCAG 2.1 AA)

### Key User Flows
1. **Tutor Onboarding**: Account creation → Profile setup → Availability setting (15 minutes)
2. **Student Booking**: Browse tutors → Select time slot → Payment → Confirmation (5 minutes)
3. **Session Joining**: Dashboard → Join session → Zoom launch (30 seconds)

## Success Metrics

### User Adoption
- 10+ active tutors within first month
- 50+ students registered within 3 months
- 70%+ user retention rate after first session

### Platform Performance
- 99.5% uptime during business hours
- <3 second average page load time
- 95%+ successful payment processing rate

### Business Metrics
- 80%+ session completion rate
- Average session rating >4.5/5
- Monthly recurring revenue growth >20%

## Risk Mitigation

### Technical Risks
- **Zoom API Rate Limits**: Implement proper throttling and error handling
- **Payment Processing Issues**: Comprehensive testing with Stripe test mode
- **Database Performance**: Proper indexing and query optimization from start
- **Security Vulnerabilities**: Regular security audits and dependency updates

### Business Risks
- **User Adoption**: Early user research and feedback incorporation
- **Competition**: Focus on superior user experience and agency features
- **Zoom Dependency**: Plan for future internal video conferencing development

## Development Milestones

### Month 1 Milestones
- Week 1-2: Project setup, authentication system
- Week 3: Tutor profile management
- Week 4: Student profile and basic dashboard

### Month 2 Milestones
- Week 5-6: Scheduling system with calendar integration
- Week 7: Payment processing with Stripe
- Week 8: Session management and history

### Month 3 Milestones
- Week 9-10: Zoom API integration and testing
- Week 11: Email notifications and communication features
- Week 12: Polish, testing, and deployment preparation

## Post-MVP Roadmap

### Phase 2: Enhanced Features (Months 4-6)
- Advanced analytics and reporting
- Mobile app development
- Advanced communication features
- API for third-party integrations

### Phase 3: Internal Video Conferencing (Months 7-9)
- Custom WebRTC implementation
- Interactive whiteboard development
- Session recording capabilities
- MyTutor feature parity

## Budget Considerations

### Development Costs (3 Months)
- Infrastructure: $97/month × 3 = $291
- Third-party services: $50/month × 3 = $150
- Development tools and resources: $200 one-time
- **Total MVP Investment**: ~$641

### Ongoing Operational Costs
- Monthly infrastructure: $97
- Transaction fees: 2.9% + $0.30 per Stripe transaction
- Zoom API: Pay-per-use pricing
- **Estimated Monthly Operating Cost**: $120-200 depending on usage

This MVP provides a solid foundation for a tutoring CRM platform while keeping development focused and achievable within the 3-month timeline. The external Zoom integration allows for immediate video conferencing capabilities while the internal video platform is developed in subsequent phases.