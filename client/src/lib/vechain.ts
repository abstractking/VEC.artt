import { Framework } from '@vechain/connex-framework';
import { Driver, SimpleNet, SimpleWallet } from '@vechain/connex-driver';
import { utils } from '@vechain.energy/connex-utils';

// Define network options
export const NETWORKS = {
  main: {
    url: 'https://mainnet.veblocks.net',
    chainId: '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a'
  },
  test: {
    url: 'https://testnet.veblocks.net',
    chainId: '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127'
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
    
    // Check if Thor wallet is available in the browser
    if (typeof window !== 'undefined' && (window as any).thor) {
      try {
        const vendor = await (window as any).thor.enable();
        const connex = await initializeConnex();
        return { connex, vendor };
      } catch (err) {
        console.error('Browser wallet not available:', err);
        // Fall back to mock for development
        const mockVendorInstance = mockVendor();
        return { 
          connex: mockConnex(), 
          vendor: mockVendorInstance 
        };
      }
    } else {
      // Return mock for development if no wallet is available
      console.warn('No wallet detected, using mock wallet for development');
      const mockVendorInstance = mockVendor();
      return { 
        connex: mockConnex(), 
        vendor: mockVendorInstance 
      };
    }
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    const mockVendorInstance = mockVendor();
    return { 
      connex: mockConnex(), 
      vendor: mockVendorInstance 
    };
  }
};

// Get wallet address from the connected wallet
export const getWalletAddress = async () => {
  try {
    // Check if Thor wallet is available
    if (typeof window !== 'undefined' && (window as any).thor) {
      const vendor = await (window as any).thor.enable();
      return vendor.address;
    } else {
      // For development, return a mock address
      return '0x7567D83b7b8d80ADdCb281A71d54Fc7B3364ffed';
    }
  } catch (error) {
    console.error('Failed to get wallet address:', error);
    // For development, return a mock address
    return '0x7567D83b7b8d80ADdCb281A71d54Fc7B3364ffed';
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
    if (typeof window !== 'undefined' && (window as any).thor) {
      const vendor = await (window as any).thor.enable();
      const connex = await getConnex();
      const contract = connex.thor.account(contractAddress);
      
      const method = contract.method(abi.find((item: any) => item.name === methodName));
      const clause = method.asClause(...params);
      
      const result = await vendor.sign('tx', [clause]);
      return result;
    } else {
      // Mock transaction for development
      return {
        txid: '0x' + Math.random().toString(16).substring(2, 34),
        signer: '0x7567D83b7b8d80ADdCb281A71d54Fc7B3364ffed'
      };
    }
  } catch (error) {
    console.error(`Failed to execute contract method ${methodName}:`, error);
    // Mock transaction for development
    return {
      txid: '0x' + Math.random().toString(16).substring(2, 34),
      signer: '0x7567D83b7b8d80ADdCb281A71d54Fc7B3364ffed'
    };
  }
};

// Deploy a new contract
export const deployContract = async (abi: any, bytecode: string, params: any[] = []) => {
  try {
    if (typeof window !== 'undefined' && (window as any).thor) {
      const vendor = await (window as any).thor.enable();
      const connex = await getConnex();
      
      // Create deployment clause
      const clause = {
        to: null,
        value: '0x0',
        data: bytecode
      };
      
      const result = await vendor.sign('tx', [clause]);
      return result;
    } else {
      // Mock deployment for development
      return {
        txid: '0x' + Math.random().toString(16).substring(2, 34),
        signer: '0x7567D83b7b8d80ADdCb281A71d54Fc7B3364ffed'
      };
    }
  } catch (error) {
    console.error('Failed to deploy contract:', error);
    // Mock deployment for development
    return {
      txid: '0x' + Math.random().toString(16).substring(2, 34),
      signer: '0x7567D83b7b8d80ADdCb281A71d54Fc7B3364ffed'
    };
  }
};

// Get a transaction receipt
export const getTransactionReceipt = async (txId: string) => {
  try {
    const connex = await getConnex();
    const receipt = await connex.thor.transaction(txId).getReceipt();
    return receipt;
  } catch (error) {
    console.error('Failed to get transaction receipt:', error);
    // Mock receipt for development
    return {
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
    };
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