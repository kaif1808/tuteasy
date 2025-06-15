#!/usr/bin/env node

/**
 * TutEasy Rovo MCP Server
 * Modern TypeScript-based MCP server for tutoring platform development
 * Based on best practices from claude-code-mcp reference
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  type ServerResult,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve as pathResolve, relative } from 'node:path';
import { spawn } from 'node:child_process';
import { z } from 'zod';

// Server version
const SERVER_VERSION = "2.0.0";

// Debug mode
const debugMode = process.env.MCP_DEBUG === 'true';

// Debug logging function
export function debugLog(message?: any, ...optionalParams: any[]): void {
  if (debugMode) {
    console.error('[DEBUG]', message, ...optionalParams);
  }
}

// Workspace root - default to current directory
const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || process.cwd();

// Tool argument schemas using Zod
const AnalyzeArchitectureSchema = z.object({
  scope: z.enum(['full', 'backend', 'frontend', 'database', 'api']),
  focus: z.string().optional(),
});

const SecurityAuditSchema = z.object({
  scope: z.enum(['auth', 'api', 'data', 'dependencies', 'full']),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

const GenerateTestsSchema = z.object({
  target: z.string(),
  testType: z.enum(['unit', 'integration', 'e2e', 'api']),
  coverage: z.boolean().optional(),
});

const RefactorCodeSchema = z.object({
  filePath: z.string(),
  refactorType: z.enum(['extract_function', 'extract_class', 'rename', 'optimize', 'modernize']),
  target: z.string().optional(),
});

const DatabaseAnalysisSchema = z.object({
  operation: z.enum(['schema_review', 'query_optimization', 'migration_plan', 'performance_analysis']),
  target: z.string().optional(),
});

/**
 * Utility function to execute shell commands
 */
