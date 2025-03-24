import { Framework } from '@vechain/connex-framework';
import { Driver, SimpleWallet } from '@vechain/connex-driver';
import Connex from '@vechain/connex';
import { Buffer } from 'buffer';
import { BrowserNet } from './browser-net';

// Import network configurations
import { Network, NETWORKS as NETWORK_DESCRIPTORS, NetworkDescriptor } from './Network';

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

// Calculate the base URL for our API proxy endpoints
const getBaseUrl = () => {
  // In production or Replit environment, use relative paths
  return '';
};

export const NODES = {
  main: {
    // Use proxy endpoints to avoid CORS issues with direct VeChain node access
    url: `${getBaseUrl()}/api/vechain/mainnet`,
    socketUrl: `${getBaseUrl()}/api/vechain/mainnet`,
    // Using VeBlocks links for better compatibility with Sync 2 and VeWorld wallets
    directUrl: 'https://mainnet.veblocks.net',
    directSocketUrl: 'wss://mainnet.veblocks.net',
  },
  test: {
    // Use proxy endpoints to avoid CORS issues with direct VeChain node access
    url: `${getBaseUrl()}/api/vechain/testnet`,
    socketUrl: `${getBaseUrl()}/api/vechain/testnet`,
    // Using VeBlocks links for better compatibility with Sync 2 and VeWorld wallets
    directUrl: 'https://testnet.veblocks.net',
    directSocketUrl: 'wss://testnet.veblocks.net',
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
        
        // For Replit environment, use a specialized configuration
        try {
          // Check if we have a private key for test environment
          const privateKey = import.meta.env.VITE_VECHAIN_PRIVATE_KEY;
          
          if (privateKey) {
            // Create a wallet with the private key
            const wallet = new SimpleWallet();
            wallet.import(privateKey);
            
            // Create a dedicated network instance for this wallet
            const net = new BrowserNet(network.url);
            const driver = await Driver.connect(net, wallet);
            const framework = new Framework(driver);
            
            connexInstance = framework;
            return framework;
          } else {
            // Initialize with direct HTTP connection without a wallet
            const net = new BrowserNet(network.url);
            const driver = await Driver.connect(net);
            const framework = new Framework(driver);
            
            connexInstance = framework;
            return framework;
          }
        } catch (connexError) {
          console.error("Connex initialization failed:", connexError);
          throw new Error('Failed to initialize blockchain connection: ' + connexError);
        }
      }
      
      // Default initialization for non-Replit environments or fallback
      const driver = await Driver.connect(new BrowserNet(network.url), wallet);
      connexInstance = new Framework(driver);
      return connexInstance;
    } else {
      // We're transitioning to testnet, no mock instance is allowed
      console.warn('Non-browser environment detected but no mock instance is allowed');
      throw new Error('Cannot initialize Connex in non-browser environment');
    }
  } catch (error) {
    console.error('Failed to initialize Connex:', error);
    throw new Error('Failed to initialize Connex: ' + (error instanceof Error ? error.message : String(error)));
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
          const driver = await Driver.connect(new BrowserNet(network.url), wallet);
          connexInstance = new Framework(driver);
          console.log("Connected to TestNet with private key wallet");
          return connexInstance;
        } else {
          // No private key, use regular connection
          console.log("Initializing VeChain connection to:", network.url);
          
          const net = new BrowserNet(network.url);
          console.log("Created BrowserNet instance");
          
          const driver = await Driver.connect(net).catch(error => {
            console.error("Driver connection failed:", {
              error,
              message: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
              network
            });
            throw error;
          });
          console.log("Driver connected successfully");
          
          const framework = new Framework(driver);
          console.log("Framework initialized");
          
          connexInstance = framework;
          return connexInstance;
        }
      } catch (devError) {
        console.error("Development Connex initialization failed:", {
          error: devError,
          message: devError instanceof Error ? devError.message : String(devError),
          stack: devError instanceof Error ? devError.stack : undefined,
          network: getNetwork(),
          environment: {
            isDev: import.meta.env.DEV,
            mode: import.meta.env.MODE,
            isReplit,
            hasPrivateKey: !!import.meta.env.VITE_VECHAIN_PRIVATE_KEY
          }
        });
        throw new Error('Development blockchain connection failed: ' + String(devError));
      }
    }
    
    // For production: Try WebSocket first, then fallback to HTTP
    try {
      // WebSocket URL (if available)
      let wsUrl = '';
      try {
        // Use VeBlocks node endpoints for better compatibility with Sync 2 and VeWorld wallets
        wsUrl = (network as any).socketUrl || (network.name.toLowerCase() === 'main' 
          ? 'wss://mainnet.veblocks.net'
          : 'wss://testnet.veblocks.net');
      } catch (error) {
        console.warn("Could not determine WebSocket URL:", error);
        wsUrl = network.name.toLowerCase() === 'main' 
          ? 'wss://mainnet.veblocks.net'
          : 'wss://testnet.veblocks.net';
      }
        
      // Try WebSocket connection first for better performance
      console.log("Attempting WebSocket connection to:", wsUrl);
      const wsDriver = await Driver.connect(new BrowserNet(wsUrl));
      console.log("WebSocket driver connected successfully");
      
      connexInstance = new Framework(wsDriver);
      console.log("WebSocket Connex framework initialized");
      
      return connexInstance;
    } catch (wsError) {
      console.warn("WebSocket connection failed, falling back to HTTP:", {
        error: wsError,
        message: wsError instanceof Error ? wsError.message : String(wsError),
        stack: wsError instanceof Error ? wsError.stack : undefined,
        wsUrl: network.socketUrl || 'unknown',
        network
      });
      
      // Fall back to HTTP
      try {
        console.log("Attempting HTTP fallback connection to:", network.url);
        const driver = await Driver.connect(new BrowserNet(network.url));
        console.log("HTTP driver connected successfully");
        
        connexInstance = new Framework(driver);
        console.log("HTTP Connex framework initialized");
        
        return connexInstance;
      } catch (httpError) {
        console.error("HTTP fallback connection failed:", {
          error: httpError,
          message: httpError instanceof Error ? httpError.message : String(httpError),
          stack: httpError instanceof Error ? httpError.stack : undefined,
          network,
          environment: {
            isDev: import.meta.env.DEV,
            mode: import.meta.env.MODE,
            isReplit,
            hasPrivateKey: !!import.meta.env.VITE_VECHAIN_PRIVATE_KEY
          }
        });
        throw new Error('All blockchain connection attempts failed. Please check your network settings and wallet configuration.');
      }
    }
  } catch (error) {
    console.error('Failed to get Connex instance:', error);
    throw new Error('Blockchain connection initialization failed: ' + String(error));
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
    const net = new BrowserNet(network.url);
    
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
          } else {
            // For certificate signing, return the certificate
            return signedTx;
          }
        } catch (signingError) {
          console.error(`REAL TX ERROR:`, signingError);
          throw signingError;
        }
      }
    };
    
    return { connex: framework, vendor };
  } catch (error) {
    console.error('Failed to connect with environment key:', error);
    throw new Error('Failed to connect with environment key: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Connect to wallet
export const connectWallet = async (walletType: string = 'thor', privateKey?: string) => {
  try {
    console.log(`Connecting to ${walletType} wallet...`);
    
    // Check if we already have connex
    if (!connexInstance) {
      connexInstance = await getConnex();
    }
    
    // If we have a private key, use it directly
    if (privateKey) {
      const wallet = new SimpleWallet();
      wallet.import(privateKey);
      
      // Create a dedicated network instance for this wallet
      const network = getNetwork();
      const net = new BrowserNet(network.url);
      
      // Create a custom driver for this wallet
      const driver = await Driver.connect(net, wallet);
      const framework = new Framework(driver);
      
      // Get the address from the wallet
      const account = wallet.list[0];
      console.log(`Connected with private key for address: ${account.address}`);
      
      return { address: account.address };
    }
    
    // Try to connect using the global connex instance
    try {
      // Get certificate to identify the user
      const certificate = { 
        purpose: 'identification', 
        payload: { type: 'text', content: 'Connect to VeCollab Marketplace' } 
      };
      
      const result = await connexInstance.vendor.sign('cert', certificate).request();
      console.log('Certificate signing successful:', result);
      
      if (result.annex && result.annex.signer) {
        return { address: result.annex.signer };
      } else {
        throw new Error('No signer address returned from certificate');
      }
    } catch (certError) {
      console.error('Certificate signing failed:', certError);
      throw new Error('Failed to connect to wallet: ' + (certError instanceof Error ? certError.message : String(certError)));
    }
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw new Error('Wallet connection error: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Get wallet balance
export const getWalletBalance = async (address: string): Promise<{ vet: string; vtho: string }> => {
  try {
    if (!connexInstance) {
      connexInstance = await getConnex();
    }
    
    // Get account info from VeChain
    const accountInfo = await connexInstance.thor.account(address).get();
    
    // Convert the balances to human-readable format
    // VeChain returns balances in HEX format
    const vetWei = parseInt(accountInfo.balance, 16);
    const vthoWei = parseInt(accountInfo.energy, 16);
    
    // Convert to VET and VTHO (1 VET/VTHO = 10^18 wei)
    const vet = (vetWei / 1e18).toFixed(2);
    const vtho = (vthoWei / 1e18).toFixed(2);
    
    return { vet, vtho };
  } catch (error) {
    console.error('Failed to get wallet balance:', error);
    throw new Error('Failed to get wallet balance: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Get wallet address (returns null if not connected)
export const getWalletAddress = async () => {
  try {
    // We need to use a certificate to identify the user
    if (!connexInstance) {
      connexInstance = await getConnex();
    }
    
    // Get certificate to identify the user
    const certificate = { 
      purpose: 'identification', 
      payload: { type: 'text', content: 'Get wallet address' } 
    };
    
    const result = await connexInstance.vendor.sign('cert', certificate).request();
    
    if (result.annex && result.annex.signer) {
      return result.annex.signer;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting wallet address:', error);
    return null;
  }
};

// Sign a message with the connected wallet
export const signMessage = async (message: string) => {
  try {
    if (!connexInstance) {
      connexInstance = await getConnex();
    }
    
    // Create a certificate with the message
    const certificate = { 
      purpose: 'agreement', 
      payload: { type: 'text', content: message } 
    };
    
    // Sign the certificate
    const result = await connexInstance.vendor.sign('cert', certificate).request();
    
    return {
      signature: result.signature,
      signer: result.annex.signer
    };
  } catch (error) {
    console.error('Failed to sign message:', error);
    throw new Error('Failed to sign message: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Call a contract method (view function)
export const callContractMethod = async (
  contractAddress: string,
  abi: any,
  method: string,
  params: any[] = []
) => {
  try {
    if (!connexInstance) {
      connexInstance = await getConnex();
    }
    
    // Create a method object to call the contract
    const methodObj = connexInstance.thor.account(contractAddress).method(abi);
    
    // Call the method
    const result = await methodObj.call(params);
    
    return result.decoded;
  } catch (error) {
    console.error(`Failed to call contract method ${method}:`, error);
    throw new Error(`Failed to call contract method ${method}: ` + (error instanceof Error ? error.message : String(error)));
  }
};

// Execute a contract method (write function)
export const executeContractMethod = async (
  contractAddress: string,
  abi: any,
  method: string,
  params: any[] = [],
  value: string = '0'
) => {
  try {
    if (!connexInstance) {
      connexInstance = await getConnex();
    }
    
    // Create a clause for the contract method
    const methodObj = connexInstance.thor.account(contractAddress).method(abi);
    const clause = methodObj.asClause(params, value);
    
    // Execute the transaction
    const result = await connexInstance.vendor.sign('tx', [clause]).request();
    
    return result.txid;
  } catch (error) {
    console.error(`Failed to execute contract method ${method}:`, error);
    throw new Error(`Failed to execute contract method ${method}: ` + (error instanceof Error ? error.message : String(error)));
  }
};

// Deploy a contract to the blockchain
export const deployContract = async (abi: any, bytecode: string, params: any[] = []) => {
  try {
    if (!connexInstance) {
      connexInstance = await getConnex();
    }
    
    // Create the contract deployment transaction
    // For contract deployment, we use an empty address and set the data to the bytecode
    const clause = {
      to: null, // null address for contract deployment
      value: '0x0',
      data: bytecode
    };
    
    // Sign and send the transaction
    const result = await connexInstance.vendor.sign('tx', [clause]).request();
    
    return result.txid;
  } catch (error) {
    console.error('Failed to deploy contract:', error);
    throw new Error('Failed to deploy contract: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Get transaction receipt
export const getTransactionReceipt = async (txId: string) => {
  try {
    if (!connexInstance) {
      connexInstance = await getConnex();
    }
    
    // Get transaction receipt
    const receipt = await connexInstance.thor.transaction(txId).getReceipt();
    
    return receipt;
  } catch (error: any) {
    console.error('Failed to get transaction receipt:', error);
    throw new Error(`Failed to get transaction receipt: ${error.message || "Unknown error"}`);
  }
};