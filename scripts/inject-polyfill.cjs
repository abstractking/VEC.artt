/**
 * Script to inject polyfills directly into the HTML template
 * This is used during Netlify builds to ensure crypto polyfills load early
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Injecting polyfills into index.html');

// Polyfill content to inject
const polyfillScript = `
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

// Create a thorCrypto global
window.thorCrypto = window.thorCrypto || {
  randomBytes: function(size) {
    const buffer = new Uint8Array(size);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(buffer);
    } else {
      for (let i = 0; i < size; i++) {
        buffer[i] = Math.floor(Math.random() * 256);
      }
    }
    return buffer;
  }
};

// Log that polyfills are initialized
console.log('Critical polyfills initialized via inline script');
`;

// Build an HTML injection function
function injectPolyfillToHTML(htmlFilePath) {
  try {
    // Check if the file exists, if not, create it
    if (!fs.existsSync(htmlFilePath)) {
      console.log(`HTML file not found: ${htmlFilePath} - Creating a default template`);
      
      // Create the directory if it doesn't exist
      const dir = path.dirname(htmlFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Create a basic HTML template
      const defaultHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VeCollab Marketplace</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
      
      fs.writeFileSync(htmlFilePath, defaultHTML, 'utf8');
      console.log(`✅ Created default HTML template at ${htmlFilePath}`);
    }

    // Read the HTML content
    let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

    // Inject the polyfill script right after the <head> tag
    htmlContent = htmlContent.replace(
      '<head>',
      `<head>
  <script>
    ${polyfillScript}
  </script>`
    );

    // Write the modified HTML
    fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
    console.log(`✅ Successfully injected polyfill into: ${htmlFilePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error injecting polyfill into HTML: ${error.message}`);
    return false;
  }
}

// Export for use in other scripts
module.exports = {
  injectPolyfillToHTML,
  polyfillScript
};

// If run directly
if (require.main === module) {
  const indexPath = path.join(__dirname, '../public/index.html');
  injectPolyfillToHTML(indexPath);
}