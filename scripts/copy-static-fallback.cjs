/**
 * Script to copy static fallback files to the build directory
 * This ensures the static fallback HTML is available for Netlify error handling
 */

const fs = require('fs');
const path = require('path');

// Paths configuration
const sourceDir = path.resolve(__dirname, '../public');
const targetDir = path.resolve(__dirname, '../dist/public');

// Files to copy
const filesToCopy = [
  'static-fallback.html',
  // Add other fallback assets here if needed
];

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  console.log('Creating target directory:', targetDir);
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy each file
filesToCopy.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied: ${file} to build directory`);
  } else {
    console.warn(`Warning: Could not find source file: ${sourcePath}`);
  }
});

console.log('Static fallback files copy complete!');