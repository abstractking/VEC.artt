import { executeContractMethod } from "./vechain";
import { VeCollabNFTABI, VeCollabNFTAddress } from "./contracts/VeCollabNFT";

// Function to mint an NFT
export async function mintNFT(tokenURI: string, recipient: string) {
  try {
    // Validate inputs
    if (!tokenURI) {
      throw new Error("Token URI is required for minting");
    }
    
    if (!recipient) {
      throw new Error("Recipient wallet address is required for minting");
    }
    
    // Find the mintNFT function in the ABI
    const mintFunction = VeCollabNFTABI.find(
      (item: any) => item.name === "mintNFT"
    );
    
    if (!mintFunction) {
      throw new Error("mintNFT function not found in ABI");
    }
    
    console.log(`Attempting to mint NFT for ${recipient} with URI: ${tokenURI}`);
    
    // Execute the contract method to mint the NFT
    const result = await executeContractMethod(
      VeCollabNFTAddress,
      VeCollabNFTABI,
      "mintNFT",
      [recipient, tokenURI]
    );
    
    if (!result || !result.txid) {
      throw new Error("Failed to mint NFT: Transaction didn't complete");
    }
    
    console.log(`NFT minted successfully. Transaction ID: ${result.txid}`);
    
    return result;
  } catch (error: any) {
    console.error("Error minting NFT:", error);
    // Provide more helpful error messages
    if (error.message?.includes("User rejected")) {
      throw new Error("Transaction was rejected in the wallet. Please try again.");
    } else if (error.message?.includes("wallet")) {
      throw new Error("Wallet connection issue: " + error.message);
    } else {
      throw new Error("Failed to mint NFT: " + (error.message || "Unknown error"));
    }
  }
}

// Function to generate metadata URI (simplified for now)
export function generateMetadataURI(nft: any) {
  // In a production environment, you would upload this metadata to IPFS
  // For demo purposes, we're constructing a mockup URI
  const metadata = {
    name: nft.name,
    description: nft.description,
    image: nft.imageUrl || "https://placeholder.com/nft-image.jpg",
    attributes: [
      {
        trait_type: "Category",
        value: nft.category
      },
      {
        trait_type: "Price",
        value: nft.price ? parseFloat(nft.price) : 0
      },
      {
        trait_type: "For Sale",
        value: nft.isForSale
      },
      {
        trait_type: "Biddable",
        value: nft.isBiddable
      }
    ]
  };
  
  // In a real application, you would upload this to IPFS and return the IPFS URI
  // For now, we'll return a mock URI with the stringified metadata
  return `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
}