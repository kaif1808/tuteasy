# TutEasy Testing Guide

## Overview

This document provides comprehensive guidelines for testing the TutEasy platform. Our testing strategy ensures high code quality, security, and reliability across all components.

## Testing Architecture

### Testing Pyramid

```
    E2E Tests (Playwright)
   ┌─────────────────────┐
   │   User Journeys     │
   │   Cross-browser     │
   │   Performance       │
   └─────────────────────┘
  
  Integration Tests (Jest + Supertest)
 ┌─────────────────────────────┐
 │   API Endpoints             │
 │   Database Operations       │
 │   Authentication Flows      │
 └─────────────────────────────┘

Unit Tests (Jest + Vitest + React Testing Library)
┌─────────────────────────────────────────────────┐
│   Controllers  │  Services  │  Components       │
│   Middleware   │  Utils     │  Hooks            │
│   Security     │  Stores    │  Validation       │
└─────────────────────────────────────────────────┘
```

## Test Coverage Requirements

### Minimum Coverage Targets
- **Critical Paths**: 90%+ coverage
- **Authentication & Security**: 95%+ coverage
- **Business Logic**: 85%+ coverage
- **UI Components**: 80%+ coverage
- **Utility Functions**: 90%+ coverage

### Coverage by Component Type

| Component Type | Target Coverage | Priority |
|----------------|-----------------|----------|
| Authentication | 95% | Critical |
| Payment Processing | 95% | Critical |
| Booking System | 90% | High |
| Profile Management | 85% | High |
| Search & Filtering | 80% | Medium |
| UI Components | 80% | Medium |

## Backend Testing

### Unit Tests

#### Controllers
- Test all HTTP endpoints
- Validate request/response handling
- Test error scenarios
- Verify authentication/authorization

```typescript
// Example: Authentication Controller Test
describe('AuthController', () => {
  it('should register user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(validUserData);
    
    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe(validUserData.email);
  });
});
```

#### Services
- Test business logic
- Mock external dependencies
- Test error handling
- Validate data transformations

```typescript
// Example: Booking Service Test
describe('BookingService', () => {
  it('should create booking with correct pricing', async () => {
    const booking = await bookingService.createBooking(userId, bookingData);
    expect(booking.totalAmount).toBe(expectedAmount);
  });
});
```

#### Security Tests
- JWT token validation
- Rate limiting enforcement
- Cookie security
- Input sanitization

### Integration Tests

#### API Endpoints
- Full request/response cycle
- Database interactions
- Authentication flows
- Error handling

```typescript
// Example: Authentication Integration Test
describe('Authentication Flow', () => {
  it('should complete registration and login flow', async () => {
    // Register user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    // Login with credentials
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: userData.email, password: userData.password });
    
    expect(loginResponse.body.accessToken).toBeDefined();
  });
});
```

### Running Backend Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Security tests
npm test -- --testPathPattern=security

# All tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

## Frontend Testing

### Component Tests

#### Authentication Components
- Form validation
- User interactions
- Error handling
- Loading states

```typescript
// Example: Login Form Test
describe('LoginForm', () => {
  it('should validate email format', async () => {
    render(<LoginForm />);
    
    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
  });
});
```

#### Profile Components
- Form submissions
- Data validation
- File uploads
- Dynamic content

#### Booking Components
- Calendar interactions
- Time slot selection
- Booking confirmation
- Payment integration

### Service Tests

#### API Service
- HTTP requests/responses
- Error handling
- Token management
- Request interceptors

```typescript
// Example: Auth Service Test
describe('AuthService', () => {
  it('should handle login with valid credentials', async () => {
    const result = await authService.login(credentials);
    expect(result.user.email).toBe(credentials.email);
  });
});
```

### Store Tests

#### State Management
- State updates
- Action dispatching
- Persistence
- Error states

### Running Frontend Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run coverage

# UI tests
npm run test:ui
```

## End-to-End Testing

### User Journeys

#### Critical Paths
1. **User Registration & Login**
   - Account creation
   - Email verification
   - Password reset
   - Session management

2. **Profile Management**
   - Profile creation/editing
   - File uploads
   - Data validation
   - Profile completion

3. **Booking Flow**
   - Tutor search
   - Availability checking
   - Booking creation
   - Payment processing

4. **Security Scenarios**
   - Authentication enforcement
   - Authorization checks
   - Session expiration
   - Rate limiting

### Cross-Browser Testing

#### Supported Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Chrome
- Mobile Safari

### Running E2E Tests

```bash
# All browsers
npx playwright test

# Specific browser
npx playwright test --project=chromium

# Debug mode
npx playwright test --debug

# Generate report
npx playwright show-report
```

## Performance Testing

### Load Testing

#### Authentication Endpoints
```bash
# Login endpoint load test
artillery run --target http://localhost:3001 \
  --config load-test-config.yml \
  scenarios/auth-load-test.yml
