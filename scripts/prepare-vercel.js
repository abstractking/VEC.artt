/**
 * Prepare script for Vercel deployment
 * This script handles necessary modifications to make the app work on Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Preparing application for Vercel deployment...');

// Create a vite.config.vercel.js file optimized for Vercel deployment
const createVercelConfig = () => {
  console.log('📝 Creating Vercel-specific Vite configuration...');
  
  const configContent = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  root: path.resolve(__dirname, 'client'),
  plugins: [
    react(),
    // Add Node.js polyfills with specific options to fix Vercel deployment issues
    nodePolyfills({
      // Whether to polyfill specific Node.js globals
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Whether to polyfill Node.js builtins
      protocolImports: true,
      // Overrides for specific polyfills
      overrides: {
        // Override https module handling to avoid issues with Agent
        https: true,
        http: true,
        crypto: true,
      },
    }),
  ],
  define: {
    // Define global variables for browser environment
    'global': 'globalThis',
    'process.env': process.env,
  },
  resolve: {
    alias: {
      // Add aliases for common imports
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
      // Override problematic modules with empty shims
      'https': path.resolve(__dirname, './client/src/shims/https-shim.js'),
      'http': path.resolve(__dirname, './client/src/shims/http-shim.js'),
      'stream': path.resolve(__dirname, './client/src/shims/stream-shim.js'),
      'util': path.resolve(__dirname, './client/src/shims/util-shim.js'),
    }
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/public'),
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true, // Handle mixed ES/CommonJS modules
    },
    rollupOptions: {
      // Externalize problematic dependencies
      external: [
        // List any Node.js built-in modules that cause issues
      ],
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      // Define global variables during dependency optimization
      define: {
        global: 'globalThis'
      },
    }
  },
  server: {
    // Configure dev server to handle API requests
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
  `;
  
  fs.writeFileSync(path.join(__dirname, '../vite.config.vercel.js'), configContent, 'utf8');
  console.log('✅ Created Vercel-specific Vite configuration');
};

// Create necessary shim files for Node.js built-ins
const createShimFiles = () => {
  console.log('📝 Creating shim files for Node.js built-ins...');
  
  const shimDir = path.join(__dirname, '../client/src/shims');
  if (!fs.existsSync(shimDir)) {
    fs.mkdirSync(shimDir, { recursive: true });
  }
  
  // HTTPS shim
  const httpsShim = `
// Minimal HTTPS shim for browser environments
export class Agent {
  constructor() {
    // Minimal implementation
  }
}

export default {
  Agent,
  request: () => {
    throw new Error('https.request is not supported in browser environments');
  },
  get: () => {
    throw new Error('https.get is not supported in browser environments');
  }
};
`;
  fs.writeFileSync(path.join(shimDir, 'https-shim.js'), httpsShim, 'utf8');
  
  // HTTP shim
  const httpShim = `
// Minimal HTTP shim for browser environments
export class Agent {
  constructor() {
    // Minimal implementation
  }
}

export default {
  Agent,
  request: () => {
    throw new Error('http.request is not supported in browser environments');
  },
  get: () => {
    throw new Error('http.get is not supported in browser environments');
  }
};
`;
  fs.writeFileSync(path.join(shimDir, 'http-shim.js'), httpShim, 'utf8');
  
  // Stream shim
  const streamShim = `
// Minimal Stream shim for browser environments
export class Transform {
  constructor() {
    // Minimal implementation
  }
  
  _transform() {
    // Minimal implementation
  }
  
  pipe() {
    // Minimal implementation
    return this;
  }
}

export class Readable {
  constructor() {
    // Minimal implementation
  }
  
  pipe() {
    // Minimal implementation
    return this;
  }
}

export class Writable {
  constructor() {
    // Minimal implementation
  }
}

export default {
  Transform,
  Readable,
  Writable
};
`;
  fs.writeFileSync(path.join(shimDir, 'stream-shim.js'), streamShim, 'utf8');
  
  // Util shim
  const utilShim = `
// Minimal Util shim for browser environments
export const debuglog = () => () => {};
export const inspect = (obj) => JSON.stringify(obj);
export const format = (...args) => args.join(' ');
export const inherits = (ctor, superCtor) => {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

export default {
  debuglog,
  inspect,
  format,
  inherits
};
`;
  fs.writeFileSync(path.join(shimDir, 'util-shim.js'), utilShim, 'utf8');
  
  console.log('✅ Created shim files for Node.js built-ins');
};

// Create polyfill file for client-side
const createPolyfillFile = () => {
  console.log('📝 Creating polyfill file for client-side...');
  
  const polyfillContent = `/**
 * Browser polyfills for VeChain compatibility
 */

