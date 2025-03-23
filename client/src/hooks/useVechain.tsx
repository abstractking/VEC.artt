import { useContext } from "react";
import { WalletContext } from "@/contexts/WalletContext";
import { VeChainContext } from "@/contexts/VeChainContext";

// Hook for accessing wallet functionality
export function useWallet() {
  const context = useContext(WalletContext);
  
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  
  return context;
}

// Hook for accessing VeChain blockchain functionality
export function useVeChain() {
  const context = useContext(VeChainContext);
  
  if (!context) {
    throw new Error("useVeChain must be used within a VeChainProvider");
  }
  
  return context;
}
