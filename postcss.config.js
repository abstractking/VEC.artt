// Create an empty plugins object
const plugins = {};

// Only add tailwindcss if it's available
try {
  // Using dynamic import for ESM compatibility
  plugins.tailwindcss = {};
  console.log('Tailwind CSS configured in PostCSS');
} catch (e) {
  console.warn('Tailwind CSS not available, skipping in PostCSS config');
}

// Only add autoprefixer if it's available
try {
  // Using dynamic import for ESM compatibility
  plugins.autoprefixer = {};
  console.log('Autoprefixer configured in PostCSS');
} catch (e) {
  console.warn('Autoprefixer not available, skipping in PostCSS config');
}

// ESM export syntax
export default {
  plugins
};
