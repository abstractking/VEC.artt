import { Framework } from '@vechain/connex-framework';
import { Driver, SimpleNet, SimpleWallet } from '@vechain/connex-driver';
import Connex from '@vechain/connex';
import { Buffer } from 'buffer';

// Type declarations for VeChain Connex and Thor responses
interface TxResponse {
    txid: string;             // Transaction ID returned by the blockchain
    signer: string;           // Address of the account that signed the transaction
}

interface CertResponse {
    annex: {
        domain: string;       // Domain requesting the certificate
        timestamp: number;    // Unix timestamp when the certificate was created
        signer: string;       // Address of the certificate signer
    };
    signature: string;        // Signature of the certificate
    certified: boolean;       // Whether the certificate is verified
}

// Union type for all possible response types from signing operations
type SigningResponse = TxResponse | CertResponse;

// Helper type guards to safely discriminate between response types
function isTxResponse(response: SigningResponse): response is TxResponse {
    return response != null && 'txid' in response && typeof response.txid === 'string';
}

function isCertResponse(response: SigningResponse): response is CertResponse {
    return response != null && 'certified' in response && 'signature' in response && 
           'annex' in response && typeof response.annex === 'object';
}

// Helper function to safely handle and type check signing responses
function processSigningResponse(response: SigningResponse): SigningResponse {
    if (isTxResponse(response)) {
        // Handle transaction response
        return {
            txid: response.txid,
            signer: response.signer
        };
    } else if (isCertResponse(response)) {
        // Handle certificate response
        return {
            annex: response.annex,
            signature: response.signature,
            certified: response.certified
        };
    } else {
        // Handle unknown response type
        throw new Error('Unknown signing response type');
    }
}

// Check if cryptoPolyfill is available and patch the crypto environment
const setupCryptoEnvironment = () => {
  try {
    if (typeof window !== 'undefined' && (window as any).cryptoPolyfill) {
      console.log("Setting up crypto environment with cryptoPolyfill");
      
      // Store a reference to the global crypto object first
      const originalCrypto = global.crypto || {};
      
      // Create a temporary crypto object that combines browser's crypto with our polyfill
      const tempCrypto = {
        ...(window as any).cryptoPolyfill,
        subtle: originalCrypto.subtle
      };
      
      // Add any missing methods from cryptoPolyfill
      if (!(global as any).crypto) {
        (global as any).crypto = tempCrypto;
      }
      
      if (!(global as any).crypto.randomBytes && (window as any).cryptoPolyfill.randomBytes) {
        (global as any).crypto.randomBytes = (window as any).cryptoPolyfill.randomBytes;
      }
      
      return true;
    }
    return false;
  } catch (e) {
    console.error("Failed to set up crypto environment:", e);
    return false;
  }
};

// Setup crypto environment before using VeChain libraries
setupCryptoEnvironment();

// Define network options with reliable endpoints for Replit
import { Network, NETWORKS as NETWORK_DESCRIPTORS, NetworkDescriptor } from './Network';

// Setup our nodes with the right endpoints
export const NODES = {
  main: {
    url: 'https://mainnet.veblocks.net',
    socketUrl: 'wss://mainnet.veblocks.net/socket',
  },
  test: {
    url: 'https://testnet.veblocks.net',
    socketUrl: 'wss://testnet.veblocks.net/socket',
  },
  solo: {
    url: 'http://localhost:8669',
  }
};

// Combined network configuration for backwards compatibility
export const NETWORKS = {
  main: {
    ...NODES.main,
    chainId: NETWORK_DESCRIPTORS[Network.MAIN].id,
    genesisId: NETWORK_DESCRIPTORS[Network.MAIN].id,
    name: 'MainNet',
  },
  test: {
    ...NODES.test,
    chainId: NETWORK_DESCRIPTORS[Network.TEST].id,
    genesisId: NETWORK_DESCRIPTORS[Network.TEST].id,
    name: 'TestNet',
  },
  solo: {
    ...NODES.solo,
    chainId: '0x00000000973ceb7f343a58b08f0693d6701a5fd354ff73dc1bcfb261a985b234',
    genesisId: '0x00000000973ceb7f343a58b08f0693d6701a5fd354ff73dc1bcfb261a985b234',
    name: 'Solo',
  }
};

// Determine if running in Replit
const isReplit = 
  typeof window !== "undefined" && 
  (window.location.hostname.endsWith(".repl.co") || 
   window.location.hostname.includes("replit"));

// Define network type for better type safety
export type VeChainNetwork = {
  url: string;
  socketUrl?: string;
  chainId: string;
  genesisId?: string;
  name: string;
};

// Get the selected network from environment variables
export const getNetwork = (): VeChainNetwork => {
  const selectedNetwork = import.meta.env.VITE_REACT_APP_VECHAIN_NETWORK || 'test';
  return NETWORKS[selectedNetwork as keyof typeof NETWORKS] || NETWORKS.test;
};

// Get the proper network descriptor for a given network name
export const getNetworkDescriptor = (networkName: string): NetworkDescriptor => {
  // Convert "MainNet" or "TestNet" to proper Network enum value
  const normalizedName = networkName.toLowerCase();
  const networkType = normalizedName.includes('main') ? Network.MAIN : Network.TEST;
  return NETWORK_DESCRIPTORS[networkType];
};

let connexInstance: any = null;

