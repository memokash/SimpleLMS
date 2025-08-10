#!/usr/bin/env node

/**
 * SimpleLMS Deployment Validation Script
 * Validates environment configuration and deployment readiness
 */

const fs = require('fs');
const path = require('path');

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET'
];

const requiredFiles = [
  'next.config.js',
  'package.json',
  'pnpm-lock.yaml',
  '.env.example',
  'README.md',
  'DEPLOYMENT.md',
  'HIPAA-COMPLIANCE.md'
];

const requiredDirectories = [
  'app',
  'lib',
  'services',
  'types',
  'public'
];

function validateEnvironment() {
  console.log('🔍 Validating environment variables...\n');
  
  const missing = [];
  let hasEnvFile = false;

  // Check for environment files
  const envFiles = ['.env.local', '.env.production', '.env'];
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      hasEnvFile = true;
      console.log(`✅ Found environment file: ${envFile}`);
      break;
    }
  }

  if (!hasEnvFile) {
    console.log('❌ No environment file found (.env.local, .env.production, or .env)');
    return false;
  }

  // Validate required environment variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.log('❌ Missing required environment variables:');
    missing.forEach(variable => console.log(`   - ${variable}`));
    console.log('\n💡 Please check your .env file and the .env.example template\n');
    return false;
  }

  console.log('✅ All required environment variables are present\n');
  return true;
}

function validateFiles() {
  console.log('📁 Validating required files...\n');
  
  let allPresent = true;

  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ Missing: ${file}`);
      allPresent = false;
    }
  }

  console.log('');
  return allPresent;
}

function validateDirectories() {
  console.log('📂 Validating required directories...\n');
  
  let allPresent = true;

  for (const dir of requiredDirectories) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      console.log(`✅ ${dir}/`);
    } else {
      console.log(`❌ Missing directory: ${dir}/`);
      allPresent = false;
    }
  }

  console.log('');
  return allPresent;
}

function validatePackageJson() {
  console.log('📦 Validating package.json...\n');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check for required scripts
    const requiredScripts = ['dev', 'build', 'start', 'lint'];
    const missing = requiredScripts.filter(script => !packageJson.scripts[script]);
    
    if (missing.length > 0) {
      console.log('❌ Missing package.json scripts:');
      missing.forEach(script => console.log(`   - ${script}`));
      return false;
    }

    // Check for required dependencies
    const requiredDeps = ['next', 'react', 'firebase', 'openai', '@anthropic-ai/sdk'];
    const missingDeps = requiredDeps.filter(dep => 
      !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
    );
    
    if (missingDeps.length > 0) {
      console.log('❌ Missing required dependencies:');
      missingDeps.forEach(dep => console.log(`   - ${dep}`));
      return false;
    }

    console.log('✅ Package.json is properly configured\n');
    return true;
  } catch (error) {
    console.log('❌ Error reading package.json:', error.message);
    return false;
  }
}

function validateTypeScript() {
  console.log('🔧 Validating TypeScript configuration...\n');
  
  if (!fs.existsSync('tsconfig.json')) {
    console.log('❌ Missing tsconfig.json');
    return false;
  }

  try {
    const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    
    if (tsConfig.compilerOptions && tsConfig.compilerOptions.strict === false) {
      console.log('⚠️ TypeScript strict mode is disabled - consider enabling for better type safety');
    } else {
      console.log('✅ TypeScript strict mode is enabled');
    }

    console.log('✅ TypeScript configuration is valid\n');
    return true;
  } catch (error) {
    console.log('❌ Error reading tsconfig.json:', error.message);
    return false;
  }
}

function generateDeploymentReport() {
  console.log('📋 Generating deployment report...\n');
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      environment: validateEnvironment(),
      files: validateFiles(),
      directories: validateDirectories(),
      packageJson: validatePackageJson(),
      typescript: validateTypeScript()
    }
  };

  const allPassed = Object.values(report.checks).every(check => check === true);
  
  console.log('=' .repeat(50));
  console.log('🚀 DEPLOYMENT READINESS REPORT');
  console.log('=' .repeat(50));
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Environment: ${report.environment}`);
  console.log('');
  
  Object.entries(report.checks).forEach(([check, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${check.charAt(0).toUpperCase() + check.slice(1)}`);
  });
  
  console.log('');
  
  if (allPassed) {
    console.log('🎉 All checks passed! SimpleLMS is ready for deployment.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run `pnpm build` to test production build');
    console.log('2. Deploy to your chosen platform (Vercel recommended)');
    console.log('3. Configure domain and SSL certificates');
    console.log('4. Set up monitoring and logging');
    process.exit(0);
  } else {
    console.log('❌ Some checks failed. Please fix the issues above before deploying.');
    process.exit(1);
  }
}

// Run the validation
console.log('🔍 SimpleLMS Deployment Validation\n');
generateDeploymentReport();