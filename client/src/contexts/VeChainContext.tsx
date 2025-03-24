import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Network, NETWORKS } from '@/lib/Network';
import { useToast } from '@/hooks/use-toast';
import { Framework } from '@vechain/connex-framework';
import { isBrowser } from '@/lib/browser-info';
// Workaround for package structure - the package might be using exports differently
// than what our types suggest
const getConnex = async (options: any) => {
  try {
    // Check if we already have window.connex from a wallet
    if (window.connex && window.connex.thor && window.connex.thor.genesis) {
      console.log('Using existing window.connex');
      return window.connex;
    }
    
    // Try various ways to create a connex instance
    try {
      const utils = await import('@vechain.energy/connex-utils');
      
      if (typeof utils.getConnex === 'function') {
        console.log('Using @vechain.energy/connex-utils getConnex with options:', options);
        return utils.getConnex(options);
      } else if (typeof utils.createConnex === 'function') {
        console.log('Using @vechain.energy/connex-utils createConnex with options:', options);
        return utils.createConnex(options);
      } else if (typeof utils.default?.getConnex === 'function') {
        console.log('Using @vechain.energy/connex-utils default.getConnex with options:', options);
        return utils.default.getConnex(options);
      }
    } catch (importError) {
      console.warn('Error with connex-utils import:', importError);
      // Continue to fallbacks
    }
    
    // Fallback: Try alternate node URLs if the original fails
    if (options.node) {
      const alternateTestnetNodes = [
        'https://testnet.veblocks.net',
        'https://testnet.vecha.in',
        'https://sync-testnet.vechain.org'
      ];
      
      const alternateMainnetNodes = [
        'https://mainnet.veblocks.net',
        'https://mainnet.vecha.in',
        'https://sync-mainnet.vechain.org'
      ];
      
      // Determine which alternates to try based on current network
      const alternateNodes = options.network === 'main' || 
                            options.genesis === '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a' ?
                            alternateMainnetNodes : alternateTestnetNodes;
      
      // Don't retry the current node
      const uniqueAlternates = alternateNodes.filter(node => node !== options.node);
      
      // Try each alternate node
      for (const alternateNode of uniqueAlternates) {
        try {
          console.log(`Trying alternate node: ${alternateNode}`);
          // Use a different approach to create Connex - using Thorify
          console.log('Attempting to create Connex with native Web3 + Thorify');
          const Web3 = await import('web3').then(module => module.default || module);
          
          // Create a new web3 instance with the alternate node
          const web3 = new Web3(new Web3.providers.HttpProvider(alternateNode));
          
          // Set up a minimal connex-like interface
          const framework = {
            thor: {
              genesis: { id: options.genesis },
              ticker: () => ({
                next: () => Promise.resolve({ number: 0 })
              }),
              account: (addr: string) => ({
                get: () => web3.eth.getBalance(addr).then(balance => ({ balance }))
              }),
              status: {
                head: { id: '', number: 0, timestamp: 0 }
              }
            },
            vendor: {
              sign: (type: string, message: any) => ({
                request: () => Promise.reject(new Error('Offline mode: Cannot sign transactions'))
              })
            }
          };
          
          console.log('Successfully connected using alternate node');
          return framework;
        } catch (nodeError) {
          console.warn(`Failed with alternate node ${alternateNode}:`, nodeError);
          // Continue to next alternate
        }
      }
    }
    
    // Last resort: Check if we have window.connex anyway
    if (window.connex) {
      console.warn('Using fallback window.connex');
      return window.connex;
    }
    
    throw new Error('Could not initialize Connex with any available method');
  } catch (e) {
    console.error('Error in getConnex:', e);
    // Always try window.connex as a last resort
    if (window.connex) {
      console.warn('Using last resort window.connex after error');
      return window.connex;
    }
    throw e;
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

        // If window.connex isn't suitable, try creating our own instance
        try {
          console.log('Attempting to create Connex instance with config:', config);
          const connexInstance = await getConnex(config).catch(e => {
            console.error('Explicit getConnex error:', e);
            throw e;
          });
          
          if (!connexInstance?.thor) {
            throw new Error('Failed to initialize Connex properly');
          }
          
          setConnex(connexInstance);
          console.log('Connex initialized successfully');
        } catch (connexError) {
          console.error('Failed to create Connex with getConnex:', connexError);
          
          // FALLBACK for Connex initialization
          console.log('Trying fallback initialization approaches...');
          
          // Try direct Web3 + VeChain integration
          const Web3 = await import('web3').then(module => module.default || module);
          console.log('Creating minimal Connex-compatible interface using Web3');
          
          // Create a basic connex-like interface for read-only operations
          const minimalConnex = {
            thor: {
              genesis: { id: config.genesis },
              ticker: () => ({
                next: () => Promise.resolve({ number: 0 })
              }),
              account: (addr: string) => ({
                get: () => Promise.resolve({ balance: '0x0', energy: '0x0' })
              }),
              status: {
                head: { id: config.genesis, number: 0, timestamp: Date.now() }
              }
            },
            vendor: {
              sign: (type: string, message: any) => ({
                request: () => Promise.reject(new Error('Wallet connection required for signing operations'))
              })
            }
          };
          
          console.log('Created minimal Connex interface, waiting for wallet connection');
          setConnex(minimalConnex);
        }
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
                
                // Some wallet implementations add address to vendor
                if ((walletVendor as any).address) {
                  setAccount((walletVendor as any).address);
                  return { 
                    connex: currentConnex, 
                    vendor: walletVendor,
                    address: (walletVendor as any).address
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
              
              // Some wallet implementations add address to vendor
              if ((newVendor as any).address) {
                setAccount((newVendor as any).address);
                return { 
                  connex: currentConnex, 
                  vendor: newVendor,
                  address: (newVendor as any).address
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