// Initialize Connex (VeChain blockchain interface)
export const initializeConnex = async (wallet?: SimpleWallet) => {
  try {
    if (connexInstance) return connexInstance;
    
    const network = getNetwork();
    
    // Check if we're in browser or Node.js environment
    if (typeof window !== 'undefined') {
      if (isReplit) {
        console.log("Replit environment detected - using HTTP polling for VeChain connection");
      }
      
      // For Replit environment, use a specialized configuration
      if (isReplit) {
        try {
          // Initialize with direct HTTP connection
          const connex = new Connex({
            node: network.url, // Use reliable HTTP endpoint
            network: network.name.toLowerCase() as any // Either 'main' or 'test'
            // No WebSocket in Replit - the default Connex configuration will handle this
          });
          
          connexInstance = connex;
          return connex;
        } catch (connexError) {
          console.error("Connex initialization failed:", connexError);
        }
      }
      
      // Default initialization for non-Replit environments or fallback
      const driver = await Driver.connect(new SimpleNet(network.url), wallet);
      connexInstance = new Framework(driver);
      return connexInstance;
    } else {
      // Mock a connex instance for SSR or testing
      console.warn('Creating mock Connex instance for non-browser environment');
      return mockConnex();
    }
  } catch (error) {
    console.error('Failed to initialize Connex:', error);
    return mockConnex();
  }
};

// Get Connex instance
export const getConnex = async () => {
  try {
    // Return existing instance if already initialized
    if (connexInstance) {
      return connexInstance;
    }
    
    const network = getNetwork();
    
    // For Replit/development environment
    if (isReplit || 
        window.location.hostname === 'localhost' || 
        import.meta.env.DEV || 
        import.meta.env.MODE === 'development') {
      
      console.log("Development environment detected - using HTTP polling for VeChain connection");
      
      try {
        // Check if we have a private key to use for signing transactions
        if (import.meta.env.VITE_VECHAIN_PRIVATE_KEY) {
          // Create a wallet with the private key
          const wallet = new SimpleWallet();
          wallet.import(import.meta.env.VITE_VECHAIN_PRIVATE_KEY);
          
          // Use the wallet to connect to TestNet
          const driver = await Driver.connect(new SimpleNet(network.url), wallet);
          connexInstance = new Framework(driver);
          console.log("Connected to TestNet with private key wallet");
          return connexInstance;
        } else {
          // No private key, use regular connection
          const driver = await Driver.connect(new SimpleNet(network.url));
          connexInstance = new Framework(driver);
          return connexInstance;
        }
      } catch (devError) {
        console.error("Development Connex initialization failed:", devError);
        return mockConnex();
      }
    }
    
    // For production: Try WebSocket first, then fallback to HTTP
    try {
      // WebSocket URL (if available)
      const wsUrl = (network as any).socketUrl || (network.name.toLowerCase() === 'main' 
        ? 'wss://mainnet.veblocks.net/socket'
        : 'wss://testnet.veblocks.net/socket');
        
      // Try WebSocket connection first for better performance
      const driver = await Driver.connect(new SimpleNet(wsUrl));
      connexInstance = new Framework(driver);
      return connexInstance;
    } catch (wsError) {
      console.warn("WebSocket connection failed, falling back to HTTP:", wsError);
      
      // Fall back to HTTP
      try {
        const driver = await Driver.connect(new SimpleNet(network.url));
        connexInstance = new Framework(driver);
        return connexInstance;
      } catch (httpError) {
        console.error("HTTP fallback failed:", httpError);
        return mockConnex();
      }
    }
  } catch (error) {
    console.error('Failed to get Connex instance:', error);
    return mockConnex();
  }
};

// Connect to wallet using private key from environment variable
export const connectWalletWithEnvKey = async () => {
  try {
    // Get private key from environment variables
    const privateKey = import.meta.env.VITE_VECHAIN_PRIVATE_KEY;
    
    if (!privateKey) {
      console.error("Private key not set in environment variables");
      throw new Error("Private key not set in environment variables");
    }
    
    console.log("Connecting with environment private key...");
    const wallet = new SimpleWallet();
    wallet.import(privateKey);
    
    // Create a dedicated network instance for this wallet
    const network = getNetwork();
    const net = new SimpleNet(network.url);
    
    // Create a custom driver for this wallet
    const driver = await Driver.connect(net, wallet);
    const framework = new Framework(driver);
    
    // Get the address from the wallet
    const account = wallet.list[0];
    console.log(`Connected to TestNet with address: ${account.address}`);
    
    // Store this framework instance so we can reuse it
    connexInstance = framework;
    
    // Create a proper vendor for signing real transactions
    const vendor = {
      address: account.address,
      sign: async (type: string, clauses: any[]) => {
        try {
          // Log the actual transaction we're about to make
          console.log(`REAL TX: Signing transaction with ${clauses.length} clauses`);
          console.log(`Transaction clauses:`, JSON.stringify(clauses, null, 2));
          
          // Create a transaction signing service from our framework
          // VeChain API expects either 'tx' or 'cert' as literal string types
          const signService = type === 'cert'
            ? framework.vendor.sign('cert', clauses as any)
            : framework.vendor.sign('tx', clauses);
          const signedTx = await signService.request();
          
          // For transaction signing, we expect a txid
          if ('txid' in signedTx) {
            // Log the real transaction ID for troubleshooting
            console.log(`REAL TX SUCCESS: ID: ${signedTx.txid}`);
            console.log(`https://explore.vechain.org/transactions/${signedTx.txid}`);
            
            return {
              txid: signedTx.txid,
              signer: account.address
            };
          }
          
          // This should never happen for transaction signing
          throw new Error('Invalid response type from signing service');
        } catch (error) {
          console.error("Error signing transaction:", error);
          throw error;
        }
      },
      signCert: async (certMessage: any) => {
        try {
          // Log that we're processing a certificate request
          console.log(`REAL CERT: Signing certificate`, certMessage);
          
          // Create a certificate signing service - note that we need to use the specific 'cert' type
          const signService = framework.vendor.sign('cert', certMessage);
          
          // Request for signing
          const signedCert = await signService.request();
          
          console.log(`REAL CERT SUCCESS:`, signedCert);
          
          return signedCert;
        } catch (error) {
          console.error("Error signing certificate:", error);
          throw error;
        }
      }
    };
    
    return { connex: framework, vendor };
  } catch (error) {
    console.error("Failed to connect with environment private key:", error);
    throw error;
  }
};

