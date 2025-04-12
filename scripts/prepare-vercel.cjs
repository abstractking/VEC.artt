/**
 * Pre-Build Script for Vercel Deployment
 * 
 * This script runs before the build process begins on Vercel.
 * It prepares the environment and ensures all necessary files are in place.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Preparing environment for Vercel deployment...');

// Function to ensure a directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Function to check if file exists, and create if it doesn't
function ensureFileExists(filePath, content = '') {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`Created file: ${filePath}`);
  }
}

// 1. Create any necessary directories for shims
const shimDirectories = [
  path.resolve(__dirname, '../client/src/shims'),
];

shimDirectories.forEach(dir => ensureDirectoryExists(dir));

// 2. Create shim files for node libraries if they don't exist
const shims = [
  {
    name: 'crypto-shim.js',
    content: `
/**
 * Crypto API polyfill for Vercel
 */
import * as cryptoBrowserify from 'crypto-browserify';

// Export the crypto-browserify module as the default export
export default cryptoBrowserify;

// Also export all the individual methods
for (const key in cryptoBrowserify) {
  if (Object.prototype.hasOwnProperty.call(cryptoBrowserify, key)) {
    exports[key] = cryptoBrowserify[key];
  }
}
`
  },
  {
    name: 'stream-shim.js',
    content: `
/**
 * Stream API polyfill for Vercel
 */
import * as streamBrowserify from 'stream-browserify';

// Export the stream-browserify module as the default export
export default streamBrowserify;

// Also export all the individual methods
for (const key in streamBrowserify) {
  if (Object.prototype.hasOwnProperty.call(streamBrowserify, key)) {
    exports[key] = streamBrowserify[key];
  }
}
`
  },
  {
    name: 'https-shim.js',
    content: `
/**
 * HTTPS API polyfill for Vercel
 */
import * as httpsBrowserify from 'https-browserify';

// Export the https-browserify module as the default export
export default httpsBrowserify;

// Also export all the individual methods
for (const key in httpsBrowserify) {
  if (Object.prototype.hasOwnProperty.call(httpsBrowserify, key)) {
    exports[key] = httpsBrowserify[key];
  }
}
`
  },
  {
    name: 'http-shim.js',
    content: `
/**
 * HTTP API polyfill for Vercel
 */
import * as httpBrowserify from 'stream-http';

// Export the stream-http module as the default export
export default httpBrowserify;

// Also export all the individual methods
for (const key in httpBrowserify) {
  if (Object.prototype.hasOwnProperty.call(httpBrowserify, key)) {
    exports[key] = httpBrowserify[key];
  }
}
`
  },
  {
    name: 'util-shim.js',
    content: `
/**
 * Util API polyfill for Vercel
 */
import * as utilBrowserify from 'util';

// Create a minimal implementation of missing methods
const utilShim = {
  ...utilBrowserify,
  debuglog: () => () => {},
  inspect: () => '',
  promisify: (fn) => async (...args) => new Promise((resolve, reject) => {
    fn(...args, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  }),
};

// Export the util module as the default export
export default utilShim;

// Also export all the individual methods
for (const key in utilShim) {
  if (Object.prototype.hasOwnProperty.call(utilShim, key)) {
    exports[key] = utilShim[key];
  }
}
`
  },
  {
    name: 'vm-shim.js',
    content: `
/**
 * VM API polyfill for Vercel
 */
// Implement a simple VM shim for browser environments
const vmShim = {
  runInThisContext: (code) => {
    try {
      return eval(code); // eslint-disable-line no-eval
    } catch (err) {
      console.error('VM runInThisContext error:', err);
      throw err;
    }
  },
  runInNewContext: (code, context) => {
    try {
      const contextStr = Object.keys(context || {})
        .map(key => \`const \${key} = this.\${key};\`)
        .join('\\n');
      
      const fn = new Function(\`\${contextStr}\\nreturn eval(\${JSON.stringify(code)});\`);
      return fn.call(context);
    } catch (err) {
      console.error('VM runInNewContext error:', err);
      throw err;
    }
  }
};

// Export the VM shim as the default export
export default vmShim;

// Also export all the individual methods
for (const key in vmShim) {
  if (Object.prototype.hasOwnProperty.call(vmShim, key)) {
    exports[key] = vmShim[key];
  }
}
`
  }
];

// Create the shim files in the shims directory
shims.forEach(shim => {
  const shimPath = path.resolve(__dirname, '../client/src/shims', shim.name);
  ensureFileExists(shimPath, shim.content);
});

// 3. Create or update .env file with Vercel-specific settings if needed
const envFilePath = path.resolve(__dirname, '../.env');
const vercelEnvContent = `# Vercel deployment environment variables
VITE_DEPLOYMENT_ENV=vercel
VITE_VECHAIN_NETWORK=test
VITE_VECHAIN_NODE_URL_TESTNET=https://testnet.veblocks.net
VITE_VECHAIN_NODE_URL_MAINNET=https://mainnet.veblocks.net
# Genesis IDs should be provided in Vercel environment or vercel.json
# VITE_VECHAIN_TESTNET_GENESIS_ID=0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127
# VITE_VECHAIN_MAINNET_GENESIS_ID=0x00000000851caf3cfdb44d49a556a3e1defc0ae1207be6ac36cc2d1b1c232409
`;

// Only create the .env file if it doesn't exist
if (!fs.existsSync(envFilePath)) {
  fs.writeFileSync(envFilePath, vercelEnvContent);
  console.log('✅ Created .env file with Vercel defaults');
} else {
  console.log('✅ .env file already exists, skipping');
}

// 4. Log environment information
try {
  console.log('Environment information:');
  console.log(`Node.js version: ${process.version}`);
  console.log(`Directory: ${process.cwd()}`);
  const packageJson = require('../package.json');
  console.log(`Package name: ${packageJson.name}`);
  console.log(`Package version: ${packageJson.version}`);
} catch (error) {
  console.error(`❌ Error logging environment info: ${error.message}`);
}

console.log('✅ Vercel pre-build preparation completed');