# General Project Guidelines - MEDIUM PRIORITY

Project-wide architectural standards covering file organization, naming conventions, and general development practices.

## Project Structure Philosophy
When organizing code:
- Maintain clear separation of concerns between `frontend`, `backend`, and other service directories
- Follow the prescribed file organization within `src/` directories as a baseline
- Adapt structure as needed for clarity and scalability

## Naming Conventions
Apply these naming standards consistently:
- Use PascalCase for React components and TypeScript interfaces
- Use camelCase for functions, variables, and methods
- Use SCREAMING_SNAKE_CASE for constants
- Use kebab-case for file names and routes
- Prefix custom React hooks with 'use' (e.g., useAuth, useScheduling)

## Development Workflow
Follow this workflow for all development:
1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and test locally
3. Run linting: `npm run lint`
4. Commit changes: `git commit -m "feat: description"`
5. Push and create PR: `git push origin feature/feature-name`

## Code Quality Standards
For all code contributions:
- Use TypeScript strict mode
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Include proper documentation for complex logic
- Consider performance implications of changes

## Educational Platform Specific Guidelines
When working on this Tutoring CRM Platform:
- Always consider the educational context in feature design
- Prioritize accessibility for diverse learning needs
- Consider multi-generational users (students, parents, tutors)
- Design for various devices and connection speeds
- Implement features with educational best practices in mind

## Documentation Standards
For all project documentation:
- Keep README files updated with current setup instructions
- Document API endpoints with examples
- Include troubleshooting guides for common issues
- Maintain architecture decision records (ADRs)
- Document deployment and operational procedures

## Dependency Management
When managing project dependencies:
- Regularly update dependencies for security patches
- Evaluate new dependencies for necessity and security
- Use exact versions in production environments
- Document any custom patches or modifications
- Monitor for deprecated packages and plan migrations

## Environment Configuration
For environment management:
- Use environment variables for all configuration
- Maintain separate configurations for each environment
- Document all required environment variables
- Use secure methods for sharing sensitive configuration
- Implement configuration validation on startup

## Regular Maintenance
Perform these maintenance tasks regularly:
- Update dependencies weekly
- Review and update documentation
- Analyze user behavior for UX improvements
- Monitor performance metrics
- Conduct security reviews

## Code Review Standards
For all code reviews:
- Review for security implications
- Check for proper error handling
- Verify test coverage for new features
- Ensure documentation is updated
- Validate accessibility considerations
- Check for performance implications

## Git Workflow Standards
Follow these Git practices:
- Use descriptive commit messages
- Keep commits focused and atomic
- Use conventional commit format
- Squash commits before merging
- Tag releases with semantic versioning
- Maintain clean commit history

## Communication Guidelines
For team communication:
- Use clear, descriptive issue titles
- Include reproduction steps for bugs
- Provide context for feature requests
- Document decisions in appropriate channels
- Share knowledge through code comments and documentation