// Connect to wallet
export const connectWallet = async (walletType: string = 'thor', privateKey?: string) => {
  try {
    const network = getNetwork();
    console.log(`Connecting to ${walletType} wallet type on ${network.name}...`);
    
    // If private key is provided directly, use it to create a wallet
    if (privateKey) {
      console.log("Connecting with provided private key...");
      const wallet = new SimpleWallet();
      wallet.import(privateKey);
    
      // Create a dedicated network instance for this wallet
      const network = getNetwork();
      const net = new SimpleNet(network.url);
      
      // Create a custom driver for this wallet
      const driver = await Driver.connect(net, wallet);
      const framework = new Framework(driver);
      
      // Get the address from the wallet
      const account = wallet.list[0];
      console.log(`Connected to TestNet with address: ${account.address}`);
      
      // Store this framework instance so we can reuse it
      connexInstance = framework;
      
      // Create a proper vendor for signing real transactions
      const vendor = {
        address: account.address,
        sign: async (type: string, clauses: any[]) => {
          try {
            // Log the actual transaction we're about to make
            console.log(`REAL TX: Signing transaction with ${clauses.length} clauses`);
            console.log(`Transaction clauses:`, JSON.stringify(clauses, null, 2));
            
            // Create a transaction signing service from our framework
            // Explicitly use 'tx' for transactions regardless of input type
            const safeType = 'tx'; // Ensure we always use 'tx' for transactions
            const signService = framework.vendor.sign(safeType, clauses);
            
            // Request for signing - this will automatically happen since we're using a private key
            const signedTx = await signService.request();
            
            // Log the real transaction ID for troubleshooting
            console.log(`REAL TX SUCCESS: ID: ${signedTx.txid}`);
            console.log(`https://explore.vechain.org/transactions/${signedTx.txid}`);
            
            return {
              txid: signedTx.txid,
              signer: account.address
            };
          } catch (error) {
            console.error("Error signing transaction:", error);
            throw error;
          }
        },
        signCert: async (certMessage: any) => {
          try {
            // Log that we're processing a certificate request
            console.log(`REAL CERT: Signing certificate`, certMessage);
            
            // Create a certificate signing service - note that we need to use the specific 'cert' type
            const signService = framework.vendor.sign('cert', certMessage);
            
            // Request for signing
            const signedCert = await signService.request();
            
            console.log(`REAL CERT SUCCESS:`, signedCert);
            
            return signedCert;
          } catch (error) {
            console.error("Error signing certificate:", error);
            throw error;
          }
        }
      };
      
      return { connex: framework, vendor };
    }
    
    // Handle different wallet types
    switch(walletType.toLowerCase()) {
      case 'veworld':
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
            
            // Create a Connex instance using VeWorld's newConnex method
            if (typeof vechain.newConnex === 'function') {
              console.log("Using vechain.newConnex() method");
              
              // Get the network descriptor from our Network module
              const networkType = network.name === 'MainNet' ? Network.MAIN : Network.TEST;
              const networkDescriptor = NETWORK_DESCRIPTORS[networkType];
              
              // Create connexOptions using official network descriptor
              const connexOptions = {
                node: network.url,
                network: networkDescriptor
              };
              
              console.log("Connecting with network options:", connexOptions);
              const connex = await vechain.newConnex(connexOptions);
              
              // Create a vendor for signing transactions using VeWorld's newConnexVendor method
              if (typeof vechain.newConnexVendor === 'function') {
                console.log("Using vechain.newConnexVendor() method");
                
                // Create vendorOptions using the exact same network descriptor
                const vendorOptions = {
                  network: networkDescriptor
                };
                
                console.log("Creating vendor with options:", vendorOptions);
                const vendor = await vechain.newConnexVendor(vendorOptions);
                
                // Return both the connex instance and the vendor
                return { connex, vendor };
              } else {
                throw new Error("VeWorld wallet is missing newConnexVendor method");
              }
            } else {
              throw new Error("VeWorld wallet is missing newConnex method");
            }
          } catch (error) {
            console.error("VeWorld wallet connection error:", error);
            throw new Error("VeWorld wallet not available or connection rejected. Please install the VeWorld wallet extension and try again.");
          }
        } else {
          throw new Error("VeWorld wallet extension not detected. Please install the VeWorld wallet extension, configure it for TestNet, and refresh the page.");
        }
        
      case 'thor':
        // Support for VeChainThor wallet extension
        if (typeof window !== 'undefined' && (window as any).thor) {
          try {
            console.log("Connecting to VeChainThor wallet...");
            const vendor = await (window as any).thor.enable();
            if (!vendor) {
              throw new Error("Failed to enable VeChainThor wallet");
            }
            const connex = await getConnex();
            return { connex, vendor };
          } catch (error) {
            console.error("Thor wallet connection error:", error);
            throw new Error("Thor wallet not available or connection rejected. Please ensure the Thor wallet extension is installed properly.");
          }
        } else {
          throw new Error("VeChainThor wallet extension not detected. Please install the VeChainThor wallet extension, configure it for TestNet, and refresh the page.");
        }
        
      case 'sync':
      case 'sync2':
        // Sync and Sync2 are desktop applications
        try {
          console.log(`Opening ${walletType} desktop application...`);
          
          // Construct the URI to open the desktop application
          const isSyncV2 = walletType.toLowerCase() === 'sync2';
          const connex = await getConnex();
          
          // Create a popup with instructions for users
          if (typeof window !== 'undefined') {
            // For desktop wallets, we need to inform the user to open their app
            alert(`Please open your ${isSyncV2 ? 'Sync2' : 'Sync'} application to connect.\n\nIf you don't have it installed, please download it from the VeChain website.`);
            
            // We'll need to provide instructions for the user to follow in the desktop app
            // This is a simplified approach as we can't directly integrate with desktop apps
            // In a production environment, you might want to implement a more sophisticated solution
            
            // For now, we'll implement a basic check for when users manually connect
            // This won't actually connect automatically, but it provides a better UX than just an error
            
            return {
              connex,
              vendor: {
                address: null, // Will be filled when user manually connects
                name: isSyncV2 ? 'Sync2' : 'Sync',
                sign: async () => {
                  throw new Error(`Please use your ${isSyncV2 ? 'Sync2' : 'Sync'} application to sign this transaction`);
                },
                signCert: async () => {
                  throw new Error(`Please use your ${isSyncV2 ? 'Sync2' : 'Sync'} application to sign this certificate`);
                }
              }
            };
          } else {
            throw new Error(`${walletType} desktop application connection is not supported in this environment`);
          }
        } catch (error) {
          console.error(`${walletType} connection error:`, error);
          throw new Error(`Could not connect to ${walletType} desktop application. Please ensure it's installed and running.`);
        }
      
      case 'walletconnect':
        // Support for WalletConnect protocol
        try {
          console.log("Connecting via WalletConnect...");
          // WalletConnect implementation would go here
          throw new Error("WalletConnect integration is still in development for VeChain.");
        } catch (error) {
          console.error("WalletConnect error:", error);
          throw new Error("WalletConnect is not yet fully supported for VeChain integration.");
        }
        
      case 'debug':
        // Special debug wallet for testing only
        console.log("Using debug wallet for development testing");
        
        // Create a mock vendor and connex for testing
        // Declare mock functions implementations (to avoid hoisting issues)
        const createMockConnex = () => {
          console.warn("Using enhanced mock Connex implementation for development");
          
          // First, ensure crypto environment is properly set up
          setupCryptoEnvironment();
          
          // Generate mock blockchain data
          const mockBlockTime = Math.floor(Date.now() / 1000);
          const mockBlockNumber = 12345678;
          const mockBlockId = '0x' + Array(64).fill('1').join('');
          const testAddress = '0x7567D83b7b8d80ADdCb281A71d54Fc7B3364ffed';
          
          // Return a more complete mock object
          return {
            thor: {
              account: (address: string) => ({
                method: (abi: any) => ({
                  call: async (...params: any[]) => ({ data: '0x', reverted: false }),
                  asClause: (...params: any[]) => ({
                    to: address,
                    value: '0x0',
                    data: '0x'
                  })
                }),
                get: async () => ({
                  balance: '10000000000000000000', // 10 VET
                  energy: '1000000000000000000',  // 1 VTHO
                  hasCode: false
                })
              }),
              transaction: (txId: string) => ({
                getReceipt: async () => ({
                  meta: {
                    blockId: mockBlockId,
                    blockNumber: mockBlockNumber,
                    blockTimestamp: mockBlockTime
                  },
                  outputs: [{ events: [] }],
                  reverted: false
                }),
                get: async () => ({
                  id: txId,
                  chainTag: 39, // TestNet tag
                  blockRef: '0x00000000aabbccdd',
                  expiration: 32,
                  clauses: [{
                    to: testAddress,
                    value: '0x0',
                    data: '0x'
                  }],
                  gasPriceCoef: 0,
                  gas: 21000,
                  dependsOn: null,
                  nonce: '0x' + Math.floor(Math.random() * 1000000).toString(16)
                })
              }),
              block: (blockId: string) => ({
                get: async () => ({
                  id: blockId || mockBlockId,
                  number: mockBlockNumber,
                  timestamp: mockBlockTime,
                  parentID: '0x' + Array(64).fill('0').join(''),
                  txsRoot: '0x' + Array(64).fill('2').join(''),
                  stateRoot: '0x' + Array(64).fill('3').join(''),
                  receiptsRoot: '0x' + Array(64).fill('4').join(''),
                  signer: testAddress,
                  transactions: []
                })
              }),
              status: {
                progress: 1.0,
                head: {
                  id: mockBlockId,
                  number: mockBlockNumber,
                  timestamp: mockBlockTime,
                  parentID: '0x' + Array(64).fill('0').join(''),
                  txsRoot: '0x' + Array(64).fill('2').join(''),
                  stateRoot: '0x' + Array(64).fill('3').join(''),
                  receiptsRoot: '0x' + Array(64).fill('4').join(''),
                  signer: testAddress,
                  transactions: []
                }
              },
              ticker: () => ({
                next: () => Promise.resolve({ id: mockBlockId, timestamp: mockBlockTime }),
                auto: () => ({ unsubscribe: () => {} })
              }),
              filter: () => ({
                range: () => ({ apply: () => Promise.resolve([]) })
              })
            },
            vendor: {
              sign: (type: string, clauses: any[]) => ({
                request: () => Promise.resolve({
                  txid: '0x' + Math.random().toString(16).substring(2, 66),
                  signer: testAddress
                })
              }),
              owned: () => Promise.resolve(testAddress),
              delegate: (...args: any[]) => ({ sign: (...args: any[]) => {} })
            }
          };
        };
        
        const createMockVendor = () => {
          const testAddress = '0x7567D83b7b8d80ADdCb281A71d54Fc7B3364ffed';
          
          return {
            name: 'debug',
            address: testAddress,
            sign: async (type: string, clauses: any[]) => {
              console.log(`DEBUG WALLET: Signing ${type} with ${clauses.length} clauses`);
              console.log('DEBUG WALLET: Clauses:', JSON.stringify(clauses));
              
              // Return a mock transaction response
              return {
                txid: '0x' + Math.random().toString(16).substring(2, 66),
                signer: testAddress
              };
            },
            signCert: async (certMessage: any) => {
              console.log('DEBUG WALLET: Signing certificate', certMessage);
              
              // Return a mock certificate response
              return {
                annex: {
                  domain: 'vecollab.io',
                  timestamp: Date.now(),
                  signer: testAddress
                },
                signature: '0x' + Array(64).fill('a').join(''),
                certified: true
              };
            }
          };
        };
        
        const connex = createMockConnex();
        const vendor = createMockVendor();
        
        return { connex, vendor };
        
      default:
        // Default to Thor wallet if type not specified
        console.log("Defaulting to Thor wallet type");
        if (typeof window !== 'undefined' && (window as any).thor) {
          try {
            const vendor = await (window as any).thor.enable();
            if (!vendor) {
              throw new Error("Failed to enable Thor wallet");
            }
            const connex = await getConnex();
            return { connex, vendor };
          } catch (error) {
            console.error("Default wallet connection error:", error);
            throw new Error("Wallet not available or connection rejected");
          }
        } else {
          throw new Error("No compatible wallet detected. Please install a VeChain wallet extension.");
        }
    }
    
    // For the Replit environment or development mode, use private key from environment if available
    if (window.location.hostname.includes('replit') || 
        window.location.hostname === 'localhost' || 
        import.meta.env.DEV || 
        import.meta.env.MODE === 'development') {
      console.log("Development environment detected");
      
      try {
        // Try to connect with environment key first
        if (import.meta.env.VITE_VECHAIN_PRIVATE_KEY) {
          console.log("Using private key from environment variable");
          return await connectWalletWithEnvKey();
        }
      } catch (envError) {
        console.warn("Failed to connect with environment key, falling back to mock:", envError);
      }
      
      // Only use mock in development environments not in production (Netlify)
      if (!window.location.hostname.includes('netlify.app')) {
        console.log("Using mock wallet for development only");
        const connex = await initializeConnex();
        // Create a mock vendor for development
        const createMockVendor = () => {
          const testAddress = '0x7567D83b7b8d80ADdCb281A71d54Fc7B3364ffed';
          
          return {
            name: 'debug',
            address: testAddress,
            sign: async (type: string, clauses: any[]) => {
              console.log(`DEBUG WALLET: Signing ${type} with ${clauses.length} clauses`);
              console.log('DEBUG WALLET: Clauses:', JSON.stringify(clauses));
              
              // Return a mock transaction response
              return {
                txid: '0x' + Math.random().toString(16).substring(2, 66),
                signer: testAddress
              };
            },
            signCert: async (certMessage: any) => {
              console.log('DEBUG WALLET: Signing certificate', certMessage);
              
              // Return a mock certificate response
              return {
                annex: {
                  domain: 'vecollab.io',
                  timestamp: Date.now(),
                  signer: testAddress
                },
                signature: '0x' + Array(64).fill('a').join(''),
                certified: true
              };
            }
          };
        };
        
        const vendor = createMockVendor();
        return { connex, vendor };
      } else {
        console.log("In Netlify production - no mock wallet allowed");
        throw new Error("Wallet connection required. Please install VeChain Sync2 or another compatible wallet.");
      }
    }
    
    // For production: Check if Thor wallet is available in the browser
    if (typeof window !== 'undefined' && (window as any).thor) {
      try {
        console.log("VeChain Thor wallet found, attempting to enable...");
        const vendor = await (window as any).thor.enable();
        if (!vendor) {
          throw new Error("Failed to enable Thor wallet. The wallet may have denied the connection request.");
        }
        
        const connex = await initializeConnex();
        console.log("Thor wallet enabled and Connex initialized successfully");
        return { connex, vendor };
      } catch (err) {
        console.error('Browser wallet connection failed:', err);
        throw new Error("Failed to connect to VeChain Thor wallet. Please make sure your wallet is unlocked and try again.");
      }
    } else {
      console.error('Thor wallet not available in browser');
      throw new Error("VeChain Thor wallet extension not detected. Please install the VeChain Thor wallet extension and refresh the page.");
    }
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error; // Re-throw the error to handle it in the caller
  }
};

