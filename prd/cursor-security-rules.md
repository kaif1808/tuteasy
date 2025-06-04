# Cursor Security Rules for Tutoring CRM Platform

## Overview
This file contains comprehensive Cursor IDE security rules specifically designed for solo development of an educational tutoring CRM platform. These rules enforce security best practices, educational data protection requirements, and prevent common vulnerabilities while leveraging AI assistance through Cursor.

## How to Use
Save this content as `.cursorrules` in your project root directory. Cursor will automatically apply these rules when providing AI assistance.

```javascript
// =============================================================================
// CURSOR SECURITY RULES FOR TUTORING CRM PLATFORM
// Educational Data Protection & General Security Guidelines
// =============================================================================

// Core Security Principles
You are developing an educational tutoring CRM platform that handles sensitive data including:
- Student personal information (FERPA protected)
- Parent/guardian information
- Payment data (PCI DSS requirements)
- Session recordings and educational content
- Tutor credentials and qualifications

ALWAYS prioritize security and data protection in every code suggestion.

// =============================================================================
// 1. API KEY AND SECRET MANAGEMENT
// =============================================================================

// Rule: Never hardcode sensitive credentials
NEVER include in code:
- API keys, secrets, or tokens
- Database passwords or connection strings
- Encryption keys or salts
- Third-party service credentials (Stripe, Zoom, etc.)
- JWT signing secrets

Examples of FORBIDDEN patterns:
- const API_KEY = "sk_live_abc123"
- const STRIPE_SECRET = "sk_test_xyz789"
- const JWT_SECRET = "my-secret-key"
- const DATABASE_URL = "postgresql://user:pass@host:5432/db"

ALWAYS use environment variables:
- process.env.STRIPE_SECRET_KEY
- process.env.DATABASE_URL
- process.env.JWT_SIGNING_SECRET

When suggesting environment variables, remind about .env.example file creation.

// =============================================================================
// 2. EDUCATIONAL DATA PROTECTION (FERPA/COPPA/GDPR)
// =============================================================================

// Rule: Educational records require special handling
For any code involving student data, ALWAYS:
- Implement proper access controls (students can only see their own data)
- Add audit logging for educational record access
- Include data retention policies
- Ensure parent consent mechanisms for users under 13 (COPPA)
- Implement right to data deletion (GDPR)

Student data fields requiring protection:
- grades, scores, assessments
- learning disabilities or special needs
- behavioral records
- session notes and progress reports
- attendance records

Example secure pattern:
```typescript
// GOOD: Proper student data access
app.get('/api/students/:id/grades', 
  authenticateUser,
  authorizeStudentAccess, // Check if user can access this student's data
  auditLog('student_grades_accessed'),
  (req, res) => {
    // Implementation with privacy controls
  }
);

// BAD: Direct access without authorization
app.get('/api/students/:id/grades', (req, res) => {
  // Direct database access without checking permissions
});
```

// =============================================================================
// 3. INPUT VALIDATION AND SANITIZATION
// =============================================================================

// Rule: Validate ALL user inputs
For every API endpoint, form input, or data processing:
- Use Zod or similar validation library
- Sanitize inputs before database operations
- Validate file uploads (type, size, content)
- Escape data for output contexts

Required validation patterns:
```typescript
// GOOD: Proper validation
const userSchema = z.object({
  email: z.string().email().max(255),
  firstName: z.string().min(1).max(100).regex(/^[a-zA-Z\s]+$/),
  age: z.number().int().min(5).max(120)
});

const validatedData = userSchema.parse(req.body);