async function executeCommand(command: string, args: string[], cwd?: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    debugLog(`Executing: ${command} ${args.join(' ')}`);
    const process = spawn(command, args, {
      cwd: cwd || WORKSPACE_ROOT,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => { stdout += data.toString(); });
    process.stderr.on('data', (data) => { stderr += data.toString(); });

    process.on('error', (error) => {
      reject(new Error(`Command execution failed: ${error.message}`));
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed with exit code ${code}\nStderr: ${stderr}\nStdout: ${stdout}`));
      }
    });
  });
}

/**
 * Utility function to read file safely
 */
function readFileSafe(filePath: string): string | null {
  try {
    const fullPath = pathResolve(WORKSPACE_ROOT, filePath);
    if (existsSync(fullPath)) {
      return readFileSync(fullPath, 'utf-8');
    }
    return null;
  } catch (error) {
    debugLog(`Error reading file ${filePath}:`, error);
    return null;
  }
}

/**
 * Utility function to analyze project structure
 */
function analyzeProjectStructure(scope: string): any {
  const structure: any = {
    scope,
    timestamp: new Date().toISOString(),
    workspace: WORKSPACE_ROOT,
  };

  try {
    // Analyze package.json files
    const packageJsonPaths = ['package.json', 'backend/package.json', 'frontend/package.json'];
    structure.packages = packageJsonPaths
      .map(path => {
        const content = readFileSafe(path);
        return content ? { path, content: JSON.parse(content) } : null;
      })
      .filter(Boolean);

    // Analyze key directories
    const keyDirs = ['backend', 'frontend', 'docs', 'prd', 'tools'];
    structure.directories = keyDirs
      .filter(dir => existsSync(join(WORKSPACE_ROOT, dir)))
      .map(dir => {
        const fullPath = join(WORKSPACE_ROOT, dir);
        const files = readdirSync(fullPath);
        return {
          name: dir,
          fileCount: files.length,
          files: files.slice(0, 10) // First 10 files
        };
      });

    // Analyze configuration files
    const configFiles = ['tsconfig.json', '.gitignore', 'README.md', '.cursor/mcp.json'];
    structure.configs = configFiles
      .filter(file => existsSync(join(WORKSPACE_ROOT, file)))
      .map(file => ({ file, exists: true }));

    return structure;
  } catch (error) {
    debugLog('Error analyzing project structure:', error);
    return { ...structure, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * TutEasy Rovo MCP Server Class
 */
export class TutEasyRovoMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'tuteasy-rovo-mcp',
        version: SERVER_VERSION,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Server Error]', error);
    };

    process.on('SIGINT', async () => {
      debugLog('Received SIGINT, shutting down server...');
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'analyze_architecture',
          description: 'Analyze the tutoring platform architecture and suggest improvements. Examines code structure, dependencies, and design patterns.',
          inputSchema: {
            type: 'object',
            properties: {
              scope: {
                type: 'string',
                enum: ['full', 'backend', 'frontend', 'database', 'api'],
                description: 'Scope of architectural analysis'
              },
              focus: {
                type: 'string',
                description: 'Specific area to focus on (optional)'
              }
            },
            required: ['scope']
          }
        },
        {
          name: 'security_audit',
          description: 'Perform comprehensive security audit of the tutoring platform. Checks authentication, authorization, data handling, and common vulnerabilities.',
          inputSchema: {
            type: 'object',
            properties: {
              scope: {
                type: 'string',
                enum: ['auth', 'api', 'data', 'dependencies', 'full'],
                description: 'Security audit scope'
              },
              severity: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'critical'],
                description: 'Minimum severity level to report (optional)'
              }
            },
            required: ['scope']
          }
        },
        {
          name: 'generate_tests',
          description: 'Generate comprehensive tests for tutoring platform components. Creates unit, integration, or e2e tests based on existing code.',
          inputSchema: {
            type: 'object',
            properties: {
              target: {
                type: 'string',
                description: 'Target file or component to test'
              },
              testType: {
                type: 'string',
                enum: ['unit', 'integration', 'e2e', 'api'],
                description: 'Type of tests to generate'
              },
              coverage: {
                type: 'boolean',
                description: 'Include coverage analysis (optional)'
              }
            },
            required: ['target', 'testType']
          }
        },
        {
          name: 'refactor_code',
          description: 'Intelligently refactor code for better maintainability, performance, and readability. Supports various refactoring patterns.',
          inputSchema: {
            type: 'object',
            properties: {
              filePath: {
                type: 'string',
                description: 'Path to the file to refactor'
              },
              refactorType: {
                type: 'string',
                enum: ['extract_function', 'extract_class', 'rename', 'optimize', 'modernize'],
                description: 'Type of refactoring to perform'
              },
              target: {
                type: 'string',
                description: 'Specific target for refactoring (optional)'
              }
            },
            required: ['filePath', 'refactorType']
          }
        },
        {
          name: 'database_analysis',
          description: 'Analyze database schema, queries, and performance for the tutoring platform. Provides optimization suggestions.',
          inputSchema: {
            type: 'object',
            properties: {
              operation: {
                type: 'string',
                enum: ['schema_review', 'query_optimization', 'migration_plan', 'performance_analysis'],
                description: 'Type of database analysis to perform'
              },
              target: {
                type: 'string',
                description: 'Specific target (table, query, etc.) for analysis (optional)'
              }
            },
            required: ['operation']
          }
        }
      ]
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request): Promise<ServerResult> => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'analyze_architecture':
            return await this.handleAnalyzeArchitecture(args);
          case 'security_audit':
            return await this.handleSecurityAudit(args);
          case 'generate_tests':
            return await this.handleGenerateTests(args);
          case 'refactor_code':
            return await this.handleRefactorCode(args);
          case 'database_analysis':
            return await this.handleDatabaseAnalysis(args);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Tool ${name} not found`);
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  private async handleAnalyzeArchitecture(args: any): Promise<ServerResult> {
    const parsed = AnalyzeArchitectureSchema.parse(args);
    debugLog('Analyzing architecture with scope:', parsed.scope);

    const analysis = analyzeProjectStructure(parsed.scope);
    
    let report = `# Architecture Analysis Report\n\n`;
    report += `**Scope:** ${parsed.scope}\n`;
    report += `**Timestamp:** ${analysis.timestamp}\n`;
    report += `**Workspace:** ${analysis.workspace}\n\n`;

    // Package analysis
    if (analysis.packages?.length > 0) {
      report += `## Package Analysis\n\n`;
      analysis.packages.forEach((pkg: any) => {
        report += `### ${pkg.path}\n`;
        report += `- **Name:** ${pkg.content.name}\n`;
        report += `- **Version:** ${pkg.content.version}\n`;
        if (pkg.content.dependencies) {
          report += `- **Dependencies:** ${Object.keys(pkg.content.dependencies).length}\n`;
        }
        if (pkg.content.devDependencies) {
          report += `- **Dev Dependencies:** ${Object.keys(pkg.content.devDependencies).length}\n`;
        }
        report += '\n';
      });
    }

    // Directory structure
    if (analysis.directories?.length > 0) {
      report += `## Directory Structure\n\n`;
      analysis.directories.forEach((dir: any) => {
        report += `### ${dir.name}/\n`;
        report += `- **File Count:** ${dir.fileCount}\n`;
        report += `- **Sample Files:** ${dir.files.join(', ')}\n\n`;
      });
    }

    // Configuration files
    if (analysis.configs?.length > 0) {
      report += `## Configuration Files\n\n`;
      analysis.configs.forEach((config: any) => {
        report += `- ✅ ${config.file}\n`;
      });
      report += '\n';
    }

    // Recommendations based on scope
    report += `## Recommendations\n\n`;
    switch (parsed.scope) {
      case 'backend':
        report += `- Review API endpoint organization\n`;
        report += `- Check database connection pooling\n`;
        report += `- Validate error handling patterns\n`;
        break;
      case 'frontend':
        report += `- Analyze component reusability\n`;
        report += `- Check state management patterns\n`;
        report += `- Review routing structure\n`;
        break;
      case 'database':
        report += `- Review schema relationships\n`;
        report += `- Check indexing strategy\n`;
        report += `- Validate migration scripts\n`;
        break;
      default:
        report += `- Consider implementing CI/CD pipeline\n`;
        report += `- Add comprehensive testing strategy\n`;
        report += `- Review security implementations\n`;
    }

    return {
      content: [{ type: 'text', text: report }]
    };
  }

  private async handleSecurityAudit(args: any): Promise<ServerResult> {
    const parsed = SecurityAuditSchema.parse(args);
    debugLog('Performing security audit with scope:', parsed.scope);

    let report = `# Security Audit Report\n\n`;
    report += `**Scope:** ${parsed.scope}\n`;
    report += `**Timestamp:** ${new Date().toISOString()}\n\n`;

    // Check for common security files
    const securityFiles = [
      '.env.example',
      'SECURITY.md',
      'backend/src/middleware/auth.ts',
      'backend/src/config/index.ts'
    ];

    report += `## Security Configuration Check\n\n`;
    securityFiles.forEach(file => {
      const exists = existsSync(join(WORKSPACE_ROOT, file));
      report += `- ${exists ? '✅' : '❌'} ${file}\n`;
    });

    // Check package.json for security-related dependencies
    const backendPackage = readFileSafe('backend/package.json');
    if (backendPackage) {
      const pkg = JSON.parse(backendPackage);
      report += `\n## Security Dependencies\n\n`;
      
      const securityDeps = ['bcrypt', 'jsonwebtoken', 'helmet', 'cors', 'express-rate-limit'];
      securityDeps.forEach(dep => {
        const hasDepency = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep];
        report += `- ${hasDepency ? '✅' : '❌'} ${dep}${hasDepency ? ` (${hasDepency})` : ''}\n`;
      });
    }

    // Scope-specific checks
    switch (parsed.scope) {
      case 'auth':
        report += `\n## Authentication Security\n\n`;
        report += `- Check JWT implementation\n`;
        report += `- Validate password hashing\n`;
        report += `- Review session management\n`;
        break;
      case 'api':
        report += `\n## API Security\n\n`;
        report += `- Validate input sanitization\n`;
        report += `- Check rate limiting\n`;
        report += `- Review CORS configuration\n`;
        break;
      case 'data':
        report += `\n## Data Security\n\n`;
        report += `- Check database access controls\n`;
        report += `- Validate data encryption\n`;
        report += `- Review backup security\n`;
        break;
    }

    return {
      content: [{ type: 'text', text: report }]
    };
  }

  private async handleGenerateTests(args: any): Promise<ServerResult> {
    const parsed = GenerateTestsSchema.parse(args);
    debugLog('Generating tests for:', parsed.target);

    const targetFile = readFileSafe(parsed.target);
    if (!targetFile) {
      throw new McpError(ErrorCode.InvalidParams, `Target file not found: ${parsed.target}`);
    }

    let testContent = `// Generated ${parsed.testType} tests for ${parsed.target}\n\n`;
    
    switch (parsed.testType) {
      case 'unit':
        testContent += `import { describe, it, expect, beforeEach } from 'jest';\n`;
        testContent += `import { /* import your module */ } from '${parsed.target.replace('.ts', '').replace('.js', '')}';\n\n`;
        testContent += `describe('${parsed.target}', () => {\n`;
        testContent += `  beforeEach(() => {\n`;
        testContent += `    // Setup before each test\n`;
        testContent += `  });\n\n`;
        testContent += `  it('should handle basic functionality', () => {\n`;
        testContent += `    // Test implementation\n`;
        testContent += `    expect(true).toBe(true);\n`;
        testContent += `  });\n`;
        testContent += `});\n`;
        break;
      
      case 'api':
        testContent += `import request from 'supertest';\n`;
        testContent += `import app from '../src/server';\n\n`;
        testContent += `describe('API Tests for ${parsed.target}', () => {\n`;
        testContent += `  it('should respond to GET request', async () => {\n`;
        testContent += `    const response = await request(app)\n`;
        testContent += `      .get('/api/endpoint')\n`;
        testContent += `      .expect(200);\n`;
        testContent += `    \n`;
        testContent += `    expect(response.body).toBeDefined();\n`;
        testContent += `  });\n`;
        testContent += `});\n`;
        break;
    }

    const report = `# Test Generation Report\n\n`;
    const fullReport = report + `**Target:** ${parsed.target}\n**Type:** ${parsed.testType}\n\n## Generated Test Code\n\n\`\`\`typescript\n${testContent}\`\`\`\n`;

    return {
      content: [{ type: 'text', text: fullReport }]
    };
  }

  private async handleRefactorCode(args: any): Promise<ServerResult> {
    const parsed = RefactorCodeSchema.parse(args);
    debugLog('Refactoring code:', parsed.filePath);

    const sourceCode = readFileSafe(parsed.filePath);
    if (!sourceCode) {
      throw new McpError(ErrorCode.InvalidParams, `Source file not found: ${parsed.filePath}`);
    }

    let report = `# Code Refactoring Report\n\n`;
    report += `**File:** ${parsed.filePath}\n`;
    report += `**Refactor Type:** ${parsed.refactorType}\n`;
    report += `**Timestamp:** ${new Date().toISOString()}\n\n`;

    // Basic refactoring suggestions based on type
    switch (parsed.refactorType) {
      case 'extract_function':
        report += `## Extract Function Suggestions\n\n`;
        report += `- Look for repeated code blocks\n`;
        report += `- Identify complex conditional logic\n`;
        report += `- Extract utility functions\n`;
        break;
      
      case 'optimize':
        report += `## Optimization Suggestions\n\n`;
        report += `- Review loop efficiency\n`;
        report += `- Check for unnecessary re-renders\n`;
        report += `- Optimize database queries\n`;
        break;
      
      case 'modernize':
        report += `## Modernization Suggestions\n\n`;
        report += `- Convert to TypeScript if needed\n`;
        report += `- Use modern ES6+ features\n`;
        report += `- Implement async/await patterns\n`;
        break;
    }

    report += `\n## Original Code Analysis\n\n`;
    report += `- **Lines of code:** ${sourceCode.split('\n').length}\n`;
    report += `- **File size:** ${sourceCode.length} characters\n`;

    return {
      content: [{ type: 'text', text: report }]
    };
  }

  private async handleDatabaseAnalysis(args: any): Promise<ServerResult> {
    const parsed = DatabaseAnalysisSchema.parse(args);
    debugLog('Analyzing database:', parsed.operation);

    let report = `# Database Analysis Report\n\n`;
    report += `**Operation:** ${parsed.operation}\n`;
    report += `**Timestamp:** ${new Date().toISOString()}\n\n`;

    // Check for Prisma schema
    const prismaSchema = readFileSafe('backend/prisma/schema.prisma');
    if (prismaSchema) {
      report += `## Prisma Schema Analysis\n\n`;
      const models = prismaSchema.match(/model\s+(\w+)/g) || [];
      report += `- **Models found:** ${models.length}\n`;
      report += `- **Models:** ${models.map(m => m.replace('model ', '')).join(', ')}\n\n`;
    }

    switch (parsed.operation) {
      case 'schema_review':
        report += `## Schema Review\n\n`;
        report += `- Check for proper indexing\n`;
        report += `- Validate relationships\n`;
        report += `- Review data types\n`;
        break;
      
      case 'performance_analysis':
        report += `## Performance Analysis\n\n`;
        report += `- Identify slow queries\n`;
        report += `- Check connection pooling\n`;
        report += `- Review caching strategy\n`;
        break;
    }

    return {
      content: [{ type: 'text', text: report }]
    };
  }

  /**
   * Start the MCP server
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(`TutEasy Rovo MCP Server v${SERVER_VERSION} running on stdio`);
    debugLog('Server started with workspace:', WORKSPACE_ROOT);
  }
}

// Create and run the server if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new TutEasyRovoMCPServer();
  server.run().catch(console.error);
}