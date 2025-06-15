# MCP Integration Migration Guide

## Overview

This guide helps you migrate from the previous JavaScript-based MCP integration to the new TypeScript-based implementation that follows best practices from the claude-code-mcp reference.

## What Changed

### 1. Architecture Improvements
- **Language**: JavaScript → TypeScript
- **Module System**: CommonJS → ES Modules
- **Validation**: Manual validation → Zod schemas
- **Error Handling**: Custom errors → MCP SDK error types
- **Testing**: No tests → Comprehensive test suite

### 2. Tool Refinements
- **Focused scoping**: Each tool has a specific, well-defined purpose
- **Better naming**: More descriptive and consistent tool names
- **Enhanced outputs**: More actionable and structured responses
- **Context awareness**: Tools understand the tutoring platform domain

### 3. Configuration Updates
- **Server name**: `rovo-dev-agent` → `tuteasy-rovo-mcp`
- **Entry point**: `./tools/simple-mcp-server.js` → `./dist/mcp-server.js`
- **Environment**: Added `MCP_DEBUG` for better debugging

## Migration Steps

### Step 1: Backup Current Configuration
```bash
# Backup your current MCP configuration
cp .cursor/mcp.json .cursor/mcp.json.backup
```

### Step 2: Install Dependencies
```bash
# Install new dependencies (if not already done)
npm install
```

### Step 3: Build the New Server
```bash
# Build the TypeScript server
npm run build
```

### Step 4: Update Configuration
The `.cursor/mcp.json` has already been updated to:
```json
{
  "mcpServers": {
    "tuteasy-rovo-mcp": {
      "command": "node",
      "args": ["./dist/mcp-server.js"],
      "env": {
        "WORKSPACE_ROOT": ".",
        "PROJECT_TYPE": "tuteasy-tutoring-platform",
        "MCP_DEBUG": "false"
      }
    }
  }
}
```

### Step 5: Restart Cursor
1. Close Cursor completely
2. Reopen Cursor
3. The new MCP server will be automatically loaded

### Step 6: Verify Installation
1. Open a file in your project
2. Try using one of the new MCP tools
3. Check that tools are available and working correctly

## Tool Migration Map

### Old Tools → New Tools

| Old Tool | New Tool | Changes |
|----------|----------|---------|
| `analyze_architecture` | `analyze_architecture` | ✅ Enhanced with better scoping and detailed reports |
| `security_audit` | `security_audit` | ✅ Improved with severity levels and focused scopes |
| `generate_tests` | `generate_tests` | ✅ Better test type support and coverage analysis |
| `refactor_code` | `refactor_code` | ✅ More refactoring types and targeted improvements |
| `database_analysis` | `database_analysis` | ✅ Enhanced with specific operation types |

### New Tool Schemas

#### analyze_architecture
```typescript
// Old (loose validation)
{
  scope: string,
  feature?: string
}

// New (strict Zod validation)
{
  scope: 'full' | 'backend' | 'frontend' | 'database' | 'api',
  focus?: string
}
```

#### security_audit
```typescript
// Old
{
  scope: string
}

// New
{
  scope: 'auth' | 'api' | 'data' | 'dependencies' | 'full',
  severity?: 'low' | 'medium' | 'high' | 'critical'
}
```

#### generate_tests
```typescript
// Old
{
  test_type: string,
  target?: string
}

// New
{
  target: string,
  testType: 'unit' | 'integration' | 'e2e' | 'api',
  coverage?: boolean
}
```

## Troubleshooting

### Common Issues

#### 1. "Tool not found" errors
**Cause**: Old tool names or server not restarted
**Solution**: 
- Restart Cursor completely
- Verify the new server is built: `npm run build`
- Check `.cursor/mcp.json` configuration

#### 2. "Invalid arguments" errors
**Cause**: Using old argument schemas
**Solution**: Update tool calls to use new schemas (see examples above)

#### 3. Server not starting
**Cause**: Build issues or missing dependencies
**Solution**:
```bash
# Clean and rebuild
npm run clean
npm run build

# Check for errors
npm run dev
```

#### 4. Debug information needed
**Solution**: Enable debug mode
```json
{
  "env": {
    "MCP_DEBUG": "true"
  }
}
```

### Rollback Procedure
If you need to rollback to the old implementation:

1. **Restore old configuration**:
   ```bash
   cp .cursor/mcp.json.backup .cursor/mcp.json
   ```

2. **Restart Cursor**

3. **Report issues**: Please report any issues that required rollback so we can improve the new implementation

## Testing the Migration

### Quick Verification Tests

#### 1. Architecture Analysis
```typescript
// Test the analyze_architecture tool
{
  "scope": "backend",
  "focus": "API structure"
}
```

#### 2. Security Audit
```typescript
// Test the security_audit tool
{
  "scope": "auth",
  "severity": "medium"
}
```

#### 3. Test Generation
```typescript
// Test the generate_tests tool
{
  "target": "backend/src/services/authService.ts",
  "testType": "unit",
  "coverage": true
}
```

### Expected Outputs
- **Structured reports**: Clear, actionable recommendations
- **Context-aware analysis**: Specific to tutoring platform needs
- **Error handling**: Proper error messages if something goes wrong

## Benefits of the New Implementation

### 1. Type Safety
- **Compile-time checking**: Catch errors before runtime
- **Better IDE support**: Enhanced autocomplete and error detection
- **Runtime validation**: Zod schemas ensure data integrity

### 2. Better Error Handling
- **Proper MCP errors**: Standard error codes and messages
- **Detailed diagnostics**: Clear error descriptions
- **Graceful degradation**: Fallback behaviors for edge cases

### 3. Enhanced Functionality
- **Focused tools**: Each tool has a specific, well-defined purpose
- **Better outputs**: More structured and actionable results
- **Context awareness**: Understanding of the tutoring platform domain

### 4. Maintainability
- **Modern codebase**: TypeScript with modern patterns
- **Test coverage**: Comprehensive testing for reliability
- **Documentation**: Clear usage examples and API documentation

## Support

If you encounter any issues during migration:

1. **Check the logs**: Enable debug mode for detailed information
2. **Review the documentation**: See `src/README.md` for detailed usage
3. **Test the server**: Run `npm test` to verify functionality
4. **Report issues**: Document any problems for future improvements

## Next Steps

After successful migration:

1. **Explore new features**: Try the enhanced tool capabilities
2. **Customize for your workflow**: Adapt tools to your specific needs
3. **Provide feedback**: Share your experience to help improve the tools
4. **Stay updated**: Keep the MCP server updated for new features and fixes

The new MCP integration provides a solid foundation for AI-assisted development of the TutEasy tutoring platform, with better reliability, type safety, and functionality than the previous implementation.