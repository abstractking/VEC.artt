import { Framework } from '@vechain/connex-framework';
import { Driver, SimpleNet, SimpleWallet } from '@vechain/connex-driver';
import { utils } from '@vechain.energy/connex-utils';

// Define network options (from https://docs.vechain.org/developer-resources/how-to-build-on-vechain/connect-to-the-network)
export const NETWORKS = {
  main: {
    // Official Public Node for MainNet
    url: 'https://mainnet.vechain.org',
    chainId: '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a',
    name: 'MainNet'
  },
  test: {
    // Official Public Node for TestNet
    url: 'https://testnet.vechain.org',
    chainId: '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127',
    name: 'TestNet'
  },
  solo: {
    // Local solo network for development (if needed)
    url: 'http://localhost:8669',
    chainId: '0x00000000973ceb7f343a58b08f0693d6701a5fd354ff73dc1bcfb261a985b234',
    name: 'Solo'
  }
};

// Get the selected network from environment variables
export const getNetwork = () => {
  const selectedNetwork = import.meta.env.VITE_REACT_APP_VECHAIN_NETWORK || 'test';
  return NETWORKS[selectedNetwork as keyof typeof NETWORKS] || NETWORKS.test;
};

let connexInstance: any = null;

// Initialize Connex (VeChain blockchain interface)
export const initializeConnex = async (wallet?: SimpleWallet) => {
  try {
    if (connexInstance) return connexInstance;
    
    const network = getNetwork();
    
    // Check if we're in browser or Node.js environment
    if (typeof window !== 'undefined') {
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
    if (!connexInstance) {
      return await initializeConnex();
    }
    return connexInstance;
  } catch (error) {
    console.error('Failed to get Connex instance:', error);
    return mockConnex();
  }
};

// Connect to wallet
export const connectWallet = async (privateKey?: string) => {
  try {
    const network = getNetwork();
    
    // If private key is provided, use it to create a wallet
    if (privateKey) {
      const wallet = new SimpleWallet();
      wallet.import(privateKey);
      return await initializeConnex(wallet);
    }
    
    // For the Replit environment, always use mock vendor
    if (window.location.hostname.includes('replit') || 
        window.location.hostname === 'localhost' || 
        import.meta.env.DEV || 
        import.meta.env.MODE === 'development') {
      console.log("Development environment detected, using mock wallet");
      const connex = await initializeConnex();
      const vendor = mockVendor();
      return { connex, vendor };
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

// Get wallet address from the connected wallet
export const getWalletAddress = async () => {
  try {
    // For the Replit environment, always use mock address
    if (window.location.hostname.includes('replit') || 
        window.location.hostname === 'localhost' || 
        import.meta.env.DEV || 
        import.meta.env.MODE === 'development') {
      console.log("Development environment detected, using mock wallet address");
      return '0x7567D83b7b8d80ADdCb281A71d54Fc7B3364ffed';
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
    if (typeof window !== 'undefined' && (window as any).thor) {
      const vendor = await (window as any).thor.enable();
      const certMessage = {
        purpose: 'identification',
        payload: {
          type: 'text',
          content: message
        }
      };
      
      const result = await vendor.signCert(certMessage);
      return result;
    } else {
      // Mock signature for development
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
    // For the Replit environment, always use mock vendor
    if (window.location.hostname.includes('replit') || 
        window.location.hostname === 'localhost' || 
        import.meta.env.DEV || 
        import.meta.env.MODE === 'development') {
      console.log(`Development environment detected, mocking contract execution for ${methodName}`);
      const mockVendorInstance = mockVendor();
      return await mockVendorInstance.sign('tx', [{
        to: contractAddress,
        value: '0x0',
        data: '0x' + Math.random().toString(16).substring(2, 10)
      }]);
    }
    
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
      
      // Validate bytecode
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