// BAD: No validation
const { email, firstName, age } = req.body;
// Direct use without validation
```

// =============================================================================
// 4. AUTHENTICATION AND AUTHORIZATION
// =============================================================================

// Rule: Implement robust authentication for educational platform
ALWAYS include for auth-related code:
- Password hashing with bcrypt (minimum 12 rounds)
- JWT tokens with proper expiration (15 min access, 7 day refresh)
- Role-based access control (tutor, student, parent, admin)
- Session management with secure cookies
- Rate limiting on authentication endpoints

Required middleware for protected routes:
```typescript
// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    if (!req.user) return res.status(401).json({ error: 'Invalid token' });
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Authorization middleware for role-based access
const requireRole = (roles: string[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

// =============================================================================
// 5. DATABASE SECURITY
// =============================================================================

// Rule: Use ORM/Query Builder to prevent SQL injection
ALWAYS use Prisma ORM for database operations. NEVER use raw SQL queries unless absolutely necessary and properly parameterized.

```typescript
// GOOD: Using Prisma ORM
const user = await prisma.user.findFirst({
  where: { email: validatedEmail },
  select: { id: true, email: true, role: true } // Only select needed fields
});

// BAD: Raw SQL (vulnerable to injection)
const user = await db.query(`SELECT * FROM users WHERE email = '${email}'`);

// IF raw SQL is necessary, use parameterized queries:
const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
```

// =============================================================================
// 6. FILE UPLOAD SECURITY
// =============================================================================

// Rule: Secure file handling for educational documents
For file uploads (profile pictures, documents, session recordings):
- Validate file types and sizes
- Scan for malware
- Use secure storage (S3 with proper permissions)
- Generate unique filenames
- Implement access controls

```typescript
// GOOD: Secure file upload
const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
const maxSize = 5 * 1024 * 1024; // 5MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxSize },
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// BAD: No validation
const upload = multer({ dest: 'uploads/' });
```

// =============================================================================
// 7. ERROR HANDLING AND LOGGING
// =============================================================================

// Rule: Secure error handling without information disclosure
NEVER expose:
- Stack traces to end users
- Database error messages
- Internal system details
- File paths or system information

```typescript
// GOOD: Secure error handling
try {
  // Operation
} catch (error) {
  logger.error('Database operation failed', { 
    error: error.message, 
    userId: req.user?.id,
    endpoint: req.path 
  });
  
  res.status(500).json({ 
    error: 'Internal server error',
    errorId: generateErrorId() // For support tracking
  });
}

// BAD: Exposing sensitive information
try {
  // Operation  
} catch (error) {
  res.status(500).json({ error: error.stack }); // Exposes system details
}
```

// =============================================================================
// 8. VIDEO CONFERENCING AND COMMUNICATION SECURITY
// =============================================================================

// Rule: Secure video session management
For Zoom integration and future WebRTC implementation:
- Generate unique meeting IDs and passwords
- Implement waiting rooms
- Validate session participants
- Encrypt session recordings
- Implement access controls for recordings

```typescript
// GOOD: Secure meeting creation
const createZoomMeeting = async (sessionId: string, tutorId: string, studentId: string) => {
  // Verify participants have access to this session
  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      AND: [
        { OR: [{ tutorId }, { studentId }] }
      ]
    }
  });
  
  if (!session) {
    throw new Error('Unauthorized session access');
  }
  
  const meeting = await zoom.meetings.create({
    topic: `Session ${sessionId}`,
    type: 2,
    settings: {
      waiting_room: true,
      meeting_authentication: true,
      password: generateSecurePassword()
    }
  });
  
  return meeting;
};
```

// =============================================================================
// 9. PAYMENT PROCESSING SECURITY (PCI DSS)
// =============================================================================

// Rule: Secure payment handling with Stripe
NEVER store payment card data. Always use Stripe for PCI compliance:
- Use Stripe Elements for card input
- Implement proper webhook signature verification
- Use idempotency keys for payment operations
- Log payment events for auditing

```typescript
// GOOD: Secure payment processing
const createPaymentIntent = async (amount: number, customerId: string) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe uses cents
    currency: 'usd',
    customer: customerId,
    metadata: {
      tutorId: req.user.id,
      timestamp: Date.now()
    }
  }, {
    idempotencyKey: generateIdempotencyKey()
  });
  
  return paymentIntent;
};

// Webhook signature verification
const verifyStripeWebhook = (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    req.stripeEvent = event;
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }
};
```

// =============================================================================
// 10. CORS AND SECURITY HEADERS
// =============================================================================

// Rule: Implement proper CORS and security headers
ALWAYS configure security headers for educational platform:

```typescript
// GOOD: Proper security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
}));
```

// =============================================================================
// 11. RATE LIMITING AND DOS PROTECTION
// =============================================================================

// Rule: Implement rate limiting for API protection
ALWAYS implement rate limiting, especially for:
- Authentication endpoints
- Password reset requests
- File uploads
- API endpoints

```typescript
// GOOD: Rate limiting implementation
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/auth', authLimiter);

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later'
});

app.use('/api', generalLimiter);
```

// =============================================================================
// 12. ENVIRONMENT-SPECIFIC CONFIGURATIONS
// =============================================================================

// Rule: Different security configurations for different environments
```typescript
// GOOD: Environment-aware configuration
const config = {
  development: {
    jwtExpiration: '1h',
    logLevel: 'debug',
    enableCors: true
  },
  production: {
    jwtExpiration: '15m',
    logLevel: 'error',
    enableCors: false, // Specific origins only
    requireHttps: true
  }
};

const currentConfig = config[process.env.NODE_ENV || 'development'];
```

// =============================================================================
// 13. DEPENDENCY SECURITY
// =============================================================================

// Rule: Secure dependency management
When suggesting dependencies:
- Only suggest well-maintained, actively updated packages
- Avoid packages with known security vulnerabilities
- Prefer official libraries for security-critical operations
- Suggest regular dependency auditing

Recommended secure packages:
- Authentication: passport, jsonwebtoken
- Validation: zod, joi
- Database: prisma, knex
- Security: helmet, express-rate-limit
- Logging: winston, pino

// =============================================================================
// 14. TESTING SECURITY CONSIDERATIONS
// =============================================================================

// Rule: Include security testing
When suggesting tests, include:
- Authentication bypass tests
- Authorization tests for different roles
- Input validation tests
- SQL injection prevention tests
- XSS prevention tests

```typescript
// GOOD: Security-focused test
describe('Student data access', () => {
  it('should prevent students from accessing other students data', async () => {
    const student1Token = await getStudentToken(student1.id);
    const student2Id = student2.id;
    
    const response = await request(app)
      .get(`/api/students/${student2Id}/grades`)
      .set('Authorization', `Bearer ${student1Token}`);
      
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Insufficient permissions');
  });
});
```

// =============================================================================
// 15. MOBILE SECURITY CONSIDERATIONS
// =============================================================================

// Rule: Mobile-specific security measures
For React Native mobile app code:
- Use Keychain/Keystore for sensitive data storage
- Implement certificate pinning for API calls
- Add jailbreak/root detection
- Implement proper session management
- Use biometric authentication where appropriate

```typescript
// GOOD: Secure mobile storage
import * as Keychain from 'react-native-keychain';

const storeSecureData = async (key: string, value: string) => {
  await Keychain.setInternetCredentials(key, key, value);
};

const getSecureData = async (key: string) => {
  const credentials = await Keychain.getInternetCredentials(key);
  return credentials ? credentials.password : null;
};
```

// =============================================================================
// FINAL REMINDERS
// =============================================================================

When providing code suggestions:
1. ALWAYS consider the educational context and data sensitivity
2. Include proper error handling that doesn't leak information
3. Suggest appropriate logging for security events
4. Consider GDPR compliance for international users
5. Implement proper audit trails for educational records
6. Ensure parent consent mechanisms for minors
7. Include data retention and deletion policies
8. Consider offline security for mobile applications
9. Implement proper backup and disaster recovery considerations
10. Always suggest code review and security testing

Remember: Educational platforms are high-value targets for attackers due to the sensitive personal data they contain. Security must be built in from the start, not added as an afterthought.
```

## Additional Security Resources

### Environment Variables Template
Create a `.env.example` file with:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/tutoring_crm

# Authentication
JWT_SECRET=your-super-secure-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here

# External Services
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

ZOOM_CLIENT_ID=your-zoom-client-id
ZOOM_CLIENT_SECRET=your-zoom-client-secret
ZOOM_ACCOUNT_ID=your-zoom-account-id

# Email
SENDGRID_API_KEY=SG...
FROM_EMAIL=noreply@yourdomain.com

# Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Application
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
NODE_ENV=development
```

### Security Checklist
Before deploying:
- [ ] All secrets are in environment variables
- [ ] Input validation on all endpoints
- [ ] Authentication middleware on protected routes
- [ ] Rate limiting implemented
- [ ] HTTPS enforced in production
- [ ] Security headers configured
- [ ] File upload validation
- [ ] Error handling doesn't leak information
- [ ] Audit logging for sensitive operations
- [ ] GDPR/FERPA compliance measures
- [ ] Dependency security audit passed

### Educational Data Classification
Implement data classification for different sensitivity levels:

| Level | Data Type | Protection Required |
|-------|-----------|-------------------|
| Public | Marketing materials, general info | Basic security |
| Internal | Platform analytics, usage stats | Access controls |
| Confidential | Student grades, parent info | Encryption at rest |
| Restricted | Payment data, medical info | Full encryption + audit |

This comprehensive security framework ensures that your tutoring CRM platform meets the highest standards for educational data protection while enabling rapid development with AI assistance through Cursor.