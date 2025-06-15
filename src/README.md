# TutEasy Rovo MCP Server

A modern TypeScript-based Model Context Protocol (MCP) server designed specifically for the TutEasy tutoring platform development workflow. This server provides intelligent tools for code analysis, security auditing, test generation, and more.

## Features

### 🏗️ Architecture Analysis
- **Full stack analysis**: Comprehensive review of backend, frontend, and database architecture
- **Dependency mapping**: Analyze package dependencies and their relationships
- **Code structure evaluation**: Review directory organization and file patterns
- **Performance recommendations**: Identify bottlenecks and optimization opportunities

### 🔒 Security Auditing
- **Authentication review**: JWT implementation, password hashing, session management
- **API security**: Input validation, rate limiting, CORS configuration
- **Data protection**: Database access controls, encryption, backup security
- **Dependency scanning**: Check for known vulnerabilities in packages

### 🧪 Test Generation
- **Unit tests**: Generate comprehensive unit tests for components and services
- **Integration tests**: Create tests for API endpoints and service interactions
- **E2E tests**: Generate end-to-end test scenarios for user workflows
- **Coverage analysis**: Identify untested code paths and suggest improvements

### ♻️ Code Refactoring
- **Function extraction**: Identify and extract reusable functions
- **Class optimization**: Improve class structure and inheritance
- **Performance optimization**: Optimize loops, queries, and rendering
- **Modernization**: Convert to TypeScript, use modern ES6+ features

### 🗄️ Database Analysis
- **Schema review**: Validate relationships, indexing, and data types
- **Query optimization**: Identify slow queries and suggest improvements
- **Migration planning**: Plan and validate database migrations
- **Performance analysis**: Monitor connection pooling and caching strategies

## Installation

1. **Build the server**:
   ```bash
   npm run build
   ```

2. **Configure Cursor**: The server is automatically configured in `.cursor/mcp.json`

3. **Start using tools**: The tools will be available in Cursor's MCP integration

## Usage

### Architecture Analysis
```typescript
// Analyze the entire codebase
{
  "scope": "full",
  "focus": "performance"
}

// Focus on backend architecture
{
  "scope": "backend",
  "focus": "API design"
}
```

### Security Audit
```typescript
// Full security audit
{
  "scope": "full",
  "severity": "medium"
}

// Focus on authentication
{
  "scope": "auth",
  "severity": "high"
}
```

### Test Generation
```typescript
// Generate unit tests
{
  "target": "backend/src/services/authService.ts",
  "testType": "unit",
  "coverage": true
}

// Generate API tests
{
  "target": "backend/src/controllers/tutorProfile.controller.ts",
  "testType": "api"
}
```

### Code Refactoring
```typescript
// Extract functions
{
  "filePath": "frontend/src/components/TutorProfileForm.tsx",
  "refactorType": "extract_function",
  "target": "validation logic"
}

// Optimize performance
{
  "filePath": "backend/src/services/search.service.ts",
  "refactorType": "optimize"
}
```

### Database Analysis
```typescript
// Review schema
{
  "operation": "schema_review",
  "target": "User relationships"
}

// Analyze performance
{
  "operation": "performance_analysis"
}
```

## Configuration

### Environment Variables
- `WORKSPACE_ROOT`: Root directory of the project (default: current directory)
- `MCP_DEBUG`: Enable debug logging (default: false)
- `PROJECT_TYPE`: Project type identifier (default: tuteasy-tutoring-platform)

### Debug Mode
Enable debug logging by setting `MCP_DEBUG=true` in the environment:

```json
{
  "mcpServers": {
    "tuteasy-rovo-mcp": {
      "env": {
        "MCP_DEBUG": "true"
      }
    }
  }
}
```

## Development

### Running Tests
```bash
npm test
```

### Building
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

## Architecture

The MCP server is built with:
- **TypeScript**: Full type safety and modern language features
- **Zod**: Runtime type validation for tool arguments
- **MCP SDK**: Official Model Context Protocol SDK
- **Vitest**: Fast and modern testing framework

### Tool Structure
Each tool follows a consistent pattern:
1. **Schema validation**: Using Zod schemas for type safety
2. **Error handling**: Proper MCP error codes and messages
3. **Workspace awareness**: Context-aware analysis based on project structure
4. **Actionable output**: Clear reports with specific recommendations

## Contributing

1. Follow TypeScript best practices
2. Add tests for new tools
3. Update documentation for new features
4. Use semantic versioning for releases

## License

This MCP server is part of the TutEasy tutoring platform and follows the same licensing terms.