// Ensure global is defined
if (typeof window !== 'undefined' && !window.global) {
  window.global = window;
}

// Ensure process is defined
if (typeof window !== 'undefined' && !window.process) {
  window.process = { env: {}, browser: true };
}

// Ensure Buffer is available
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = {
    from: function(data, encoding) {
      if (typeof data === 'string') {
        return new TextEncoder().encode(data);
      }
      return new Uint8Array(data);
    },
    isBuffer: function() { return false; },
    alloc: function(size) {
      return new Uint8Array(size);
    }
  };
}

// Ensure crypto is available
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

console.log('Critical polyfills initialized via inline script');
`;
  
  fs.writeFileSync(path.join(__dirname, '../client/src/vercel-polyfills.js'), polyfillContent, 'utf8');
  console.log('✅ Created polyfill file for client-side');
};

// Update package.json to add Vercel-specific build command
const updatePackageJson = () => {
  console.log('📝 Updating package.json for Vercel compatibility...');
  
  try {
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add Vercel-specific build command
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts['build:vercel'] = 'vite build --config vite.config.vercel.js';
    
    // Update the main build command if it's for Vercel
    if (process.env.VITE_DEPLOYMENT_ENV === 'vercel') {
      packageJson.scripts.build = packageJson.scripts['build:vercel'];
    }
    
    // Make sure we have the required dependencies
    packageJson.dependencies = packageJson.dependencies || {};
    packageJson.devDependencies = packageJson.devDependencies || {};
    
    if (!packageJson.dependencies['vite-plugin-node-polyfills'] && !packageJson.devDependencies['vite-plugin-node-polyfills']) {
      packageJson.devDependencies['vite-plugin-node-polyfills'] = '^0.21.0';
    }
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    console.log('✅ Updated package.json for Vercel compatibility');
  } catch (error) {
    console.error('❌ Failed to update package.json:', error);
  }
};

// Modify index.html to include polyfills
const updateIndexHtml = () => {
  console.log('📝 Updating index.html to include polyfills...');
  
  try {
    // Try both possible locations
    let indexHtmlPath = path.join(__dirname, '../client/index.html');
    if (!fs.existsSync(indexHtmlPath)) {
      indexHtmlPath = path.join(__dirname, '../public/index.html');
    }
    
    if (fs.existsSync(indexHtmlPath)) {
      let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
      
      // Check if polyfill script is already included
      if (!htmlContent.includes('vercel-polyfills.js')) {
        // Insert polyfill script before the first script tag
        htmlContent = htmlContent.replace('<head>', '<head>\n    <script type="module" src="/src/vercel-polyfills.js"></script>');
        fs.writeFileSync(indexHtmlPath, htmlContent, 'utf8');
        console.log('✅ Updated index.html to include polyfills');
      } else {
        console.log('ℹ️ Polyfill script already included in index.html');
      }
    } else {
      console.warn('⚠️ Could not find index.html to update');
    }
  } catch (error) {
    console.error('❌ Failed to update index.html:', error);
  }
};

// Run all preparation steps
const runPrepare = () => {
  createVercelConfig();
  createShimFiles();
  createPolyfillFile();
  updatePackageJson();
  updateIndexHtml();
  
  console.log('✅ Application prepared for Vercel deployment! 🚀');
};

runPrepare();