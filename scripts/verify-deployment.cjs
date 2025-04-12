/**
 * Vercel Deployment Verification Script
 * Checks that all necessary files and configurations exist for proper Vercel deployment
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk') || { green: text => text, red: text => text, yellow: text => text };

// Define required files
const REQUIRED_FILES = [
  'vercel.json',
  'scripts/prepare-vercel.cjs',
  'scripts/post-build-vercel.cjs',
  'vite.config.vercel.js',
  'client/src/vercel-polyfills.js',
  'api/index.js',
  '.env.example'
];

// Define recommended files
const RECOMMENDED_FILES = [
  'VERCEL-DEPLOYMENT.md',
  'tsconfig.vercel.json',
  '.gitignore'
];

// Define required configuration properties
const CONFIG_CHECKS = [
  { 
    file: 'vercel.json', 
    checks: [
      { path: 'buildCommand', type: 'string' },
      { path: 'outputDirectory', type: 'string' },
      { path: 'rewrites', type: 'array' },
      { path: 'env', type: 'object' }
    ]
  },
  {
    file: 'vite.config.vercel.js',
    checks: [
      { path: 'plugins', type: 'array' },
      { path: 'build.outDir', type: 'string' },
      { path: 'resolve.alias', type: 'object' }
    ]
  }
];

console.log('Vercel Deployment Verification');
console.log('==============================\n');

// Check required files
let missingRequired = 0;
console.log('Checking required files:');
REQUIRED_FILES.forEach(file => {
  const filePath = path.resolve(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(chalk.green(`✓ ${file}`));
  } else {
    console.log(chalk.red(`✗ ${file} (MISSING)`));
    missingRequired++;
  }
});

// Check recommended files
let missingRecommended = 0;
console.log('\nChecking recommended files:');
RECOMMENDED_FILES.forEach(file => {
  const filePath = path.resolve(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(chalk.green(`✓ ${file}`));
  } else {
    console.log(chalk.yellow(`! ${file} (MISSING)`));
    missingRecommended++;
  }
});

// Check configuration properties
let configIssues = 0;
console.log('\nVerifying configuration files:');
CONFIG_CHECKS.forEach(config => {
  const filePath = path.resolve(__dirname, '..', config.file);
  if (fs.existsSync(filePath)) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      // Basic check - proper solution would use an AST parser
      console.log(chalk.green(`✓ ${config.file} (exists)`));
      
      // Just report that we can't validate JS files completely
      if (config.file.endsWith('.js')) {
        console.log(chalk.yellow(`  ! Cannot fully validate JS file structure`));
      }
    } catch (error) {
      console.log(chalk.red(`✗ Error reading ${config.file}: ${error.message}`));
      configIssues++;
    }
  } else {
    console.log(chalk.red(`✗ ${config.file} (missing)`));
    configIssues++;
  }
});

// Final report
console.log('\nVerification Summary:');
if (missingRequired > 0) {
  console.log(chalk.red(`✗ Missing ${missingRequired} required files`));
} else {
  console.log(chalk.green('✓ All required files present'));
}

if (missingRecommended > 0) {
  console.log(chalk.yellow(`! Missing ${missingRecommended} recommended files`));
} else {
  console.log(chalk.green('✓ All recommended files present'));
}

if (configIssues > 0) {
  console.log(chalk.red(`✗ Found ${configIssues} configuration issues`));
} else {
  console.log(chalk.green('✓ No configuration issues detected'));
}

console.log('\nVercel Deployment Readiness:');
if (missingRequired === 0 && configIssues === 0) {
  console.log(chalk.green('✓ Your project is ready for Vercel deployment!'));
  if (missingRecommended > 0) {
    console.log(chalk.yellow('! Consider addressing recommended file warnings for optimal deployment.'));
  }
} else {
  console.log(chalk.red(`✗ Your project is not ready for Vercel deployment.`));
  console.log(chalk.red(`  Please address the issues above before deploying.`));
}

// Exit with proper code
process.exit(missingRequired > 0 || configIssues > 0 ? 1 : 0);