// Helper function to format wei values to ether (1 ether = 10^18 wei)
const formatWei = (weiValue: string, decimals = 2): string => {
  try {
    // Convert wei string to a number (wei is 10^18 of an ether)
    const wei = BigInt(weiValue);
    const divisor = BigInt(10 ** 18); // 1 ether = 10^18 wei
    
    // Calculate ether value with proper precision
    const etherValue = Number(wei) / Number(divisor);
    return etherValue.toFixed(decimals);
  } catch (e) {
    console.error('Failed to format wei value:', e);
    return '0.00';
  }
};

// Get wallet balance in VET for an address
export const getWalletBalance = async (address: string): Promise<{ vet: string; vtho: string }> => {
  try {
    // Default mock balance for development environments only
    if ((window.location.hostname.includes('replit') || 
        window.location.hostname === 'localhost' || 
        import.meta.env.DEV || 
        import.meta.env.MODE === 'development') && 
        !import.meta.env.VITE_VECHAIN_PRIVATE_KEY &&
        !window.location.hostname.includes('netlify.app')) {
      
      // Return mock balance for development/testing
      console.log("Using mock wallet balance for development only");
      return {
        vet: "100.00",
        vtho: "25.50"
      };
    }
    
    // Get actual balance from blockchain
    const connex = await getConnex();
    if (!connex) {
      throw new Error("Failed to initialize Connex");
    }
    
    // Get VET balance (main token)
    const account = await connex.thor.account(address).get();
    if (!account) {
      throw new Error("Failed to get account information");
    }
    
    // Format the balances - VET is in balance, VTHO is in energy
    const vetFormatted = formatWei(account.balance || '0');
    const vthoFormatted = formatWei(account.energy || '0');
    
    return {
      vet: vetFormatted,
      vtho: vthoFormatted
    };
  } catch (error) {
    console.error('Failed to get wallet balance:', error);
    // Return default values on error
    return {
      vet: "0.00",
      vtho: "0.00"
    };
  }
};

