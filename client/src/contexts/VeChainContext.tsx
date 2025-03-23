import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Network, NETWORKS } from '@/lib/Network';
import { useToast } from '@/hooks/use-toast';
// Workaround for package structure - the package might be using exports differently
// than what our types suggest
const getConnex = async (options: any) => {
  try {
    const utils = await import('@vechain.energy/connex-utils');
    if (typeof utils.getConnex === 'function') {
      return utils.getConnex(options);
    } else if (typeof utils.createConnex === 'function') {
      return utils.createConnex(options);
    } else if (typeof utils.default?.getConnex === 'function') {
      return utils.default.getConnex(options);
    } else {
      // Fallback to our own implementation
      console.warn('Using fallback Connex creation');
      return window.connex || null;
    }
  } catch (e) {
    console.error('Error importing connex-utils:', e);
    return window.connex || null;
  }
};

// Define the shape of the VeChainContext
interface VeChainContextType {
  connex: any;
  vendor: any;
  account: string | null;
  isInitializing: boolean;
  error: Error | null;
  networkType: Network;
  connect: () => Promise<any>;
  disconnect: () => void;
  submitTransaction: (clauses: any[], options?: any) => Promise<string>;
  waitForTransactionId: (id: string) => Promise<any>;
  transactionIds: string[];
}

export const VeChainContext = createContext<VeChainContextType | null>(null);

// Get network configuration based on environment
const getVeChainConfig = () => {
  // Check environment variables for network settings
  const isMainNet = import.meta.env.VITE_REACT_APP_VECHAIN_NETWORK === 'main';
  
  return {
    node: isMainNet 
      ? 'https://mainnet.veblocks.net'
      : 'https://testnet.veblocks.net',
    network: isMainNet ? Network.MAIN : Network.TEST,
    genesis: isMainNet 
      ? NETWORKS[Network.MAIN].id
      : NETWORKS[Network.TEST].id
  };
};

interface VeChainProviderProps {
  children: React.ReactNode;
}

