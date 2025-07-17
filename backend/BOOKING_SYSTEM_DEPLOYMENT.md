# TutEasy Booking System Deployment Guide

## Overview
This guide covers the deployment of the complete booking system backend API for TutEasy, including database migrations, API endpoints, and verification procedures.

## Prerequisites
- PostgreSQL database running
- Node.js and npm installed
- Environment variables configured
- Existing TutEasy backend setup

## Database Migration

### 1. Apply Prisma Migration
```bash
cd backend
npx prisma migrate deploy
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Verify Database Schema
```bash
npx prisma db pull
npx prisma studio
```

## Environment Variables
Ensure the following environment variables are set:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tuteasy_db"

# JWT Configuration
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
PORT=3000
NODE_ENV="production"
```

## API Endpoints

### Booking Endpoints
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get bookings with filtering and pagination
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking
- `POST /api/bookings/:id/confirm` - Confirm booking (tutor only)
- `POST /api/bookings/:id/complete` - Mark booking as completed

### Availability Endpoints
- `POST /api/availability` - Create availability slot (tutor only)
- `PUT /api/availability/:id` - Update availability slot (tutor only)
- `DELETE /api/availability/:id` - Delete availability slot (tutor only)
- `GET /api/availability/tutors/:tutorId` - Get tutor's availability slots
- `GET /api/availability/tutors/:tutorId/dates` - Get available dates
- `GET /api/availability/tutors/:tutorId/slots` - Get available time slots

## Testing

### Run Unit Tests
```bash
npm test
```

### Run Integration Tests
```bash
npm run test:integration
```

### Run Test Coverage
```bash
npm run test:coverage
```

### Expected Coverage Targets
- Lines: 90%+
- Functions: 90%+
- Branches: 85%+
- Statements: 90%+

## Verification Checklist

### Database Verification
- [ ] `tutor_availability` table created with correct schema
- [ ] `bookings` table created with correct schema
- [ ] All foreign key constraints are properly set
- [ ] Indexes are created for performance optimization
- [ ] Enums are created for `LessonType`, `TeachingMode`, `BookingStatus`

### API Verification
- [ ] All booking endpoints respond correctly
- [ ] All availability endpoints respond correctly
- [ ] Authentication middleware works properly
- [ ] Validation middleware catches invalid requests
- [ ] Error handling returns proper error codes and messages

### Business Logic Verification
- [ ] Booking creation prevents conflicts
- [ ] Availability checking works correctly
- [ ] Pricing calculation is accurate
- [ ] Permission checks prevent unauthorized access
- [ ] Status transitions follow business rules

## Performance Considerations

### Database Optimization
- Indexes on frequently queried fields
- Proper foreign key relationships
- Efficient query patterns in services

### API Optimization
- Pagination for list endpoints
- Proper caching headers
- Rate limiting configured

## Security Measures

### Authentication & Authorization
- JWT token validation on all protected endpoints
- Role-based access control (RBAC)
- User permission checks for resource access

### Data Validation
- Zod schema validation on all inputs
- SQL injection prevention through Prisma ORM
- XSS protection through input sanitization

### Error Handling
- No sensitive information in error responses
- Proper HTTP status codes
- Structured error response format

## Monitoring & Logging

### Health Checks
- Database connectivity check
- API endpoint health verification
- Service dependency checks

### Logging
- Request/response logging
- Error logging with stack traces
- Performance metrics logging

## Rollback Procedure

If issues arise during deployment:

1. **Database Rollback**
   ```bash
   npx prisma migrate reset
   # Apply previous migration
   ```

2. **Code Rollback**
   ```bash
   git revert <commit-hash>
   npm run build
   pm2 restart tuteasy-backend
   ```

3. **Verification**
   - Run health checks
   - Verify existing functionality
   - Check error logs

## Post-Deployment Tasks

1. **Monitor System Performance**
   - Check response times
   - Monitor database queries
   - Watch for error rates

2. **User Acceptance Testing**
   - Test booking flow end-to-end
   - Verify availability management
   - Test error scenarios

3. **Documentation Updates**
   - Update API documentation
   - Update user guides
   - Update development documentation

## Support & Troubleshooting

### Common Issues

1. **Migration Fails**
   - Check database connectivity
   - Verify user permissions
   - Check for conflicting data

2. **API Endpoints Not Working**
   - Verify server restart
   - Check route registration
   - Validate middleware configuration

3. **Authentication Issues**
   - Verify JWT secret configuration
   - Check token expiration settings
   - Validate user permissions

### Contact Information
For deployment issues, contact the development team or refer to the main project documentation.

## Success Criteria

Deployment is considered successful when:
- [ ] All database migrations applied successfully
- [ ] All API endpoints return expected responses
- [ ] All tests pass with required coverage
- [ ] End-to-end booking flow works correctly
- [ ] Performance meets requirements (<200ms response time)
- [ ] Security measures are properly implemented
- [ ] Monitoring and logging are functional