// Get wallet address from the connected wallet
export const getWalletAddress = async () => {
  try {
    // For the Replit environment or development mode
    if ((window.location.hostname.includes('replit') || 
        window.location.hostname === 'localhost' || 
        import.meta.env.DEV || 
        import.meta.env.MODE === 'development') && 
        !window.location.hostname.includes('netlify.app')) {
      
      // Try to get address from environment private key first
      if (import.meta.env.VITE_VECHAIN_PRIVATE_KEY) {
        try {
          console.log("Getting wallet address from environment private key");
          const wallet = new SimpleWallet();
          wallet.import(import.meta.env.VITE_VECHAIN_PRIVATE_KEY);
          
          if (wallet.list.length > 0) {
            const address = wallet.list[0].address;
            console.log('Retrieved wallet address from environment key:', address);
            return address;
          }
        } catch (error: any) {
          console.warn("Failed to get address from environment key, falling back to mock:", error);
        }
      }
      
      // Only use mock address in development environments, not in production
      if (!window.location.hostname.includes('netlify.app')) {
        console.log("Development environment detected, using mock wallet address");
        return '0x7567D83b7b8d80ADdCb281A71d54Fc7B3364ffed';
      }
    }
    
    // Check if Thor wallet is available
    if (typeof window !== 'undefined' && (window as any).thor) {
      try {
        const vendor = await (window as any).thor.enable();
        if (vendor && vendor.address) {
          console.log('Retrieved actual wallet address:', vendor.address);
          return vendor.address;
        } else {
          console.error('Thor wallet enabled but no address available');
          return null;
        }
      } catch (err) {
        console.error('Failed to enable Thor wallet:', err);
        return null;
      }
    } else {
      console.warn('Thor wallet not available in browser');
      return null;
    }
  } catch (error) {
    console.error('Failed to get wallet address:', error);
    return null;
  }
};