export const VeChainProvider: React.FC<VeChainProviderProps> = ({ children }) => {
  const config = getVeChainConfig();
  const [connex, setConnex] = useState<any>(null);
  const [vendor, setVendor] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [transactionIds, setTransactionIds] = useState<string[]>([]);
  const [account, setAccount] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if window.connex matches our network
  const getGlobalConnexIfNetworkMatches = useCallback(() => {
    if (window.connex && connex && window.connex.thor?.genesis?.id === connex.thor?.genesis?.id) {
      return window.connex;
    }
    return connex;
  }, [connex]);

  // Initialize Connex
  useEffect(() => {
    const initConnex = async () => {
      setIsInitializing(true);
      setError(null);
      
      try {
        console.log('Initializing Connex with config:', config);

        // First check if window.connex is available and matches our network
        if (window.connex) {
          console.log('Found window.connex, checking if network matches our config...');
          const windowConnexGenesis = window.connex.thor?.genesis?.id;
          
          if (windowConnexGenesis === config.genesis) {
            console.log('window.connex matches our network, using it directly');
            setConnex(window.connex);
            
            // Try to get vendor if available from wallet
            if (window.vechain && window.vechain.isVeWorld) {
              try {
                if (typeof window.vechain.getVendor === 'function') {
                  const walletVendor = await window.vechain.getVendor();
                  if (walletVendor) {
                    console.log('Retrieved vendor directly from wallet');
                    setVendor(walletVendor);
                  }
                }
              } catch (vendorError) {
                console.log('Could not get vendor directly, will create during connect');
              }
            }
            
            setIsInitializing(false);
            return;
          } else {
            console.log('window.connex network does not match our config, initializing new instance');
          }
        }

        // If window.connex isn't suitable, create our own instance
        const connexInstance = await getConnex(config);
        
        if (!connexInstance?.thor) {
          throw new Error('Failed to initialize Connex properly');
        }
        
        setConnex(connexInstance);
        console.log('Connex initialized successfully');
      } catch (err) {
        console.error('Failed to initialize Connex:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        toast({
          title: "Connection Error",
          description: err instanceof Error ? err.message : String(err),
          variant: "destructive"
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initConnex();
  }, [config, toast]);

  // Connect to wallet
  const connect = useCallback(async () => {
    const currentConnex = getGlobalConnexIfNetworkMatches();
    if (!currentConnex) {
      throw new Error('Connex is not initialized. Please try again in a few seconds.');
    }
    
    try {
      // First try VeWorld if available
      if (window.vechain && window.vechain.isVeWorld) {
        console.log('Attempting to connect via VeWorld wallet...');
        
        // If we don't have a vendor yet, create one
        if (!vendor) {
          try {
            // Try to get vendor directly first
            if (typeof window.vechain.getVendor === 'function') {
              const walletVendor = await window.vechain.getVendor();
              if (walletVendor) {
                console.log('Retrieved vendor from wallet');
                setVendor(walletVendor);
                
                if (walletVendor.address) {
                  setAccount(walletVendor.address);
                  return { 
                    connex: currentConnex, 
                    vendor: walletVendor,
                    address: walletVendor.address
                  };
                }
              }
            }
            
            // If getting vendor directly failed, create one
            console.log('Creating vendor with minimal parameters...');
            
            // Try different approaches to create vendor
            let newVendor;
            try {
              // Try with request method
              newVendor = await window.vechain.request({
                method: "newConnexVendor",
                params: [{}]
              });
            } catch (e) {
              // Fall back to direct method
              newVendor = await window.vechain.newConnexVendor({
                genesis: config.genesis
              });
            }
            
            if (newVendor) {
              console.log('Successfully created vendor');
              setVendor(newVendor);
              
              if (newVendor.address) {
                setAccount(newVendor.address);
                return { 
                  connex: currentConnex, 
                  vendor: newVendor,
                  address: newVendor.address
                };
              }
            }
          } catch (vendorError) {
            console.error('Error creating vendor:', vendorError);
            // Continue with standard certificate approach
          }
        }
      }
      
      // If vendor creation failed or we're using a different wallet, use standard certificate
      console.log('Using certificate method for wallet connection');
      
      const certificate = { 
        purpose: 'identification', 
        payload: { type: 'text', content: 'Connect to VeCollab Marketplace' } 
      };

      const result = await currentConnex.vendor.sign('cert', certificate).request();
      console.log('Certificate signing successful:', result);
      
      if (result.annex && result.annex.signer) {
        setAccount(result.annex.signer);
        
        // Create a minimal vendor if we don't have one yet
        if (!vendor) {
          setVendor({
            name: "Certificate",
            address: result.annex.signer,
            sign: async (type: string, message: any) => {
              return currentConnex.vendor.sign(type, message).request();
            }
          });
        }
        
        toast({
          title: "Wallet Connected",
          description: `Connected with address: ${result.annex.signer.substring(0, 6)}...${result.annex.signer.substring(38)}`,
        });
        
        return result;
      } else {
        throw new Error('No signer address returned from certificate');
      }
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast({
        title: "Connection Failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive"
      });
      throw err;
    }
  }, [getGlobalConnexIfNetworkMatches, vendor, toast]);

  // Disconnect from wallet
  const disconnect = useCallback(() => {
    setAccount(null);
    setVendor(null);
    toast({
      title: "Wallet Disconnected",
      description: "You've been disconnected from your wallet",
    });
  }, [toast]);

  // Wait for transaction to be mined
  const waitForTransactionId = useCallback(async (id: string) => {
    const currentConnex = getGlobalConnexIfNetworkMatches();
    if (!currentConnex) {
      throw new Error('Connex is not initialized');
    }

    const transaction = currentConnex.thor.transaction(id);
    let receipt = await transaction.getReceipt();
    
    // Poll until receipt is available
    while (!receipt) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3-second timeout
      receipt = await transaction.getReceipt();
    }

    // Check if transaction was reverted
    if (receipt.reverted) {
      const transactionData = await transaction.get();
      
      let revertReason = 'Transaction was reverted';
      try {
        const explainedTransaction = await currentConnex.thor.explain(transactionData.clauses)
          .caller(transactionData.origin)
          .execute();
        
        const reasons = explainedTransaction
          .filter((exp: any) => exp.revertReason)
          .map((exp: any) => exp.revertReason);
          
        if (reasons.length > 0) {
          revertReason = reasons.join(', ');
        }
      } catch (e) {
        console.error('Error getting revert reason:', e);
      }
      
      throw new Error(revertReason);
    }

    // Store transaction ID and return full transaction
    setTransactionIds(prev => [...prev, id]);
    return transaction;
  }, [getGlobalConnexIfNetworkMatches]);

  // Submit a transaction
  const submitTransaction = useCallback(async (clauses: any[], options = {}) => {
    const currentConnex = getGlobalConnexIfNetworkMatches();
    if (!currentConnex) {
      throw new Error('Connex is not initialized');
    }

    if (!vendor) {
      throw new Error('No wallet connected. Please connect first.');
    }

    try {
      console.log('Submitting transaction with clauses:', clauses);
      
      // Handle transaction signing
      let txid;
      if (typeof vendor.sign === 'function') {
        // Use the vendor's sign method
        const result = await vendor.sign('tx', clauses);
        txid = result.txid;
      } else {
        // Use Connex's vendor
        const result = await currentConnex.vendor.sign('tx', clauses).request();
        txid = result.txid;
      }
      
      console.log('Transaction submitted successfully:', txid);
      toast({
        title: "Transaction Submitted",
        description: `Transaction ID: ${txid.substring(0, 10)}...`,
      });
      
      return txid;
    } catch (err) {
      console.error('Transaction error:', err);
      toast({
        title: "Transaction Failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive"
      });
      throw err;
    }
  }, [getGlobalConnexIfNetworkMatches, vendor, toast]);

  return (
    <VeChainContext.Provider value={{ 
      connex, 
      vendor,
      connect, 
      disconnect, 
      account,
      isInitializing,
      error,
      networkType: config.network as Network,
      submitTransaction, 
      waitForTransactionId, 
      transactionIds 
    }}>
      {children}
    </VeChainContext.Provider>
  );
};

// Hook for using the VeChain context
export const useVeChain = () => {
  const context = useContext(VeChainContext);
  if (!context) {
    throw new Error('useVeChain must be used within a VeChainProvider');
  }
  return context;
};

// Add global type augmentation for TypeScript
interface VeChainGlobals {
  connex: any;
  vechain: any;
  thor: any;
}

// Merge with existing window interface
declare global {
  interface Window extends VeChainGlobals {}
}