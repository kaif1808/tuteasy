# Cursor Rules for Tutoring CRM Platform Development

## Security Rules - Critical for Educational Data

### API Key and Secret Management
- NEVER hardcode API keys, database credentials, or any secrets in source code
- Use environment variables (.env files) for all sensitive configuration
- Add .env files to .gitignore immediately when creating the project
- Use different environment files for development, staging, and production
- Rotate API keys regularly and use least-privilege principles

### Authentication and Authorization
- Implement JWT tokens with expiration times (max 24 hours)
- Use bcrypt with salt rounds ≥ 12 for password hashing
- Require strong passwords: minimum 8 characters, mixed case, numbers, symbols
- Implement role-based access control (RBAC) for tutors, students, and admins
- Add rate limiting to login endpoints to prevent brute force attacks
- Implement session timeout for idle users (30 minutes max)

### Data Protection and Privacy
- Validate and sanitize ALL user inputs on both client and server
- Use parameterized queries or ORM to prevent SQL injection
- Implement CORS properly - never use wildcard (*) in production
- Encrypt sensitive data at rest using AES-256
- Use HTTPS everywhere - no HTTP in production
- Implement proper error handling without exposing system details

### Educational Data Compliance
- Follow FERPA guidelines for student educational records
- Implement COPPA compliance for users under 13
- Add GDPR compliance features (data export, deletion, consent)
- Log access to student data for audit trails
- Implement data retention policies

## Development Best Practices

### TypeScript and Code Quality
- Use TypeScript for all new code - enable strict mode
- Define interfaces for all API responses and data structures
- Use proper type annotations - avoid 'any' type
- Implement proper error boundaries in React components
- Use ESLint and Prettier with consistent configuration
- Write unit tests for critical business logic functions

### Database and API Design
- Use connection pooling for database connections
- Implement proper database indexing for performance
- Follow RESTful API design principles consistently
- Version your APIs (e.g., /api/v1/) from the start
- Implement pagination for list endpoints
- Use proper HTTP status codes and error responses
- Add API documentation with OpenAPI/Swagger

### Performance and Scalability
- Implement caching strategies with Redis for frequently accessed data
- Use lazy loading for React components where appropriate
- Optimize database queries - avoid N+1 query problems
- Implement proper image optimization and CDN usage
- Use React.memo() for expensive component re-renders
- Implement virtual scrolling for large lists

### Real-time Communication
- Use Socket.io with proper authentication
- Implement connection handling and reconnection logic
- Add rate limiting for real-time events
- Use rooms/namespaces for multi-tenant isolation
- Implement heartbeat/ping mechanisms for connection health

## AI Assistant Guidelines

### Code Generation Standards
- Always include proper TypeScript types in code suggestions
- Provide error handling for all async operations
- Include loading states and error states in React components
- Suggest testing strategies for new features
- Recommend security considerations for each feature
- Include accessibility best practices (ARIA labels, keyboard navigation)

### Architecture Recommendations
- Suggest scalable patterns (e.g., composition over inheritance)
- Recommend separation of concerns in component design
- Provide database schema suggestions with proper relationships
- Suggest caching strategies for data-heavy operations
- Recommend monitoring and logging implementations

### Video Conferencing Specific Rules
- Always handle camera/microphone permission requests gracefully
- Implement proper WebRTC error handling and fallbacks
- Use STUN/TURN servers for NAT traversal
- Implement bandwidth optimization based on connection quality
- Add proper cleanup for media streams to prevent memory leaks

## Project Structure Standards

### File Organization
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI elements (Button, Input, etc.)
│   └── features/        # Feature-specific components
├── pages/               # Page components and routing
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
├── services/            # API calls and external services
├── stores/              # State management (Zustand stores)
├── constants/           # Application constants
└── assets/              # Static assets
```

### Naming Conventions
- Use PascalCase for React components and TypeScript interfaces
- Use camelCase for functions, variables, and methods
- Use SCREAMING_SNAKE_CASE for constants
- Use kebab-case for file names and routes
- Prefix custom hooks with 'use' (e.g., useAuth, useScheduling)

## Testing Guidelines

### Unit Testing
- Write tests for all utility functions
- Test custom hooks using React Testing Library
- Mock external dependencies properly
- Aim for >80% code coverage on critical paths
- Use descriptive test names that explain expected behavior

### Integration Testing
- Test API endpoints with proper authentication
- Test real-time communication features
- Test payment processing flows (use test mode)
- Test file upload and video calling features

## Deployment and Monitoring

### Environment Management
- Use separate environments: development, staging, production
- Implement proper CI/CD with GitHub Actions
- Use Docker for consistent deployment environments
- Implement health checks for all services
- Set up proper logging with structured log format

### Monitoring and Alerting
- Implement error tracking with Sentry
- Monitor application performance and user experience
- Set up alerts for critical failures (payment processing, video calls)
- Track key business metrics (user registration, session completion)
- Monitor infrastructure costs and usage

## Emergency Procedures

### Incident Response
- Have rollback procedures ready for deployments
- Implement circuit breakers for external API calls
- Have communication plan for downtime notifications
- Keep emergency contact information updated
- Document common troubleshooting steps

## Regular Maintenance

### Security Updates
- Update dependencies weekly
- Run security audits monthly
- Review access logs quarterly
- Conduct penetration testing before major releases
- Update security documentation as features are added

### Performance Reviews
- Monitor and optimize database query performance
- Review and update caching strategies
- Analyze user behavior for UX improvements
- Optimize bundle sizes and loading times
- Review and update API rate limits

---

## Quick Reference Commands

### Development Setup
```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Run tests
npm test

# Check TypeScript
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

### Security Checks
```bash
# Audit dependencies
npm audit

# Check for secrets in code
git secrets --scan

# Run security linting
npm run lint:security
```

Remember: Security is not optional when handling educational data. When in doubt, choose the more secure option.