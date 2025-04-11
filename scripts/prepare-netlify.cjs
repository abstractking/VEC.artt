/**
 * Script to prepare Netlify-specific files for deployment
 * This ensures proper SPA routing and content-type configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Preparing Netlify configuration files...');

function ensureNetlifyFiles() {
  const distPublicDir = path.join(process.cwd(), 'dist/public');
  
  // Create the directory if it doesn't exist
  if (!fs.existsSync(distPublicDir)) {
    fs.mkdirSync(distPublicDir, { recursive: true });
    console.log('📁 Created dist/public directory');
  }
  
  // Create _redirects file for Netlify SPA routing
  const redirectsPath = path.join(distPublicDir, '_redirects');
  const redirectsContent = `# Netlify redirects for SPA
/*    /index.html   200
`;
  fs.writeFileSync(redirectsPath, redirectsContent, 'utf8');
  console.log('✅ Created _redirects file for SPA routing');
  
  // Create _headers file for content security policy
  const headersPath = path.join(distPublicDir, '_headers');
  const headersContent = `# Netlify headers for security and caching
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer-when-downgrade
  Content-Security-Policy: default-src 'self' https://*.vechain.org https://*.netlify.app; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.netlify.app; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://* blob:; connect-src 'self' https://* wss://* blob:; frame-src 'self' https://*.vechain.org

# Cache assets
/assets/*
  Cache-Control: public, max-age=31536000, immutable
`;
  fs.writeFileSync(headersPath, headersContent, 'utf8');
  console.log('✅ Created _headers file for security headers');
  
  // Create a netlify.toml in the dist directory (this isn't used, but helps debugging)
  const netlifyTOMLPath = path.join(distPublicDir, 'netlify.toml');
  const netlifyTOMLContent = `# Netlify configuration (dist copy for reference)
# The actual configuration is at the project root
[build]
  publish = "dist/public"
  command = "node scripts/netlify-build.cjs"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;
  fs.writeFileSync(netlifyTOMLPath, netlifyTOMLContent, 'utf8');
  console.log('✅ Created netlify.toml reference in dist directory');
  
  return true;
}

// Run the function
ensureNetlifyFiles();

// Export for import in other scripts
module.exports = {
  ensureNetlifyFiles,
};