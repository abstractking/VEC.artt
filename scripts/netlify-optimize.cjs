/**
 * Optimizations for Netlify deployment
 * This script enhances the build process with better error handling and environment-specific tweaks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Log with timestamps
function log(message) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} | ${message}`);
}

// Error handling wrapper
function safeExec(command, options = {}) {
  try {
    log(`Running: ${command}`);
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    log(`Command failed: ${command}`);
    log(error.message);
    return false;
  }
}

function optimizeForNetlify() {
  log('Starting Netlify-specific optimizations');

  // Add package.json script for Netlify
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Add specific Netlify build script if it doesn't exist
      if (!packageJson.scripts.netlify) {
        packageJson.scripts.netlify = "vite build --config vite.config.netlify.js && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist";
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
        log('Added netlify script to package.json');
      }
    } catch (error) {
      log(`Error updating package.json: ${error.message}`);
    }
  }

  // Create .npmrc file to ensure dependencies install properly on Netlify
  const npmrcPath = path.join(process.cwd(), '.npmrc');
  const npmrcContent = `
# Netlify build optimizations
legacy-peer-deps=true
node-linker=hoisted
prefer-offline=true
`;
  fs.writeFileSync(npmrcPath, npmrcContent, 'utf8');
  log('Created .npmrc file for Netlify');

  // Create _redirects file for Netlify SPA routing
  const distDir = path.join(process.cwd(), 'dist/public');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  const redirectsPath = path.join(distDir, '_redirects');
  const redirectsContent = `
# Netlify redirects file
# Redirect all routes to index.html for SPA routing
/*    /index.html   200
`;
  fs.writeFileSync(redirectsPath, redirectsContent, 'utf8');
  log('Created _redirects file for Netlify SPA routing');

  // Create a fallback index.html file in the dist directory
  const fallbackHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VeCollab Marketplace</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: #f5f5f5;
      color: #333;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      text-align: center;
    }
    .container {
      max-width: 800px;
      padding: 40px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #7928ca;
    }
  </style>
  <script>
    // Ensure crypto is available early
    if (typeof window !== 'undefined' && !window.crypto) {
      window.crypto = {
        getRandomValues: function(buffer) {
          for (let i = 0; i < buffer.length; i++) {
            buffer[i] = Math.floor(Math.random() * 256);
          }
          return buffer;
        }
      };
    }

    // Ensure Buffer is available early
    if (typeof window !== 'undefined' && !window.Buffer) {
      window.Buffer = {
        from: function(data) {
          if (typeof data === 'string') {
            return new TextEncoder().encode(data);
          }
          return new Uint8Array(data);
        },
        isBuffer: function() { return false; }
      };
    }

    // Minimal global needed for some libraries
    if (typeof window !== 'undefined' && !window.global) {
      window.global = window;
    }

    console.log('Critical polyfills initialized via inline script');
  </script>
</head>
<body>
  <div class="container">
    <h1>VeCollab Marketplace</h1>
    <p>Welcome to VeCollab - a decentralized NFT marketplace on VeChain blockchain.</p>
    <p id="status">Loading application...</p>
  </div>
  <script>
    // This script redirects to the actual application
    setTimeout(function() {
      window.location.href = '/';
    }, 3000);
  </script>
</body>
</html>`;

  const fallbackHTMLPath = path.join(distDir, 'fallback.html');
  fs.writeFileSync(fallbackHTMLPath, fallbackHTML, 'utf8');
  log('Created fallback.html in dist directory');

  // Patch the problem modules if needed
  try {
    // Ensure thor-devkit ESM compatibility
    const thorDevkitPath = path.join(process.cwd(), 'node_modules/thor-devkit');
    if (fs.existsSync(thorDevkitPath)) {
      log('Patching thor-devkit for ESM compatibility...');
      
      // Copy our thor-polyfills to the distribution
      const polyfillsSrc = path.join(process.cwd(), 'client/src/lib/thor-polyfills.ts');
      const polyfillsDest = path.join(distDir, 'thor-polyfills.js');
      
      if (fs.existsSync(polyfillsSrc)) {
        // We need to process the TS file for browser
        safeExec(`npx esbuild ${polyfillsSrc} --outfile=${polyfillsDest} --bundle --format=esm`);
        log('Generated thor-polyfills.js for browser use');
      }
    }
  } catch (error) {
    log(`Error patching modules: ${error.message}`);
  }

  log('Netlify optimizations completed');
  return true;
}

// Run the optimizations if called directly
if (require.main === module) {
  optimizeForNetlify();
}

module.exports = {
  optimizeForNetlify
};