import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useVeChain } from './VeChainContext';
import { getWalletBalance } from '@/lib/vechain';
import { VeChainWalletType, detectBestWalletOption, verifyWalletAvailability, getWalletDisplayName } from '@/lib/wallet-detection';
import { connectSmartWallet } from '@/lib/mobile-wallet-connector';
import { connectVeWorld, isMobileDevice } from '@/lib/veworld-connector-new';
import { Network } from '@/lib/Network';
import { useToast } from '@/hooks/use-toast';
import WalletSelectionDialog from '@/components/WalletSelectionDialog';

interface WalletContextType {
  walletAddress: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isModalOpen: boolean;
  isWalletSelectionOpen: boolean;
  error: string | null;
  useRealWallet: boolean;
  walletType: VeChainWalletType | null;
  walletBalance: {
    vet: string;
    vtho: string;
  };
  connectWallet: (walletType?: VeChainWalletType) => Promise<void>;
  disconnectWallet: () => void;
  setModalOpen: (isOpen: boolean) => void;
  setWalletSelectionOpen: (isOpen: boolean) => void;
  toggleRealWallet: () => void;
  refreshWalletBalance: () => Promise<void>;
}

export const WalletContext = createContext<WalletContextType | null>(null);

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useRealWallet, setUseRealWallet] = useState(true);
  const [walletType, setWalletType] = useState<VeChainWalletType | null>(null);
  const [walletBalance, setWalletBalance] = useState({ vet: '0', vtho: '0' });
  
  // State for wallet selection dialog
  const [isWalletSelectionOpen, setIsWalletSelectionOpen] = useState(false);
  
  // Track connection in progress to prevent multiple attempts
  const connectionInProgress = useRef(false);

  const { toast } = useToast();
  
  // Get access to our VeChain context
  const vechain = useVeChain();

  // Load wallet state from local storage on initial load
  useEffect(() => {
    const savedWalletType = localStorage.getItem('walletType');
    const savedAddress = localStorage.getItem('walletAddress');
    const savedConnected = localStorage.getItem('walletConnected') === 'true';
    const savedUseRealWallet = localStorage.getItem('useRealWallet') !== 'false'; // Default to true
    
    // Only set the wallet type if it's one of our valid types
    if (savedWalletType && ['veworld', 'thor', 'sync', 'sync2', 'environment'].includes(savedWalletType)) {
      setWalletType(savedWalletType as VeChainWalletType);
    }
    
    if (savedAddress) setWalletAddress(savedAddress);
    if (savedConnected && savedAddress) setIsConnected(true);
    setUseRealWallet(savedUseRealWallet);
    
    // Auto-connect to vechain context
    if (vechain.account) {
      setWalletAddress(vechain.account);
      setIsConnected(true);
    }
  }, [vechain.account]);

  // Update wallet address when vechain context account changes
  useEffect(() => {
    if (vechain.account) {
      setWalletAddress(vechain.account);
      setIsConnected(true);
    }
  }, [vechain.account]);

  // Refresh wallet balance when address changes
  useEffect(() => {
    if (walletAddress && isConnected) {
      refreshWalletBalance();
    }
  }, [walletAddress, isConnected]);

  // Refresh wallet balance
  const refreshWalletBalance = useCallback(async () => {
    if (!walletAddress || !isConnected) return;
    
    try {
      const balance = await getWalletBalance(walletAddress);
      setWalletBalance(balance);
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
    }
  }, [walletAddress, isConnected]);

  // Connect to wallet
  const connectWallet = useCallback(async (preferredWalletType?: VeChainWalletType) => {
    // Prevent multiple connection attempts
    if (connectionInProgress.current) {
      console.log('Connection already in progress, ignoring this request');
      return;
    }
    
    // If no wallet type is specified and we're not on mobile, show the wallet selection dialog
    if (!preferredWalletType && !isMobileDevice()) {
      setIsWalletSelectionOpen(true);
      return; // Exit early, actual connection will happen after user selects a wallet
    }
    
    // Set connection in progress to prevent multiple attempts
    connectionInProgress.current = true;
    setIsConnecting(true);
    setError(null);
    
    try {
      // Determine which wallet to use
      const walletTypeToUse = preferredWalletType || detectBestWalletOption();
      
      console.log(`Initiating connection to wallet type: ${walletTypeToUse}`);
      
      // Verify wallet is available
      const walletStatus = verifyWalletAvailability(walletTypeToUse);
      if (!walletStatus.available) {
        throw new Error(walletStatus.message);
      }

      // Choose appropriate connector based on wallet type
      const networkType = import.meta.env.VITE_REACT_APP_VECHAIN_NETWORK === 'main' ? Network.MAIN : Network.TEST;
      
      // If this is VeWorld wallet, use our dedicated connector
      if (walletTypeToUse === 'veworld') {
        console.log('Using improved VeWorld connector...');
        
        const veWorldResult = await connectVeWorld(networkType);
        
        if (veWorldResult.error) {
          throw new Error(veWorldResult.error);
        }
        
        // Note: The vendor produced might not have address information directly
        // We need to get address from Connex or from signing a certificate
        if (veWorldResult.connex) {
          // Pass the connex instance to our VeChain context
          (vechain as any).connex = veWorldResult.connex;
          (vechain as any).vendor = veWorldResult.vendor;
          
          // Ask VeChain context to initialize with these objects
          await vechain.connect();
          
          if (vechain.account) {
            console.log('Connected successfully to VeWorld wallet:', vechain.account);
            setWalletAddress(vechain.account);
            setWalletType(walletTypeToUse);
            setIsConnected(true);
            setIsModalOpen(false);
            
            // Save to local storage
            localStorage.setItem('walletType', walletTypeToUse);
            localStorage.setItem('walletAddress', vechain.account);
            localStorage.setItem('walletConnected', 'true');
            
            // Get wallet balance
            refreshWalletBalance();
            
            toast({
              title: "Wallet Connected",
              description: `Connected to ${getWalletDisplayName(walletTypeToUse)}`,
            });
            
            return;
          } else {
            throw new Error('Connected to VeWorld but could not retrieve account');
          }
        } else if (veWorldResult.vendor) {
          // We have vendor but no connex, try to get address via VeChain context
          (vechain as any).vendor = veWorldResult.vendor;
          await vechain.connect();
          
          if (vechain.account) {
            // Update our state with the account
            setWalletAddress(vechain.account);
            setWalletType(walletTypeToUse);
            setIsConnected(true);
            setIsModalOpen(false);
            
            // Save to local storage
            localStorage.setItem('walletType', walletTypeToUse);
            localStorage.setItem('walletAddress', vechain.account);
            localStorage.setItem('walletConnected', 'true');
            
            // Get wallet balance
            refreshWalletBalance();
            
            toast({
              title: "Wallet Connected",
              description: `Connected to ${getWalletDisplayName(walletTypeToUse)}`,
            });
            
            return;
          } else {
            throw new Error('Connected to VeWorld but could not retrieve account');
          }
        } else {
          throw new Error('Could not connect to VeWorld wallet');
        }
      }
      
      // For mobile devices with other wallet types, use the mobile connector
      if (isMobileDevice()) {
        console.log(`Using mobile-optimized wallet connector for ${getWalletDisplayName(walletTypeToUse)}...`);
        
        // Use the smart mobile connector for better mobile experience
        const result = await connectSmartWallet(networkType);
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        if (result.connex && result.address) {
          // Pass the connex instance to our VeChain context
          (vechain as any).connex = result.connex;
          (vechain as any).vendor = result.vendor;
          await vechain.connect();
          
          console.log('Connected successfully to wallet via mobile connector:', result.address);
          setWalletAddress(result.address);
          setWalletType(walletTypeToUse);
          setIsConnected(true);
          setIsModalOpen(false);
          
          // Save to local storage
          localStorage.setItem('walletType', walletTypeToUse);
          localStorage.setItem('walletAddress', result.address);
          localStorage.setItem('walletConnected', 'true');
          
          // Get wallet balance
          refreshWalletBalance();
          
          toast({
            title: "Wallet Connected",
            description: `Connected to ${getWalletDisplayName(walletTypeToUse)}`,
          });
          
          return;
        }
      }
      
      // Standard connection method for other wallet types
      console.log(`Connecting to ${getWalletDisplayName(walletTypeToUse)} wallet...`);
      // Pass wallet type to VeChain connect method for prioritization
      const result = await vechain.connect(walletTypeToUse as string);
      
      if (result && vechain.account) {
        console.log('Connected successfully to wallet:', vechain.account);
        setWalletAddress(vechain.account);
        setWalletType(walletTypeToUse);
        setIsConnected(true);
        setIsModalOpen(false);
        
        // Save to local storage
        localStorage.setItem('walletType', walletTypeToUse);
        localStorage.setItem('walletAddress', vechain.account);
        localStorage.setItem('walletConnected', 'true');
        
        // Get wallet balance
        refreshWalletBalance();
        
        toast({
          title: "Wallet Connected",
          description: `Connected to ${getWalletDisplayName(walletTypeToUse)}`,
        });
      } else {
        throw new Error('Failed to connect to wallet - no account returned');
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err instanceof Error ? err.message : String(err));
      toast({
        title: "Connection Failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive"
      });
    } finally {
      // Reset connecting state and allow new connection attempts
      setIsConnecting(false);
      // Add a small delay before resetting the connectionInProgress flag to prevent rapid clicking
      setTimeout(() => {
        connectionInProgress.current = false;
      }, 1000); // 1 second cooldown before allowing another connection attempt
    }
  }, [vechain, toast, refreshWalletBalance]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setWalletAddress(null);
    setWalletType(null);
    setWalletBalance({ vet: '0', vtho: '0' });
    
    // Clear local storage
    localStorage.removeItem('walletType');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletConnected');
    
    // Disconnect from VeChain context
    vechain.disconnect();
    
    toast({
      title: "Wallet Disconnected",
      description: "You've been disconnected from your wallet",
    });
  }, [vechain, toast]);

  // Toggle between real and environment wallet
  const toggleRealWallet = useCallback(() => {
    // Disconnect current wallet first
    if (isConnected) {
      disconnectWallet();
    }
    
    // Toggle the setting
    setUseRealWallet(prev => {
      const newValue = !prev;
      localStorage.setItem('useRealWallet', String(newValue));
      return newValue;
    });
  }, [isConnected, disconnectWallet]);

  // Context value
  const value: WalletContextType = {
    walletAddress,
    isConnected,
    isConnecting,
    isModalOpen,
    isWalletSelectionOpen,
    error,
    useRealWallet,
    walletType,
    walletBalance,
    connectWallet,
    disconnectWallet,
    setModalOpen: setIsModalOpen,
    setWalletSelectionOpen: setIsWalletSelectionOpen,
    toggleRealWallet,
    refreshWalletBalance
  };

  // Handle wallet selection from dialog
  const handleWalletSelection = useCallback((selectedWalletType: VeChainWalletType) => {
    // Close the dialog and connect to the selected wallet
    setIsWalletSelectionOpen(false);
    
    // Use a small delay to allow the dialog to close
    setTimeout(() => {
      connectWallet(selectedWalletType);
    }, 300);
  }, [connectWallet]);

  return (
    <WalletContext.Provider value={value}>
      {children}
      
      {/* Wallet Selection Dialog */}
      <WalletSelectionDialog 
        isOpen={isWalletSelectionOpen}
        onClose={() => setIsWalletSelectionOpen(false)}
        onSelectWallet={handleWalletSelection}
      />
    </WalletContext.Provider>
  );
}

// Custom hook for using the wallet context
export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}