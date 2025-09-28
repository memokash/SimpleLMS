#!/usr/bin/env tsx

/**
 * Manual SimpleLMS Functionality Test Script
 * 
 * This script tests SimpleLMS functionality without requiring Jest installation.
 * It validates that all systems are working correctly after the Firebase to Supabase migration.
 * 
 * Run with: tsx scripts/test-functionality-manual.ts
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface TestResult {
  testName: string;
  success: boolean;
  duration: number;
  details: any;
  timestamp: string;
}

class FunctionalityTester {
  private results: TestResult[] = [];
  private startTime: number = Date.now();

  private log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
    const colors = {
      info: '\x1b[36m',    // cyan
      success: '\x1b[32m', // green
      error: '\x1b[31m',   // red
      warning: '\x1b[33m', // yellow
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  private recordResult(testName: string, startTime: number, success: boolean, details: any = {}) {
    const duration = Date.now() - startTime;
    this.results.push({
      testName,
      success,
      duration,
      details,
      timestamp: new Date().toISOString()
    });
    
    const status = success ? '✅' : '❌';
    this.log(`${status} ${testName} (${duration}ms)`, success ? 'success' : 'error');
    
    if (details && Object.keys(details).length > 0) {
      console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
    }
  }

  async runAllTests() {
    this.log('🚀 Starting SimpleLMS Comprehensive Functionality Tests', 'info');
    this.log('==================================================', 'info');

    await this.testFileStructure();
    await this.testEnvironmentSetup();
    await this.testModuleImports();
    await this.testSupabaseConfiguration();
    await this.testComponentStructure();
    await this.testAPIStructure();
    await this.testDatabaseTypes();
    
    this.generateReport();
  }

  async testFileStructure() {
    this.log('\n📁 Testing File Structure', 'info');
    const startTime = Date.now();

    const criticalFiles = [
      'package.json',
      'next.config.js',
      'tsconfig.json',
      'tailwind.config.js',
      'app/layout.tsx',
      'app/page.tsx',
      'lib/supabase/client.ts',
      'lib/supabase/server.ts',
      'lib/supabase/database.types.ts',
      'app/components/AuthContext.tsx',
      'middleware.ts'
    ];

    const results: any = {};
    let allExist = true;

    for (const file of criticalFiles) {
      const exists = existsSync(join(process.cwd(), file));
      results[file] = exists;
      if (!exists) {
        allExist = false;
        this.log(`   Missing: ${file}`, 'warning');
      }
    }

    this.recordResult('File Structure Check', startTime, allExist, results);
  }

  async testEnvironmentSetup() {
    this.log('\n🔧 Testing Environment Setup', 'info');
    const startTime = Date.now();

    // Test environment validator
    try {
      const { validateEnvironmentWithLogging } = await import('../lib/environmentValidator');
      const validation = validateEnvironmentWithLogging(false);
      
      const details = {
        isValid: validation.isValid,
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length,
        errors: validation.errors,
        warnings: validation.warnings,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasAIKeys: !!(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY),
        hasStripeKeys: !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
      };

      this.recordResult('Environment Validation', startTime, true, details);
    } catch (error) {
      this.recordResult('Environment Validation', startTime, false, { error: error.message });
    }
  }

  async testModuleImports() {
    this.log('\n📦 Testing Module Imports', 'info');
    const startTime = Date.now();

    const modules = [
      { name: 'Supabase Client', path: '../lib/supabase/client' },
      { name: 'Supabase Server', path: '../lib/supabase/server' },
      { name: 'Database Types', path: '../lib/supabase/database.types' },
      { name: 'Auth Context', path: '../app/components/AuthContext' },
      { name: 'Theme Context', path: '../app/components/ThemeContext' },
      { name: 'Course Service', path: '../lib/courseService' },
      { name: 'AI Service', path: '../lib/aiService' },
      { name: 'Quiz Index Service', path: '../lib/quizIndexService' }
    ];

    const results: any = {};

    for (const module of modules) {
      try {
        const imported = await import(module.path);
        results[module.name] = {
          importable: true,
          exports: Object.keys(imported),
          hasDefault: !!imported.default
        };
      } catch (error) {
        results[module.name] = {
          importable: false,
          error: error.message
        };
      }
    }

    const allImportable = Object.values(results).every((r: any) => r.importable);
    this.recordResult('Module Imports', startTime, allImportable, results);
  }

  async testSupabaseConfiguration() {
    this.log('\n🗄️ Testing Supabase Configuration', 'info');
    const startTime = Date.now();

    try {
      // Test if Supabase is configured
      const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
      const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const hasDatabaseUrl = !!process.env.DATABASE_URL;

      if (!hasUrl && !hasKey && !hasDatabaseUrl) {
        this.recordResult('Supabase Configuration', startTime, false, {
          error: 'No Supabase configuration found',
          hasUrl,
          hasKey,
          hasDatabaseUrl
        });
        return;
      }

      // Try to import and create client
      const { createClient } = await import('../lib/supabase/client');
      
      if (hasUrl && hasKey) {
        try {
          const client = createClient();
          const details = {
            method: 'supabase-js',
            hasUrl,
            hasKey,
            clientCreated: !!client,
            urlValid: hasUrl && process.env.NEXT_PUBLIC_SUPABASE_URL!.includes('.supabase.co'),
            keyValid: hasKey && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.startsWith('eyJ')
          };

          this.recordResult('Supabase Configuration', startTime, true, details);
        } catch (error) {
          this.recordResult('Supabase Configuration', startTime, false, {
            error: error.message,
            hasUrl,
            hasKey
          });
        }
      } else if (hasDatabaseUrl) {
        this.recordResult('Supabase Configuration', startTime, true, {
          method: 'direct-postgres',
          hasDatabaseUrl,
          databaseUrlValid: process.env.DATABASE_URL!.startsWith('postgres')
        });
      }

    } catch (error) {
      this.recordResult('Supabase Configuration', startTime, false, { error: error.message });
    }
  }

  async testComponentStructure() {
    this.log('\n🎨 Testing Component Structure', 'info');
    const startTime = Date.now();

    const components = [
      'AuthContext',
      'ThemeContext',
      'UserDashboard',
      'CoursesDashboard',
      'QuizApp',
      'Header',
      'Footer'
    ];

    const results: any = {};

    for (const component of components) {
      try {
        const componentModule = await import(`../app/components/${component}`);
        results[component] = {
          importable: true,
          hasDefault: !!componentModule.default,
          namedExports: Object.keys(componentModule).filter(key => key !== 'default')
        };
      } catch (error) {
        results[component] = {
          importable: false,
          error: error.message
        };
      }
    }

    const allImportable = Object.values(results).every((r: any) => r.importable);
    this.recordResult('Component Structure', startTime, allImportable, results);
  }

  async testAPIStructure() {
    this.log('\n🔌 Testing API Structure', 'info');
    const startTime = Date.now();

    const apiRoutes = [
      'api/ai/generate-quiz/route.ts',
      'api/ai/enhance-quiz-explanations/route.ts',
      'api/profile.api.ts',
      'api/stripe/webhook/route.ts'
    ];

    const results: any = {};

    for (const route of apiRoutes) {
      const routePath = join(process.cwd(), 'app', route);
      const exists = existsSync(routePath);
      
      if (exists) {
        try {
          const content = readFileSync(routePath, 'utf-8');
          results[route] = {
            exists: true,
            hasGET: content.includes('export async function GET'),
            hasPOST: content.includes('export async function POST'),
            lineCount: content.split('\n').length
          };
        } catch (error) {
          results[route] = {
            exists: true,
            readable: false,
            error: error.message
          };
        }
      } else {
        results[route] = {
          exists: false
        };
      }
    }

    const allExist = Object.values(results).every((r: any) => r.exists);
    this.recordResult('API Structure', startTime, allExist, results);
  }

  async testDatabaseTypes() {
    this.log('\n📋 Testing Database Types', 'info');
    const startTime = Date.now();

    try {
      const types = await import('../lib/supabase/database.types');
      
      const details = {
        typesImported: true,
        hasDatabase: !!types.Database,
        hasTables: !!types.Tables,
        exports: Object.keys(types)
      };

      this.recordResult('Database Types', startTime, true, details);
    } catch (error) {
      this.recordResult('Database Types', startTime, false, { error: error.message });
    }
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const total = this.results.length;

    this.log('\n📊 TEST REPORT', 'info');
    this.log('==============', 'info');
    this.log(`Total Tests: ${total}`, 'info');
    this.log(`Passed: ${passed}`, passed === total ? 'success' : 'warning');
    this.log(`Failed: ${failed}`, failed === 0 ? 'success' : 'error');
    this.log(`Success Rate: ${Math.round((passed / total) * 100)}%`, 'info');
    this.log(`Total Time: ${totalTime}ms`, 'info');

    if (failed > 0) {
      this.log('\n❌ Failed Tests:', 'error');
      this.results.filter(r => !r.success).forEach(result => {
        this.log(`- ${result.testName}: ${result.details?.error || 'Unknown error'}`, 'error');
      });
    }

    this.log('\n📋 Detailed Results:', 'info');
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.testName} (${result.duration}ms)`);
    });

    // Environment Setup Recommendations
    this.log('\n💡 Setup Recommendations:', 'warning');
    this.log('================================', 'warning');
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.DATABASE_URL) {
      this.log('🔧 Configure Supabase connection:', 'warning');
      this.log('   - Set NEXT_PUBLIC_SUPABASE_URL in .env.local', 'warning');
      this.log('   - Set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local', 'warning');
      this.log('   - OR set DATABASE_URL for direct postgres connection', 'warning');
    }

    if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
      this.log('🤖 Configure AI services for quiz generation', 'warning');
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      this.log('💳 Configure Stripe for payment processing', 'warning');
    }

    // Generate summary file
    const report = {
      summary: {
        totalTests: total,
        passed,
        failed,
        successRate: Math.round((passed / total) * 100),
        totalTime,
        timestamp: new Date().toISOString()
      },
      results: this.results,
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasAIKeys: !!(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY),
        hasStripeKeys: !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
      }
    };

    require('fs').writeFileSync(
      join(process.cwd(), 'test-results.json'),
      JSON.stringify(report, null, 2)
    );

    this.log(`\n📄 Detailed report saved to: test-results.json`, 'success');
    
    return report;
  }
}

// Run the tests
async function main() {
  const tester = new FunctionalityTester();
  const report = await tester.runAllTests();
  
  // Exit with appropriate code
  const success = report.summary.failed === 0;
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

export { FunctionalityTester };