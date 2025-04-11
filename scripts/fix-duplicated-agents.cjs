/**
 * Fix duplicated HttpAgent/HttpsAgent declarations
 * This script corrects previous patching issues in the VeChain connex-driver
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const NODE_MODULES_DIR = path.join(ROOT_DIR, 'node_modules');
const TARGET_FILE = path.join(NODE_MODULES_DIR, '@vechain/connex-driver/esm/simple-net.js');

console.log('🔄 Checking for duplicated agent declarations...');

if (!fs.existsSync(TARGET_FILE)) {
  console.log('⚠️ Target file not found:', TARGET_FILE);
  process.exit(0);
}

// Read the file content
let content = fs.readFileSync(TARGET_FILE, 'utf8');

// Regex patterns to find duplicated agent declarations
const httpAgentPattern = /(const\s+HttpAgent\s*=\s*class\s*\{\s*constructor\(\)\s*\{\}\s*\};)[\s\n]*(const\s+HttpAgent\s*=\s*class\s*\{\s*constructor\(\)\s*\{\}\s*\};)/;
const httpsAgentPattern = /(const\s+HttpsAgent\s*=\s*class\s*\{\s*constructor\(\)\s*\{\}\s*\};)[\s\n]*(const\s+HttpsAgent\s*=\s*class\s*\{\s*constructor\(\)\s*\{\}\s*\};)/;

// Replace duplicated declarations with single declarations
if (httpAgentPattern.test(content)) {
  console.log('🔧 Fixing duplicated HttpAgent declaration');
  content = content.replace(httpAgentPattern, '$1');
}

if (httpsAgentPattern.test(content)) {
  console.log('🔧 Fixing duplicated HttpsAgent declaration');
  content = content.replace(httpsAgentPattern, '$1');
}

// Clean up any duplicate comments
content = content.replace(/\/\/ Patched by VeCollab for browser compatibility\s*\/\/ Original: \/\/ Patched by VeCollab for browser compatibility/g, '// Patched by VeCollab for browser compatibility');

// Write the fixed content back to the file
fs.writeFileSync(TARGET_FILE, content);

console.log('✅ Fixed agent declarations in', TARGET_FILE);