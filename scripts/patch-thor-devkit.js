/**
 * This script patches the thor-devkit module to use browser-compatible crypto functions
 * It should be run before the build process
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Log start of process
console.log('Starting VeChain Thor-devkit patching process...');

// Run the improved patch script if it exists
const patchImprovedPath = path.resolve('./scripts/patch-thor-devkit-improved.cjs');
const patchLegacyPath = path.resolve('./scripts/patch-thor-devkit.cjs');

if (fs.existsSync(patchImprovedPath)) {
  console.log('Found improved patching script, executing...');
  try {
    execSync(`node ${patchImprovedPath}`, { stdio: 'inherit' });
    console.log('Successfully ran improved patching script!');
  } catch (error) {
    console.error('Error running improved patching script:', error.message);
    console.log('Falling back to legacy patch script...');
    
    // Try the legacy script if the improved one fails
    if (fs.existsSync(patchLegacyPath)) {
      try {
        execSync(`node ${patchLegacyPath}`, { stdio: 'inherit' });
        console.log('Successfully ran legacy patching script!');
      } catch (legacyError) {
        console.error('Error running legacy patching script:', legacyError.message);
        console.log('Attempting basic patching as a last resort...');
        performBasicPatching();
      }
    } else {
      console.log('Legacy patch script not found, performing basic patching...');
      performBasicPatching();
    }
  }
} else if (fs.existsSync(patchLegacyPath)) {
  console.log('Found legacy patching script, executing...');
  try {
    execSync(`node ${patchLegacyPath}`, { stdio: 'inherit' });
    console.log('Successfully ran legacy patching script!');
  } catch (error) {
    console.error('Error running legacy patching script:', error.message);
    console.log('Performing basic patching...');
    performBasicPatching();
  }
} else {
  console.log('No existing patch scripts found, performing basic patching...');
  performBasicPatching();
}

// Basic fallback patching function
function performBasicPatching() {
  // Paths to the files we need to patch
  const secp256k1Path = path.resolve('./node_modules/thor-devkit/esm/secp256k1.js');
  const mnemonicPath = path.resolve('./node_modules/thor-devkit/esm/mnemonic.js');
  const hdnodePath = path.resolve('./node_modules/thor-devkit/esm/hdnode.js');

  // Function to patch a file
  function patchFile(filePath, searchString, replacement) {
    console.log(`Patching file: ${filePath}`);
    
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
      }
      
      // Read the file
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check if the file contains the string we're looking for
      if (content.includes(searchString)) {
        // Replace the string
        const patchedContent = content.replace(searchString, replacement);
        
        // Write the patched content back to the file
        fs.writeFileSync(filePath, patchedContent, 'utf8');
        console.log(`Successfully patched: ${filePath}`);
      } else {
        console.log(`String not found in ${filePath}, skipping...`);
      }
    } catch (error) {
      console.error(`Error patching ${filePath}:`, error);
    }
  }

  // Patches for each file
  const patches = [
    {
      path: secp256k1Path,
      search: `import { randomBytes } from 'crypto';`,
      replace: `import { randomBytes } from 'crypto-browserify';`
    },
    {
      path: mnemonicPath,
      search: `import crypto from 'crypto';`,
      replace: `import crypto from 'crypto-browserify';`
    },
    {
      path: hdnodePath,
      search: `import crypto from 'crypto';`,
      replace: `import crypto from 'crypto-browserify';`
    }
  ];

  // Apply all patches
  patches.forEach(patch => {
    patchFile(patch.path, patch.search, patch.replace);
  });

  console.log('Basic patching completed!');
}

console.log('All patching operations complete!');