# Backend Development Guidelines - HIGH PRIORITY

Standards for TypeScript usage, API design principles, database optimization, and performance considerations for server-side development.

## TypeScript and Code Quality
When working with backend code:
- Use TypeScript for all new backend code with `strict` mode enabled in `tsconfig.json`
- Define interfaces or types for all API request bodies, responses, service layer function parameters/returns, and database models
- Use proper type annotations and actively avoid the `any` type, especially in critical data paths
- Use ESLint and Prettier with consistent configuration for code linting and formatting

## Database and API Design
For all database and API operations:
- Use connection pooling for database connections to manage resources efficiently
- Implement proper database indexing for performance on frequently queried columns and relationships
- Follow RESTful API design principles consistently (proper HTTP methods, status codes, resource-based URLs)
- Version APIs (e.g., `/api/v1/`) from the start to manage changes gracefully
- Implement pagination for all list endpoints that can return large numbers of items
- Use proper HTTP status codes and provide clear, structured error responses
- Add API documentation using OpenAPI/Swagger and keep it updated

## Performance and Scalability
When implementing backend features:
- Implement caching strategies with tools like Redis for frequently accessed data or expensive computations
- Optimize database queries and avoid N+1 query problems, especially with ORMs like Prisma
- Consider using message queues (RabbitMQ, Kafka) for offloading long-running tasks

## Real-time Communication
For Socket.io or WebSocket implementations:
- Implement proper authentication and authorization for socket connections
- Use rooms/namespaces effectively for multi-tenant isolation or targeted communication
- Implement heartbeat/ping mechanisms to monitor connection health
- Add rate limiting for real-time events to prevent abuse
- Ensure efficient data serialization and deserialization for messages

## Project Structure Standards
Organize backend code following this structure:
```
backend/src/
├── config/              # Environment variables, configuration settings
├── controllers/         # Request handlers, route logic
├── middleware/          # Express.js middleware (auth, error handling, logging)
├── routes/              # API route definitions
├── services/            # Business logic, interaction with data layers
├── types/               # Custom TypeScript types and interfaces
├── utils/               # Utility functions
└── server.ts            # Main application entry point
```

## Naming Conventions
- Use PascalCase for class names and TypeScript interfaces/types
- Use camelCase for functions, variables, and methods
- Use kebab-case for file names (e.g., `user.service.ts`, `auth.routes.ts`)

## Code Generation Requirements
When generating backend code for this Tutoring CRM Platform, always include:
- Robust validation using Zod or similar for all API endpoints
- Proper authentication and authorization checks for sensitive operations
- Database schema suggestions with proper relationships and indexing for educational data
- Error handling that doesn't expose internal system details
- Appropriate caching strategies for data-heavy operations
- FERPA compliance considerations for student data handling
- Audit logging for educational record access