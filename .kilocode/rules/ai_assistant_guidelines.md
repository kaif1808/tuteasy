# AI Assistant Guidelines - HIGH PRIORITY

Code generation standards and architecture recommendations for the Tutoring CRM Platform.

## Code Generation Standards

### General Code Generation Principles
When generating code for this project:
- Always include proper TypeScript types in code suggestions for both frontend and backend
- Provide comprehensive error handling for all async operations and external service calls
- Include loading states and error states in React components that involve data fetching
- Suggest testing strategies for new features during implementation
- Recommend security considerations for each feature as part of the development process
- Include accessibility best practices (ARIA labels, keyboard navigation, focus management) in UI components

### Backend Code Generation
When generating backend code:
- Include robust validation (using Zod or similar) for all API endpoints
- Implement proper authentication and authorization checks for sensitive operations
- Provide database schema suggestions with proper relationships and indexing considerations
- Include proper error handling that doesn't expose internal system details
- Suggest appropriate caching strategies for data-heavy operations

### Frontend Code Generation
When generating frontend code:
- Ensure all components are properly typed with React props and state interfaces
- Include proper cleanup for effects, subscriptions, and media streams
- Implement responsive design patterns and mobile-first approaches
- Include proper form validation and user feedback mechanisms
- Consider performance implications (memoization, lazy loading, virtualization)

## Architecture Recommendations

### Scalability Patterns
When suggesting architectural solutions:
- Recommend composition over inheritance in component and service design
- Suggest proper separation of concerns (presentation vs. business logic)
- Recommend modular architecture that supports feature-based organization
- Consider future scalability when suggesting database schemas and API designs

### Security-First Approach
For all code suggestions:
- Always consider security implications when suggesting new features or modifications
- Integrate security requirements into all recommendations
- Prioritize secure defaults in all generated code
- Suggest security testing approaches for new features

### Educational Platform Specific Considerations
When working with this Tutoring CRM Platform:
- Consider FERPA compliance requirements when handling student data
- Recommend appropriate data retention and privacy controls
- Consider multi-tenant isolation for different educational institutions
- Suggest appropriate audit logging for educational data access
- Ensure video conferencing features comply with educational privacy standards
- Consider parental consent requirements for users under 13 (COPPA compliance)
- Implement appropriate session recording policies and controls

## Integration Guidelines

### Cross-Component Communication
When designing component interactions:
- Recommend appropriate state management patterns (Zustand, React Query)
- Suggest proper API design patterns for frontend-backend communication
- Consider real-time communication requirements for tutoring features
- Recommend appropriate error boundary and fallback strategies

### External Service Integration
For third-party service integrations:
- Always use environment variables for API keys and external service configuration
- Implement proper retry logic and circuit breakers for external API calls
- Consider rate limiting and quota management for third-party services
- Suggest appropriate monitoring and alerting for external service dependencies

## Quality Assurance Integration

### Testing Recommendations
When suggesting testing approaches:
- Suggest appropriate test coverage for new features (unit, integration, e2e)
- Recommend mocking strategies for external dependencies
- Include test scenarios for error conditions and edge cases
- Consider accessibility testing for UI components

### Documentation Standards
For all generated code:
- Include JSDoc comments for complex functions and business logic
- Suggest inline documentation for security-critical code sections
- Recommend API documentation updates for new endpoints
- Include usage examples in component and service documentation

## Performance Considerations

### Frontend Performance
When generating frontend code:
- Consider bundle size implications of new dependencies
- Suggest code splitting strategies for large features
- Recommend appropriate caching strategies for API calls and computed values
- Consider accessibility performance (screen reader compatibility, keyboard navigation efficiency)

### Backend Performance
When generating backend code:
- Consider database query optimization for new features
- Suggest appropriate indexing strategies for new database fields
- Recommend caching layers for expensive computations
- Consider horizontal scaling implications of new features