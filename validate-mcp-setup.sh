#!/bin/bash

# TutEasy MCP Setup Validation Script
# This script validates that the MCP integration is properly set up

echo "🔍 Validating TutEasy MCP Setup..."
echo "=================================="

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    exit 1
fi

echo "✅ Node.js is available: $(node --version)"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed or not in PATH"
    exit 1
fi

echo "✅ npm is available: $(npm --version)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found"
    exit 1
fi

echo "✅ package.json exists"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found, installing dependencies..."
    npm install
fi

echo "✅ Dependencies are installed"

# Check if TypeScript is configured
if [ ! -f "tsconfig.json" ]; then
    echo "❌ tsconfig.json not found"
    exit 1
fi

echo "✅ TypeScript configuration exists"

# Check if MCP source exists
if [ ! -f "src/mcp-server.ts" ]; then
    echo "❌ MCP server source not found at src/mcp-server.ts"
    exit 1
fi

echo "✅ MCP server source exists"

# Build the server
echo "🔨 Building MCP server..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

# Check if built server exists
if [ ! -f "dist/mcp-server.js" ]; then
    echo "❌ Built MCP server not found at dist/mcp-server.js"
    exit 1
fi

echo "✅ Built MCP server exists"

# Check MCP configuration
if [ ! -f ".cursor/mcp.json" ]; then
    echo "❌ Cursor MCP configuration not found at .cursor/mcp.json"
    exit 1
fi

echo "✅ Cursor MCP configuration exists"

# Validate MCP configuration syntax
if ! python3 -m json.tool .cursor/mcp.json > /dev/null 2>&1; then
    if ! node -e "JSON.parse(require('fs').readFileSync('.cursor/mcp.json', 'utf8'))" > /dev/null 2>&1; then
        echo "❌ Invalid JSON in .cursor/mcp.json"
        exit 1
    fi
fi

echo "✅ MCP configuration syntax is valid"

# Run basic tests
echo "🧪 Running basic tests..."
node dist/test-mcp-server.js

if [ $? -ne 0 ]; then
    echo "❌ Tests failed"
    exit 1
fi

echo "✅ Basic tests passed"

# Check for old MCP files (should be moved to deprecated)
if [ -f "tools/mcp-rovo-server.js" ] || [ -f "tools/simple-mcp-server.js" ]; then
    echo "⚠️  Old MCP files still present in tools/ directory"
    echo "   Consider moving them to tools/_deprecated/"
fi

# Final validation
echo ""
echo "🎉 MCP Setup Validation Complete!"
echo "================================="
echo ""
echo "✅ All checks passed successfully"
echo ""
echo "Next steps:"
echo "1. Restart Cursor to load the new MCP server"
echo "2. Try using the MCP tools in Cursor"
echo "3. Enable debug mode if you need troubleshooting: MCP_DEBUG=true"
echo ""
echo "Available tools:"
echo "- analyze_architecture: Analyze codebase architecture"
echo "- security_audit: Perform security audits"
echo "- generate_tests: Generate test code"
echo "- refactor_code: Suggest code improvements"
echo "- database_analysis: Analyze database design"
echo ""
echo "For detailed usage, see: src/README.md"
echo "For migration help, see: MCP_MIGRATION_GUIDE.md"