```

#### Critical API Endpoints
- User registration: 100 concurrent users
- Login: 200 concurrent users
- Booking creation: 50 concurrent users
- Search: 150 concurrent users

### Performance Benchmarks

| Endpoint | Target Response Time | Max Concurrent Users |
|----------|---------------------|---------------------|
| Login | < 200ms | 200 |
| Registration | < 300ms | 100 |
| Profile Load | < 150ms | 300 |
| Search | < 500ms | 150 |
| Booking | < 400ms | 50 |

## Security Testing

### Authentication Security
- JWT token validation
- Refresh token rotation
- Session management
- Password strength

### Authorization Testing
- Role-based access control
- Resource ownership
- Permission boundaries
- Privilege escalation

### Input Validation
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

### Security Test Examples

```typescript
// Rate limiting test
describe('Rate Limiting', () => {
  it('should block requests after limit exceeded', async () => {
    // Make requests up to limit
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/auth/login').send(invalidCredentials);
    }
    
    // Next request should be blocked
    const response = await request(app)
      .post('/api/auth/login')
      .send(invalidCredentials);
    
    expect(response.status).toBe(429);
  });
});
```

## CI/CD Integration

### GitHub Actions Workflow

The CI/CD pipeline runs:
1. **Code Quality Checks**
   - Linting
   - Type checking
   - Format validation

2. **Unit Tests**
   - Backend services/controllers
   - Frontend components/services

3. **Integration Tests**
   - API endpoints
   - Database operations

4. **Security Tests**
   - Vulnerability scanning
   - Security test suite

5. **E2E Tests**
   - Critical user journeys
   - Cross-browser testing

6. **Performance Tests**
   - Load testing
   - Response time validation

### Test Environment Setup

```yaml
# CI Environment Variables
NODE_ENV: test
DATABASE_URL: postgresql://test:test@localhost:5432/tuteasy_test
JWT_SECRET: test-jwt-secret-key
JWT_REFRESH_SECRET: test-refresh-secret-key
```

## Test Data Management

### Test Fixtures

#### User Data
```typescript
export const testUsers = {
  student: {
    firstName: 'Test',
    lastName: 'Student',
    email: 'student@test.com',
    role: 'STUDENT'
  },
  tutor: {
    firstName: 'Test',
    lastName: 'Tutor',
    email: 'tutor@test.com',
    role: 'TUTOR'
  }
};
```

#### Mock Data
- Use MSW for API mocking
- Consistent test data across tests
- Realistic data scenarios
- Edge case coverage

### Database Setup

#### Test Database
- Isolated test environment
- Automatic cleanup
- Seed data for integration tests
- Migration testing

## Best Practices

### Test Writing Guidelines

1. **Descriptive Test Names**
   ```typescript
   // Good
   it('should return 401 when user provides invalid credentials')
   
   // Bad
   it('should fail login')
   ```

2. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should create booking successfully', async () => {
     // Arrange
     const bookingData = { /* test data */ };
     
     // Act
     const result = await bookingService.createBooking(userId, bookingData);
     
     // Assert
     expect(result.status).toBe('PENDING');
   });
   ```

3. **Test Independence**
   - Each test should be independent
   - Clean up after each test
   - No shared state between tests

4. **Mock External Dependencies**
   - Database calls
   - External APIs
   - File system operations
   - Time-dependent functions

### Error Testing

1. **Test Error Scenarios**
   - Invalid input
   - Network failures
   - Database errors
   - Authentication failures

2. **Verify Error Messages**
   - User-friendly messages
   - Proper error codes
   - Security considerations

### Accessibility Testing

1. **Keyboard Navigation**
   - Tab order
   - Focus management
   - Keyboard shortcuts

2. **Screen Reader Support**
   - ARIA labels
   - Semantic HTML
   - Alternative text

## Debugging Tests

### Common Issues

1. **Flaky Tests**
   - Race conditions
   - Timing issues
   - External dependencies

2. **Test Isolation**
   - Shared state
   - Database cleanup
   - Mock reset

### Debugging Tools

1. **Backend**
   - Jest debug mode
   - Console logging
   - Debugger breakpoints

2. **Frontend**
   - React DevTools
   - Browser DevTools
   - Vitest UI

3. **E2E**
   - Playwright Inspector
   - Video recordings
   - Screenshots

## Continuous Improvement

### Metrics Tracking

1. **Test Coverage**
   - Line coverage
   - Branch coverage
   - Function coverage

2. **Test Performance**
   - Test execution time
   - Flaky test rate
   - Build success rate

3. **Quality Metrics**
   - Bug detection rate
   - Regression prevention
   - Code quality scores

### Regular Reviews

1. **Test Suite Health**
   - Remove obsolete tests
   - Update test data
   - Improve test performance

2. **Coverage Analysis**
   - Identify gaps
   - Prioritize improvements
   - Update targets

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)

### Tools
- **Testing Frameworks**: Jest, Vitest, Playwright
- **Assertion Libraries**: Jest matchers, Testing Library
- **Mocking**: MSW, Jest mocks
- **Coverage**: Istanbul, V8 coverage

### Support
- Internal testing guidelines
- Code review checklist
- Testing best practices
- Performance benchmarks
