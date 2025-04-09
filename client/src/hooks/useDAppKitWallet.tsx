import { useState, useEffect, useCallback } from 'react';
import { useWallet, useWalletModal } from '@vechain/dapp-kit-react';
import { useDAppKit } from '@/contexts/DAppKitProvider';
import { VeChainWalletType } from '@/lib/wallet-detection';
import { useToast } from '@/hooks/use-toast';

export interface UseDAppKitWalletReturn {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  connect: (walletType?: VeChainWalletType) => Promise<void>;
  disconnect: () => void;
}

export function useDAppKitWallet(): UseDAppKitWalletReturn {
  const { web3Modal } = useDAppKit();
  const walletContext = useWallet();
  const walletModal = useWalletModal();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Check if connected
  const isConnected = !!walletContext.account;
  const address = walletContext.account;

  // Connect to wallet based on type
  const connect = useCallback(async (walletType?: VeChainWalletType) => {
    try {
      setIsConnecting(true);
      setError(null);

      console.log(`Attempting to connect to wallet type: ${walletType}`);
      
      // Check if on mobile for specialized mobile handling
      const mobileDetection = await import('@/lib/mobile-wallet-connector');
      const isMobile = mobileDetection.isMobileDevice();
      
      console.log(`Device detection: ${isMobile ? 'Mobile' : 'Desktop'} device`);

      // Different connection strategies based on wallet type
      if (walletType === 'walletconnect' || walletType === 'wallet-connect') {
        // Open WalletConnect modal
        web3Modal.open();
      } else if (walletType === 'veworld') {
        console.log('Connecting to VeWorld wallet...');
        
        // Use mobile-optimized connector for mobile devices
        if (isMobile) {
          try {
            console.log('Using mobile-optimized VeWorld connector');
            const result = await mobileDetection.connectMobileWallet();
            
            if (result.error) {
              console.error('Mobile VeWorld connection error:', result.error);
              throw new Error(result.error);
            }
            
            // If successfully connected with the mobile connector,
            // also update the DAppKit state for consistency
            if (result.address) {
              // Can't directly set account in walletContext, so we need to use connect
              walletContext.setSource('veworld');
              await walletContext.connect(); // This should update the account
              console.log('Successfully connected to VeWorld on mobile:', result.address);
            } else {
              throw new Error('No wallet address returned from VeWorld mobile connection');
            }
          } catch (mobileError) {
            console.error('Error with mobile VeWorld connection:', mobileError);
            
            // Fallback to standard vechain connector
            const vechainModule = await import('@/lib/vechain');
            await vechainModule.connectWallet('veworld');
            
            // Update DAppKit state
            walletContext.setSource(walletType);
            await walletContext.connect();
          }
        } else {
          // Desktop VeWorld connection
          try {
            const vechainModule = await import('@/lib/vechain');
            await vechainModule.connectWallet('veworld');
            
            // Update DAppKit state
            walletContext.setSource(walletType);
            await walletContext.connect();
          } catch (error) {
            console.error('Error connecting to VeWorld on desktop:', error);
            throw error;
          }
        }
      } else if (walletType === 'sync' || walletType === 'sync2') {
        console.log(`Connecting to ${walletType} wallet...`);
        
        // Verify we're not on mobile before trying to connect to desktop apps
        if (isMobile) {
          throw new Error(`${walletType === 'sync' ? 'Sync' : 'Sync2'} is a desktop application and not compatible with mobile devices. Please use VeWorld mobile app instead.`);
        }
        
        // Sync wallets need special handling
        try {
          const vechainModule = await import('@/lib/vechain');
          await vechainModule.connectWallet(walletType);
          
          // Update DAppKit state
          walletContext.setSource(walletType);
          await walletContext.connect();
        } catch (error) {
          console.error(`Error connecting to ${walletType}:`, error);
          throw error;
        }
      } else {
        // If no wallet type specified, open the wallet selection modal
        walletModal.open();
      }

      // Save wallet info to local storage
      if (walletContext.account) {
        localStorage.setItem('walletAddress', walletContext.account);
        localStorage.setItem('walletConnected', 'true');
        if (walletContext.source) {
          localStorage.setItem('walletType', walletContext.source);
        }
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        title: "Connection Error",
        description: err instanceof Error ? err.message : "Failed to connect wallet",
        variant: "destructive"
      });
      
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [walletContext, walletModal, web3Modal, toast]);

  // Disconnect from wallet
  const disconnect = useCallback(() => {
    try {
      walletContext.disconnect();
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('walletType');
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected from VeCollab",
        duration: 3000
      });
    } catch (err) {
      console.error("Disconnect error:", err);
      toast({
        title: "Disconnect Error",
        description: "There was an error disconnecting your wallet",
        variant: "destructive"
      });
    }
  }, [walletContext, toast]);

  // Listen for connection changes
  useEffect(() => {
    const handleConnectionChange = (connected: string | null) => {
      if (connected) {
        localStorage.setItem('walletAddress', connected);
        localStorage.setItem('walletConnected', 'true');
        if (walletContext.source) {
          localStorage.setItem('walletType', walletContext.source);
        }
        
        toast({
          title: "Wallet Connected",
          description: `Connected to address: ${connected.substring(0, 6)}...${connected.substring(connected.length - 4)}`,
          duration: 3000
        });
      }
    };
    
    walletModal.onConnectionStatusChange(handleConnectionChange);
    
    return () => {
      // Cleanup any listeners if needed
    };
  }, [walletModal, walletContext.source, toast]);

  return {
    address,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect
  };
}