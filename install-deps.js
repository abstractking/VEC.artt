/**
 * Script to install dependencies with legacy-peer-deps flag
 * This is used because our direct packager_tool doesn't support flags
 */
import { execSync } from 'child_process';

try {
  console.log('Installing updated dependencies with legacy-peer-deps...');
  execSync('npm install uuid@latest lodash.isequal@latest --legacy-peer-deps', { 
    encoding: 'utf8',
    stdio: 'inherit'
  });
  console.log('Dependencies successfully installed');
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  process.exit(1);
}