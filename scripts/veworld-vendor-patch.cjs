/**
 * VeWorld Vendor Patch
 * 
 * This script patches the VeWorld vendor options to ensure compatibility with
 * different versions and implementations of the VeWorld wallet.
 * 
 * The VeWorld wallet extension has very specific requirements for the
 * format of the vendor options, and this patch ensures that our code
 * meets those requirements.
 */

const fs = require('fs');
const path = require('path');

// Check environment
console.log("Running VeWorld vendor patch to fix genesisId compatibility issues...");

function performVendorPatching() {
  try {
    // Get the location of the vechain.ts file
    const vechainFile = path.resolve(__dirname, '../client/src/lib/vechain.ts');
    
    if (!fs.existsSync(vechainFile)) {
      console.error("❌ Could not find vechain.ts file");
      return false;
    }
    
    console.log(`📋 Found vechain.ts file at ${vechainFile}`);
    
    // Read the file content
    let content = fs.readFileSync(vechainFile, 'utf8');
    
    // Make our changes to vendor options
    // Replace the vendor options code with a direct implementation
    const oldVendorOptions = `// Based on the GenesisId validation error, it seems we need a more direct approach
                // Let's try using the most minimal format possible - no explicit network object
                const vendorOptions = networkType === Network.MAIN 
                  ? { genesis: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a" } 
                  : { genesis: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127" };`;
                
    const newVendorOptions = `// Direct genesis implementation for VeWorld compatibility
                // This matches EXACTLY what VeWorld expects
                // The genesis ID must be passed directly without nesting
                const genesisId = networkType === Network.MAIN 
                  ? "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a"
                  : "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127";
                
                const vendorOptions = { genesis: genesisId };`;
    
    // Replace the content
    content = content.replace(oldVendorOptions, newVendorOptions);
    
    // Update console logs for better debugging
    const oldConsoleLog = `console.log("Creating vendor with options:", vendorOptions);
                console.log("Vendor options JSON:", JSON.stringify(vendorOptions));`;
                
    const newConsoleLog = `console.log("Creating vendor with options (direct genesis approach):", vendorOptions);
                console.log("Vendor options JSON:", JSON.stringify(vendorOptions));
                console.log("Genesis ID used:", genesisId);`;
    
    content = content.replace(oldConsoleLog, newConsoleLog);
    
    // Write the file back
    fs.writeFileSync(vechainFile, content);
    
    console.log("✅ Successfully patched VeWorld vendor options");
    return true;
  } catch (error) {
    console.error("❌ Error patching VeWorld vendor options:", error);
    return false;
  }
}

// Execute the patching
const success = performVendorPatching();
console.log(`VeWorld vendor patch ${success ? '✅ completed successfully' : '❌ failed'}`);

if (success) {
  console.log("Remember to rebuild the project after this patch!");
} else {
  console.error("Please check the error messages above and try again.");
}

module.exports = { performVendorPatching };