/**
 * Script to ensure that a valid index.html exists for the build process
 * This is used during Netlify builds as a fallback for deployment
 */

const fs = require('fs');
const path = require('path');

function ensureClientIndexHTML() {
  console.log('🔍 Checking for client/index.html...');
  
  // Locations to check for index.html
  const paths = [
    path.join(__dirname, '../client/index.html'),
    path.join(__dirname, '../public/index.html')
  ];
  
  let foundIndex = false;
  
  // Check all possible paths
  for (const indexPath of paths) {
    if (fs.existsSync(indexPath)) {
      console.log(`✅ Found index.html at ${indexPath}`);
      foundIndex = true;
      
      // If found in public, copy to client if needed
      if (indexPath.includes('/public/') && !fs.existsSync(path.join(__dirname, '../client/index.html'))) {
        const clientDir = path.join(__dirname, '../client');
        if (!fs.existsSync(clientDir)) {
          fs.mkdirSync(clientDir, { recursive: true });
        }
        fs.copyFileSync(indexPath, path.join(clientDir, 'index.html'));
        console.log('✅ Copied index.html from public to client directory');
      }
    }
  }
  
  // If no index.html found in any location, create one
  if (!foundIndex) {
    console.log('⚠️ No index.html found, creating a default one...');
    
    // Create client directory if needed
    const clientDir = path.join(__dirname, '../client');
    if (!fs.existsSync(clientDir)) {
      fs.mkdirSync(clientDir, { recursive: true });
    }
    
    // Create a basic index.html file
    const defaultHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VeCollab Marketplace</title>
    <script>
      // Basic polyfills
      if (typeof window !== 'undefined' && !window.crypto) {
        window.crypto = { getRandomValues: function(buffer) { for (let i = 0; i < buffer.length; i++) { buffer[i] = Math.floor(Math.random() * 256); } return buffer; } };
      }
      if (typeof window !== 'undefined' && !window.Buffer) {
        window.Buffer = { from: function(data) { if (typeof data === 'string') { return new TextEncoder().encode(data); } return new Uint8Array(data); }, isBuffer: function() { return false; } };
      }
      if (typeof window !== 'undefined' && !window.global) {
        window.global = window;
      }
      console.log('Default polyfills initialized');
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
    
    fs.writeFileSync(path.join(clientDir, 'index.html'), defaultHTML, 'utf8');
    console.log('✅ Created default index.html in client directory');
    
    // Also create it in public for completeness
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicDir, 'index.html'), defaultHTML, 'utf8');
    console.log('✅ Created default index.html in public directory');
  }
  
  // Ensure client/src directory exists
  const srcDir = path.join(__dirname, '../client/src');
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }
  
  return true;
}

// Run the function if executed directly
if (require.main === module) {
  ensureClientIndexHTML();
}

module.exports = {
  ensureClientIndexHTML
};