# Security Standards - CRITICAL PRIORITY

These security rules are mandatory for all development work involving sensitive student and tutor information in this educational platform. When working with this Tutoring CRM Platform, always prioritize security over convenience.

## API Key and Secret Management
- NEVER hardcode API keys, database credentials, or any secrets in source code
- Use environment variables (.env files) for all sensitive configuration
- Add .env files to .gitignore immediately when creating the project
- Use different environment files for development, staging, and production
- Rotate API keys regularly and use least-privilege principles

## Authentication and Authorization
- Implement JWT tokens with expiration times (max 24 hours)
- Use bcrypt with salt rounds ≥ 12 for password hashing
- Require strong passwords: minimum 8 characters, mixed case, numbers, symbols
- Implement role-based access control (RBAC) for tutors, students, and admins
- Add rate limiting to login endpoints to prevent brute force attacks
- Implement session timeout for idle users (30 minutes max)

## Data Protection and Privacy
- Validate and sanitize ALL user inputs on both client and server
- Use parameterized queries or ORM to prevent SQL injection
- Implement CORS properly - never use wildcard (*) in production
- Encrypt sensitive data at rest using AES-256
- Use HTTPS everywhere - no HTTP in production
- Implement proper error handling without exposing system details

## Educational Data Compliance
- Follow FERPA guidelines for student educational records
- Implement COPPA compliance for users under 13
- Add GDPR compliance features (data export, deletion, consent)
- Log access to student data for audit trails
- Implement data retention policies

## File Access Restrictions
Files containing sensitive data MUST NOT be read or accessed:
- .env
- .env.local
- .env.production
- config/secrets.json
- prisma/.env
- Any file containing "secret", "key", or "credential" in the name

## Security Enforcement Rules
When generating or modifying code:
- Always check for hardcoded secrets and suggest environment variables instead
- Ensure all database queries use parameterized statements
- Verify authentication middleware is present on protected routes
- Confirm input validation is implemented for all user-facing endpoints
- Check that error messages don't expose internal system details

**Remember: Security is not optional when handling educational data. When in doubt, choose the more secure option.**
