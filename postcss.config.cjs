/**
 * CommonJS version of PostCSS config
 * This is used as a fallback for environments that don't support ESM
 */

// Create an empty plugins object
const plugins = {};

// Only add tailwindcss if it's available
try {
  // CommonJS require
  const tailwindcss = require('tailwindcss');
  plugins.tailwindcss = {};
  console.log('Tailwind CSS configured in PostCSS (CJS)');
} catch (e) {
  console.warn('Tailwind CSS not available, skipping in PostCSS config (CJS)');
}

// Only add autoprefixer if it's available
try {
  // CommonJS require
  const autoprefixer = require('autoprefixer');
  plugins.autoprefixer = {};
  console.log('Autoprefixer configured in PostCSS (CJS)');
} catch (e) {
  console.warn('Autoprefixer not available, skipping in PostCSS config (CJS)');
}

// CommonJS export
module.exports = {
  plugins
};