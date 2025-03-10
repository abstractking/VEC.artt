import React, { createContext, useState, useEffect, useCallback } from "react";
import { connectWallet as connectVeChainWallet, getWalletAddress, getWalletBalance } from "@/lib/vechain";
import { useToast } from "@/hooks/use-toast";

interface WalletContextType {
  walletAddress: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isModalOpen: boolean;
  error: string | null;
  useRealWallet: boolean;
  walletBalance: {
    vet: string;
    vtho: string;
  };
  connectWallet: (walletType?: string) => Promise<void>;
  disconnectWallet: () => void;
  setModalOpen: (isOpen: boolean) => void;
  toggleRealWallet: () => void;
  refreshWalletBalance: () => Promise<void>;
}

export const WalletContext = createContext<WalletContextType | null>(null);

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  // For Replit development only - disable demo mode on Netlify
  const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');
  
  // Add debug mode for testing in environments without the wallet extension
  const isDebugMode = typeof window !== 'undefined' && 
    (import.meta.env.DEV || 
     window.location.hostname.includes('replit') || 
     (window.location.hostname.includes('netlify.app') && false) || // Disable demo mode on Netlify
     import.meta.env.MODE !== 'production');
     
  const testWalletAddress = '0xd41a7Be0D607e4cB8940DDf7E9Dc0657B91B4511'; // Test wallet address
  
  // Force real wallet mode on Netlify, allow toggle elsewhere
  const [useRealWallet, setUseRealWallet] = useState(() => {
    // Always use real wallet on Netlify
    if (isNetlify) {
      return true;
    }
    // Otherwise use stored preference or default to false
    return localStorage.getItem('useRealWallet') === 'true';
  });
  
  // Track which wallet type the user is connecting with
  const [walletType, setWalletType] = useState<string | null>(null);
  
  const [walletAddress, setWalletAddress] = useState<string | null>(
    (!useRealWallet && isDebugMode) ? testWalletAddress : null
  );
  const [isConnected, setIsConnected] = useState((!useRealWallet && isDebugMode)); // Auto-connect in debug mode only if not using real wallet
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModalOpen, setIsModalOpenState] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<{ vet: string; vtho: string }>({ vet: "0.00", vtho: "0.00" });
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
  
  // Function to refresh wallet balance
  const refreshWalletBalance = useCallback(async () => {
    if (walletAddress) {
      try {
        console.log("Refreshing wallet balance for:", walletAddress);
        const balance = await getWalletBalance(walletAddress);
        console.log("Wallet balance retrieved:", balance);
        setWalletBalance(balance);
      } catch (err) {
        console.error("Failed to refresh wallet balance:", err);
        // Don't show a toast for balance refresh errors to avoid spamming user
      }
    }
  }, [walletAddress]);

  // Set up periodic wallet balance refresh (every 10 seconds)
  useEffect(() => {
    // Only run if wallet is connected
    if (!isConnected || !walletAddress) return;
    
    // Refresh immediately on connection
    refreshWalletBalance();
    
    // Set up interval for balance updates
    const intervalId = setInterval(() => {
      refreshWalletBalance();
    }, 10000); // 10 seconds
    
    // Clean up interval on unmount or when wallet disconnects
    return () => clearInterval(intervalId);
  }, [isConnected, walletAddress, refreshWalletBalance]);

  const connectWallet = useCallback(async (walletType?: string) => {
    console.log("Attempting to connect wallet:", walletType || "VeChain", "Real wallet mode:", useRealWallet);
    setIsConnecting(true);
    setError(null);
    
    try {
      // On Netlify, always force real wallet mode
      if (isNetlify) {
        console.log("Netlify environment detected, forcing real wallet mode");
        
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
              description: `Connected to ${walletType || 'VeChain'} wallet on TestNet`,
            });
          } else {
            console.error("Wallet connect response does not match expected structure:", result);
            throw new Error("Failed to connect wallet");
          }
        } else {
          // Thor wallet not available, show more helpful message with TestNet info
          throw new Error("VeChain Thor wallet extension not detected. Please install the VeChain Thor wallet extension, configure it for TestNet, and refresh the page.");
        }
        return;
      }
      
      // If not using real wallet and in debug mode, use test wallet
      if (!useRealWallet && isDebugMode) {
        console.log("Using mock wallet connection with address:", testWalletAddress);
        setWalletAddress(testWalletAddress);
        setIsConnected(true);
        setModalOpen(false);
        
        toast({
          title: "Mock Wallet Connected",
          description: `Connected to test wallet: ${testWalletAddress.slice(0, 6)}...${testWalletAddress.slice(-4)}`,
        });
        return;
      }
      
      // If using real wallet, need Thor wallet extension
      if (useRealWallet) {
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
      } else {
        // In production without real wallet mode, use a mock wallet connection
        console.log("Using mock wallet connection in production with address:", testWalletAddress);
        setWalletAddress(testWalletAddress);
        setIsConnected(true);
        setModalOpen(false);
        
        toast({
          title: "Demo Wallet Connected",
          description: `Connected to demo wallet: ${testWalletAddress.slice(0, 6)}...${testWalletAddress.slice(-4)}`,
        });
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
  }, [toast, setModalOpen, isDebugMode, testWalletAddress, useRealWallet, isNetlify]);

  const disconnectWallet = useCallback(() => {
    console.log("Disconnecting wallet");
    setWalletAddress(null);
    setIsConnected(false);
    setWalletBalance({ vet: "0.00", vtho: "0.00" });
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  }, [toast]);
  
  // Toggle between real and mock wallet for development
  const toggleRealWallet = useCallback(() => {
    // If we're on Netlify, always stay in real wallet mode
    if (isNetlify) {
      toast({
        title: "Real Wallet Mode Required",
        description: "Demo wallet mode is disabled on Netlify. You must use a real wallet extension.",
        variant: "destructive",
      });
      return;
    }
    
    // If we're turning on real wallet mode, disconnect from any mock wallet first
    if (!useRealWallet) {
      // Disconnect any mock wallet if connected
      if (isConnected) {
        disconnectWallet();
      }
      
      // Set real wallet mode in localStorage
      localStorage.setItem('useRealWallet', 'true');
      setUseRealWallet(true);
      
      toast({
        title: "Real Wallet Mode Enabled",
        description: "You'll now interact with the actual VeChain blockchain",
      });
    } else {
      // If turning off real wallet mode, disconnect any real wallet first
      if (isConnected) {
        disconnectWallet();
      }
      
      // Set mock wallet mode in localStorage
      localStorage.setItem('useRealWallet', 'false');
      setUseRealWallet(false);
      
      toast({
        title: "Mock Wallet Mode Enabled",
        description: "You'll use simulated blockchain interactions",
      });
    }
  }, [useRealWallet, isConnected, disconnectWallet, toast, isNetlify]);

  const value = {
    walletAddress,
    isConnected,
    isConnecting,
    isModalOpen,
    error,
    useRealWallet,
    walletBalance,
    connectWallet,
    disconnectWallet,
    setModalOpen,
    toggleRealWallet,
    refreshWalletBalance,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}