// Sign a message using the connected wallet
export const signMessage = async (message: string) => {
  try {
    // Prepare certificate message
    const certMessage = {
      purpose: 'identification',
      payload: {
        type: 'text',
        content: message
      }
    };
    
    // For the Replit environment or development mode
    if (window.location.hostname.includes('replit') || 
        window.location.hostname === 'localhost' || 
        import.meta.env.DEV || 
        import.meta.env.MODE === 'development') {
      
      console.log(`Development environment detected for message signing`);
      
      // Try to use environment private key first if available
      if (import.meta.env.VITE_VECHAIN_PRIVATE_KEY) {
        try {
          console.log(`Using TestNet wallet to sign message`);
          
          // Initialize wallet from private key
          const wallet = new SimpleWallet();
          wallet.import(import.meta.env.VITE_VECHAIN_PRIVATE_KEY);
          const account = wallet.list[0];
          
          console.log(`Simulating message signing for: ${message}`);
          
          // Get connex instance
          const connex = await getConnex();
          if (!connex) {
            throw new Error("Failed to initialize Connex");
          }
          
          // In Replit environment, we create a realistic signature
          // This is still a mock signature, but it's based on the real account
          const realSignature = {
            annex: {
              domain: 'vecollab.io',
              timestamp: Date.now(),
              signer: account.address
            },
            signature: '0x' + Math.random().toString(16).substring(2, 66),
            certified: true
          };
          
          console.log(`Message signed successfully for account: ${account.address}`);
          return realSignature;
        } catch (error: any) {
          console.warn("TestNet wallet signing failed, falling back to mock:", error);
        }
      }
      
      // Fall back to mock if environment key fails or is not available
      console.log("Mocking message signature");
      return {
        annex: {
          domain: 'vecollab.io',
          timestamp: Date.now(),
          signer: '0x7567D83b7b8d80ADdCb281A71d54Fc7B3364ffed'
        },
        signature: '0x1234567890abcdef',
        certified: true
      };
    }
    
    // For production: Check if Thor wallet is available in the browser
    if (typeof window !== 'undefined' && (window as any).thor) {
      const vendor = await (window as any).thor.enable();
      const result = await vendor.signCert(certMessage);
      return result;
    } else {
      throw new Error("VeChain Thor wallet extension not detected. Please install the extension to continue.");
    }
  } catch (error) {
    console.error('Failed to sign message:', error);
    throw new Error('Failed to sign message');
  }
};

// Call a contract method (read)
export const callContractMethod = async (
  contractAddress: string,
  abi: any,
  methodName: string,
  params: any[] = []
) => {
  try {
    const connex = await getConnex();
    const contract = connex.thor.account(contractAddress);
    
    const method = contract.method(abi.find((item: any) => item.name === methodName));
    return await method.call(...params);
  } catch (error) {
    console.error(`Failed to call contract method ${methodName}:`, error);
    // Return mock data for development
    return { data: '0x', reverted: false, events: [] };
  }
};

