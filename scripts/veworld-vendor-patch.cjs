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
    
    // Make a direct fix for the VeWorld wallet vendorOptions
    // Simpler approach to avoid patching issues - add a new method specifically for VeWorld
    const veWorldHandlerMatch = /case ['"]veworld['"]:[^]*?\/\/ Support for VeWorld wallet[^]*?throw new Error\(["']VeWorld wallet extension not detected["']\);/gs;
    
    // Attempt using regex match first
    if (content.match(veWorldHandlerMatch)) {
      console.log("📝 Found VeWorld handler in code, patching with regex...");
      
      // Create a new simple handler for VeWorld
      const newVeWorldHandler = `case 'veworld':
        // Support for VeWorld wallet
        if (typeof window !== 'undefined' && (window as any).vechain) {
          try {
            console.log("Connecting to VeWorld wallet...");
            
            const vechain = (window as any).vechain;
            console.log("VeWorld API methods available:", Object.keys(vechain));
            
            if (!vechain.isVeWorld) {
              throw new Error("Not a valid VeWorld wallet extension");
            }
            
            console.log("VeWorld wallet detected, creating Connex instance...");
            
            // The exact genesis ID values VeWorld expects
            const genesisIdMainnet = "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a";
            const genesisIdTestnet = "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127";
            
            // Get genesis ID based on network
            const networkType = network.name === 'MainNet' ? Network.MAIN : Network.TEST;
            const genesisId = networkType === Network.MAIN ? genesisIdMainnet : genesisIdTestnet;
            
            console.log("Using genesis ID:", genesisId, "for network:", networkType);
            
            if (typeof vechain.newConnex === 'function') {
              console.log("Creating Connex with simple genesis parameter");
              
              // Create a Connex instance first
              const connex = await vechain.newConnex({
                node: network.url,
                genesis: genesisId
              });
              
              if (typeof vechain.newConnexVendor === 'function') {
                console.log("Creating vendor with simple genesis parameter");
                
                // Create a vendor with direct genesis parameter
                const vendor = await vechain.newConnexVendor({
                  genesis: genesisId
                });
                
                return { connex, vendor };
              } else {
                throw new Error("VeWorld wallet missing newConnexVendor method");
              }
            } else {
              throw new Error("VeWorld wallet missing newConnex method");
            }
          } catch (error) {
            console.error("VeWorld wallet connection error:", error);
            throw new Error("VeWorld wallet not available or connection rejected");
          }
        } else {
          throw new Error("VeWorld wallet extension not detected");
        }`;
      
      content = content.replace(veWorldHandlerMatch, newVeWorldHandler);
      
      // Write the file back
      fs.writeFileSync(vechainFile, content);
      
      console.log("✅ Successfully patched VeWorld vendor handler");
      return true;
    } else {
      console.log("Using fallback method to add VeWorld handler directly...");
      
      // Try a different approach - look for the switch statement
      const switchMatch = /switch\s*\(\s*walletType\.toLowerCase\(\)\s*\)\s*{/g;
      
      if (content.match(switchMatch)) {
        console.log("Found wallet type switch statement");
        
        // Create our case handler
        const caseHandler = `
      case 'veworld':
        // Support for VeWorld wallet
        if (typeof window !== 'undefined' && (window as any).vechain) {
          try {
            console.log("Connecting to VeWorld wallet (patched)...");
            
            const vechain = (window as any).vechain;
            console.log("VeWorld API methods available:", Object.keys(vechain));
            
            if (!vechain.isVeWorld) {
              throw new Error("Not a valid VeWorld wallet extension");
            }
            
            // The exact genesis ID values VeWorld expects
            const genesisIdMainnet = "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a";
            const genesisIdTestnet = "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127";
            
            // Get genesis ID based on network
            const networkType = network.name === 'MainNet' ? Network.MAIN : Network.TEST;
            const genesisId = networkType === Network.MAIN ? genesisIdMainnet : genesisIdTestnet;
            
            if (typeof vechain.newConnex === 'function') {
              const connex = await vechain.newConnex({
                node: network.url,
                genesis: genesisId
              });
              
              if (typeof vechain.newConnexVendor === 'function') {
                const vendor = await vechain.newConnexVendor({
                  genesis: genesisId
                });
                
                return { connex, vendor };
              } else {
                throw new Error("VeWorld wallet missing newConnexVendor method");
              }
            } else {
              throw new Error("VeWorld wallet missing newConnex method");
            }
          } catch (error) {
            console.error("VeWorld wallet connection error:", error);
            throw new Error("VeWorld wallet not available or connection rejected");
          }
        } else {
          throw new Error("VeWorld wallet extension not detected");
        }`;
        
        // Insert our case handler after the switch statement
        content = content.replace(switchMatch, match => match + caseHandler);
        
        // Write the file
        fs.writeFileSync(vechainFile, content);
        console.log("✅ Successfully added VeWorld handler using fallback method");
        return true;
      } else {
        console.error("❌ Could not find VeWorld handler or switch statement in the code");
        return false;
      }
    }
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
  process.exit(1); // Exit with error code to make build fail gracefully
}

module.exports = { performVendorPatching };