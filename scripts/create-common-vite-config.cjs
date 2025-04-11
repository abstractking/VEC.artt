/**
 * This script creates a CommonJS version of the vite config
 * as a last-resort fallback for builds that have issues with ESM
 */

const fs = require('fs');
const path = require('path');

module.exports = function createCommonConfig() {
  console.log('🔧 Creating CommonJS vite config fallback...');
  
  // Super minimal CommonJS config that doesn't rely on plugins or imports
  const cjsConfig = `
const { defineConfig } = require('vite');

// Attempt to load the react plugin if available
let reactPlugin;
try {
  reactPlugin = require('@vitejs/plugin-react');
} catch (e) {
  console.warn('React plugin not available, continuing without it');
}

module.exports = defineConfig({
  plugins: reactPlugin ? [reactPlugin()] : [],
  build: {
    outDir: 'dist/public',
  },
  define: {
    'global': 'window'
  }
});`;

  fs.writeFileSync(path.resolve('./vite.config.cjs'), cjsConfig, 'utf8');
  console.log('✅ CommonJS config created at vite.config.cjs');
  
  return path.resolve('./vite.config.cjs');
};