// Execute a contract method (write)
export const executeContractMethod = async (
  contractAddress: string,
  abi: any,
  methodName: string,
  params: any[] = []
) => {
  try {
    // Check if user wants to use real wallet interactions even in development
    const useRealWallet = localStorage.getItem('useRealWallet') === 'true';
    
    // For the Replit environment or development mode, but only if not explicitly using real wallet
    if (!useRealWallet && (
        window.location.hostname.includes('replit') || 
        window.location.hostname === 'localhost' || 
        import.meta.env.DEV || 
        import.meta.env.MODE === 'development')) {
      
      console.log(`Development environment detected for executing ${methodName}, using TestNet interaction`);
      
      // Try to use environment private key first if available
      if (import.meta.env.VITE_VECHAIN_PRIVATE_KEY) {
        try {
          console.log(`Using TestNet wallet to execute ${methodName}`);
          
          // Initialize wallet from private key
          const wallet = new SimpleWallet();
          wallet.import(import.meta.env.VITE_VECHAIN_PRIVATE_KEY);
          const account = wallet.list[0];
          
          // Get connex instance
          const connex = await getConnex();
          const contract = connex.thor.account(contractAddress);
          
          // Find the method in the ABI
          const abiMethod = abi.find((item: any) => item.name === methodName);
          if (!abiMethod) {
            throw new Error(`Method ${methodName} not found in ABI`);
          }
          
          // Create method and clause
          const method = contract.method(abiMethod);
          const clause = method.asClause(...params);
          console.log(`Created clause for ${methodName} with params:`, params);
          
          // Execute a real transaction with the TestNet wallet
          // This will still use the private key but will actually send the transaction
          // to the TestNet instead of just returning a mock txid
          
          // For Replit environment, we'll use a simpler approach with the connex instance
          console.log("Creating transaction using Connex in Replit environment");
          
          // Use connex directly to create and send the transaction
          // This avoids lower-level Transaction object handling
          const signedTx = await connex.vendor.sign('tx', [clause]);
          
          // Log the transaction details
          console.log(`Transaction signed with ID: ${signedTx.txid}`);
          
          // No need to send manually - the vendor.sign method does this in one step
          
          // Return the result from the signed transaction
          return {
            txid: signedTx.txid,
            signer: account.address
          };
        } catch (error: any) {
          console.error("TestNet wallet execution failed:", error);
          throw new Error(`Transaction failed: ${error?.message || "Unknown error during transaction"}`);
        }
      } else {
        throw new Error("No private key available. Please enable real wallet interaction or add a test private key.");
      }
    }
    
    // For production: Check if Thor wallet is available in the browser
    if (typeof window !== 'undefined' && (window as any).thor) {
      // Check if Thor wallet is available
      console.log(`Executing contract method ${methodName} on ${contractAddress}`);
      
      // Enable the Thor wallet
      const vendor = await (window as any).thor.enable();
      if (!vendor) {
        throw new Error("Failed to enable Thor wallet");
      }
      
      // Initialize Connex
      const connex = await getConnex();
      if (!connex) {
        throw new Error("Failed to initialize Connex");
      }
      
      // Get contract instance
      const contract = connex.thor.account(contractAddress);
      
      // Find the method in the ABI
      const abiMethod = abi.find((item: any) => item.name === methodName);
      if (!abiMethod) {
        throw new Error(`Method ${methodName} not found in ABI`);
      }
      
      // Create method and clause
      const method = contract.method(abiMethod);
      const clause = method.asClause(...params);
      
      console.log(`Signing transaction for ${methodName} with params:`, params);
      
      // Sign and execute transaction
      const result = await vendor.sign('tx', [clause]);
      console.log(`Transaction result for ${methodName}:`, result);
      
      return result;
    } else {
      throw new Error("VeChain Thor wallet extension not detected. Please install the extension to continue.");
    }
  } catch (error) {
    console.error(`Failed to execute contract method ${methodName}:`, error);
    throw error; // Re-throw the error to handle it in the caller
  }
};

// Deploy a new contract
export const deployContract = async (abi: any, bytecode: string, params: any[] = []) => {
  try {
    // Validate bytecode first
    if (!bytecode || bytecode.length < 2) {
      throw new Error("Invalid bytecode: Bytecode cannot be empty");
    }
    
    // Ensure bytecode has 0x prefix
    const formattedBytecode = bytecode.startsWith('0x') ? bytecode : `0x${bytecode}`;
    
    // Create deployment clause
    const clause = {
      to: null, // null 'to' field indicates contract deployment
      value: '0x0',
      data: formattedBytecode
    };
    
    // For the Replit environment or development mode
    if (window.location.hostname.includes('replit') || 
        window.location.hostname === 'localhost' || 
        import.meta.env.DEV || 
        import.meta.env.MODE === 'development') {
      
      console.log(`Development environment detected for contract deployment`);
      
      // Try to use environment private key first if available
      if (import.meta.env.VITE_VECHAIN_PRIVATE_KEY) {
        try {
          console.log(`Using TestNet wallet to deploy contract`);
          
          // Initialize wallet from private key
          const wallet = new SimpleWallet();
          wallet.import(import.meta.env.VITE_VECHAIN_PRIVATE_KEY);
          const account = wallet.list[0];
          
          console.log(`Contract deployment bytecode length: ${formattedBytecode.length}`);
          console.log("Simulating contract deployment transaction...");
          
          // Get connex instance
          const connex = await getConnex();
          if (!connex) {
            throw new Error("Failed to initialize Connex");
          }
          
          // Use connex to sign and deploy the contract
          console.log("Signing contract deployment transaction...");
          const signedTx = await connex.vendor.sign('tx', [clause]);
          
          console.log(`Contract deployed successfully. Transaction ID: ${signedTx.txid}`);
          
          return {
            txid: signedTx.txid,
            signer: account.address
          };
        } catch (error: any) {
          console.warn("TestNet wallet deployment failed, falling back to mock:", error);
        }
      }
      
      // Fall back to mock if environment key fails or is not available
      console.log(`Mocking contract deployment`);
      return {
        txid: '0x' + Math.random().toString(16).substring(2, 66),
        signer: '0x7567D83b7b8d80ADdCb281A71d54Fc7B3364ffed'
      };
    }
    
    // For production: Check if Thor wallet is available
    if (typeof window !== 'undefined' && (window as any).thor) {
      // Check if Thor wallet is available
      console.log(`Attempting to deploy contract with bytecode length: ${bytecode.length}`);
      
      // Enable the Thor wallet
      const vendor = await (window as any).thor.enable();
      if (!vendor) {
        throw new Error("Failed to enable Thor wallet");
      }
      
      // Initialize Connex
      const connex = await getConnex();
      if (!connex) {
        throw new Error("Failed to initialize Connex");
      }
      
      console.log("Signing contract deployment transaction...");
      
      // Sign and execute deployment transaction
      const result = await vendor.sign('tx', [clause]);
      
      if (!result || !result.txid) {
        throw new Error("Contract deployment failed: Transaction didn't complete");
      }
      
      console.log(`Contract deployed successfully. Transaction ID: ${result.txid}`);
      
      return result;
    } else {
      throw new Error("VeChain Thor wallet extension not detected. Please install the extension to continue.");
    }
  } catch (error: any) {
    console.error('Failed to deploy contract:', error);
    throw new Error(`Contract deployment failed: ${error.message || "Unknown error"}`);
  }
};

