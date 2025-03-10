/**
 * This script patches the thor-devkit module to use browser-compatible crypto functions
 * It should be run before the build process
 */

const fs = require('fs');
const path = require('path');

// Paths to the files we need to patch
const secp256k1Path = path.resolve('./node_modules/thor-devkit/esm/secp256k1.js');
const mnemonicPath = path.resolve('./node_modules/thor-devkit/esm/mnemonic.js');
const hdnodePath = path.resolve('./node_modules/thor-devkit/esm/hdnode.js');

// Function to patch a file
function patchFile(filePath, searchString, replacement) {
  console.log(`Patching file: ${filePath}`);
  
  try {
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

console.log('Patching completed!');