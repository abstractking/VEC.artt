import React, { createContext, useState, useEffect, useCallback } from "react";
import { connectWallet as connectVeChainWallet, getWalletAddress } from "@/lib/vechain";
import { useToast } from "@/hooks/use-toast";

interface WalletContextType {
  walletAddress: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isModalOpen: boolean;
  error: string | null;
  connectWallet: (walletType?: string) => Promise<void>;
  disconnectWallet: () => void;
  setModalOpen: (isOpen: boolean) => void;
}

export const WalletContext = createContext<WalletContextType | null>(null);

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModalOpen, setIsModalOpenState] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Use useCallback for setModalOpen to ensure stable reference
  const setModalOpen = useCallback((isOpen: boolean) => {
    console.log("Setting modal open state to:", isOpen);
    setIsModalOpenState(isOpen);
  }, []);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        // Check if Thor wallet extension is available
        if ((window as any).thor) {
          const address = await getWalletAddress();
          if (address) {
            setWalletAddress(address);
            setIsConnected(true);
          }
        }
      } catch (err) {
        console.error("Failed to check wallet connection:", err);
        // Don't show an error toast here as it's just a check
      }
    };

    checkWalletConnection();
  }, []);

  const connectWallet = useCallback(async (walletType?: string) => {
    console.log("Attempting to connect wallet:", walletType || "VeChain");
    setIsConnecting(true);
    setError(null);
    
    try {
      // Check if Thor wallet extension is available
      if (typeof window !== 'undefined' && (window as any).thor) {
        // Connect to VeChain wallet
        const result = await connectVeChainWallet();
        
        console.log("Wallet Connect Result:", result); // Debug log to check result structure
        
        if (result && result.vendor && result.vendor.address) {
          console.log("Setting wallet address to:", result.vendor.address);
          setWalletAddress(result.vendor.address);
          setIsConnected(true);
          setModalOpen(false);
          
          toast({
            title: "Wallet Connected",
            description: `Connected to ${walletType || 'VeChain'} wallet`,
          });
        } else {
          console.error("Wallet connect response does not match expected structure:", result);
          throw new Error("Failed to connect wallet");
        }
      } else {
        // Thor wallet not available, show more helpful message
        throw new Error("VeChain Thor wallet extension not detected. Please install the VeChain Thor wallet extension and refresh the page.");
      }
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      setError(err.message || "Failed to connect wallet");
      
      toast({
        title: "Connection Failed",
        description: err.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [toast, setModalOpen]);

  const disconnectWallet = useCallback(() => {
    console.log("Disconnecting wallet");
    setWalletAddress(null);
    setIsConnected(false);
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  }, [toast]);

  const value = {
    walletAddress,
    isConnected,
    isConnecting,
    isModalOpen,
    error,
    connectWallet,
    disconnectWallet,
    setModalOpen,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}