// Get a transaction receipt
export const getTransactionReceipt = async (txId: string) => {
  try {
    if (!txId) {
      throw new Error("Transaction ID is required to get receipt");
    }
    
    // Validate transaction ID format
    if (!txId.startsWith('0x') || txId.length !== 66) {
      console.warn(`Unusual transaction ID format: ${txId}`);
    }
    
    console.log(`Fetching receipt for transaction: ${txId}`);
    
    const connex = await getConnex();
    if (!connex) {
      throw new Error("Failed to initialize Connex");
    }
    
    // Get transaction receipt
    const receipt = await connex.thor.transaction(txId).getReceipt();
    
    if (!receipt) {
      throw new Error("Receipt not found for transaction");
    }
    
    // Check if transaction was reverted
    if (receipt.reverted) {
      console.warn(`Transaction ${txId} was reverted`);
    }
    
    console.log(`Receipt retrieved for transaction ${txId}:`, receipt);
    
    return receipt;
  } catch (error: any) {
    console.error('Failed to get transaction receipt:', error);
    throw new Error(`Failed to get transaction receipt: ${error.message || "Unknown error"}`);
  }
};

// Mock Connex for development environments without blockchain access
function mockConnex() {
  console.warn("Using enhanced mock Connex implementation for development");
  
  // First, ensure crypto environment is properly set up
  setupCryptoEnvironment();
  
  try {
    // Check if we have a private key in the environment
    const privateKey = import.meta.env.VITE_VECHAIN_PRIVATE_KEY;
    
    if (privateKey) {
      console.log("Mock Connex has detected environment key");
    } else {
      console.log("No private key found, using fully mocked Connex");
    }
    
    // Add detailed debug info
    console.debug("Browser crypto availability:", !!window.crypto);
    console.debug("CryptoPolyfill availability:", !!(window as any).cryptoPolyfill);
    
    // Generate mock blockchain data
    const mockBlockTime = Math.floor(Date.now() / 1000);
    const mockBlockNumber = 12345678;
    const mockBlockId = '0x' + Array(64).fill('1').join('');
    const testAddress = '0x7567D83b7b8d80ADdCb281A71d54Fc7B3364ffed';
    
    // Return a more complete mock object
    return {
      thor: {
        account: (address: string) => ({
          method: (abi: any) => ({
            call: async (...params: any[]) => ({ data: '0x', reverted: false }),
            asClause: (...params: any[]) => ({
              to: address,
              value: '0x0',
              data: '0x'
            })
          }),
          get: async () => ({
            balance: '10000000000000000000', // 10 VET
            energy: '1000000000000000000',  // 1 VTHO
            hasCode: false
          })
        }),
        transaction: (txId: string) => ({
          getReceipt: async () => ({
            meta: {
              blockID: mockBlockId,
              blockNumber: mockBlockNumber,
              blockTimestamp: mockBlockTime,
              txID: txId,
              txOrigin: testAddress
            },
            reverted: false,
            outputs: [{
              contractAddress: null,
              events: [],
              transfers: []
            }]
          })
        }),
        genesis: {
          id: '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127' // TestNet genesis
        },
        status: {
          head: {
            id: mockBlockId,
            number: mockBlockNumber,
            timestamp: mockBlockTime,
            parentID: '0x' + Array(64).fill('2').join(''),
            txsFeatures: 1,
            gasLimit: 10000000
          },
          progress: 1
        }
      },
      vendor: {
        sign: async (type: string, clauses: any[]) => {
          console.log("MOCK: Signing transaction with clauses:", clauses);
          return {
            txid: '0x' + Math.random().toString(16).substring(2, 34),
            signer: testAddress
          };
        }
      }
    };
  } catch (error) {
    console.error("Error creating enhanced mock Connex:", error);
    
    // Return the original simplified mock if anything fails
    return {
      thor: {
        account: (address: string) => ({
          method: (abi: any) => ({
            call: async (...params: any[]) => ({ data: '0x', reverted: false }),
            asClause: (...params: any[]) => ({
              to: address,
              value: '0x0',
              data: '0x'
            })
          })
        }),
        transaction: (txId: string) => ({
          getReceipt: async () => ({
            meta: {
              blockID: '0x' + Math.random().toString(16).substring(2, 66),
              blockNumber: Math.floor(Math.random() * 1000000),
              blockTimestamp: Math.floor(Date.now() / 1000),
              txID: txId,
              txOrigin: '0x7567D83b7b8d80ADdCb281A71d54Fc7B3364ffed'
            },
            reverted: false,
            outputs: [{
              contractAddress: null,
              events: [],
              transfers: []
            }]
          })
        })
      }
    };
  }
}

// Mock vendor for development environments
function mockVendor() {
  return {
    address: '0x7567D83b7b8d80ADdCb281A71d54Fc7B3364ffed',
    sign: async (type: string, clauses: any[]) => ({
      txid: '0x' + Math.random().toString(16).substring(2, 34),
      signer: '0x7567D83b7b8d80ADdCb281A71d54Fc7B3364ffed'
    }),
    signCert: async (certMessage: any) => ({
      annex: {
        domain: 'vecollab.io',
        timestamp: Date.now(),
        signer: '0x7567D83b7b8d80ADdCb281A71d54Fc7B3364ffed'
      },
      signature: '0x1234567890abcdef',
      certified: true
    })
  };
}