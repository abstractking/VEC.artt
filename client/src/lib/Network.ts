/**
 * Network configuration for VeChain with correct genesis IDs
 */
export const enum Network {
  MAIN = 'main',
  TEST = 'test',
}

export interface NetworkDescriptor {
  id: string;     // Genesis ID
  name: string;   // Must be lowercase 'main' or 'test'
  nodeUrl?: string;
}

// Get node URLs from environment variables with fallbacks
const getTestnetNodeUrl = (): string => {
  return import.meta.env.VITE_VECHAIN_NODE_URL_TESTNET || 'https://testnet.veblocks.net';
};

const getMainnetNodeUrl = (): string => {
  return import.meta.env.VITE_VECHAIN_NODE_URL_MAINNET || 'https://mainnet.veblocks.net';
};

// Get genesis IDs from environment variables with fallbacks
const getMainnetGenesisId = (): string => {
  return import.meta.env.VITE_VECHAIN_MAINNET_GENESIS_ID || 
         '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a';
};

const getTestnetGenesisId = (): string => {
  return import.meta.env.VITE_VECHAIN_TESTNET_GENESIS_ID || 
         '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127';
};

// Network definitions with correct genesis IDs matching VeWorld format exactly
export const NETWORKS: Record<Network, NetworkDescriptor> = {
  [Network.MAIN]: {
    id: getMainnetGenesisId(),
    name: 'main',
    nodeUrl: getMainnetNodeUrl(),
  },
  [Network.TEST]: {
    id: getTestnetGenesisId(),
    name: 'test',
    nodeUrl: getTestnetNodeUrl(),
  },
};

// Validate genesis ID format
export function validateGenesisId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  if (!id.startsWith('0x')) return false;
  if (id.length !== 66) return false;
  return true;
}

export function getNetwork(networkType: Network): NetworkDescriptor {
  const network = NETWORKS[networkType];
  if (!network) {
    throw new Error(`Invalid network type: ${networkType}`);
  }
  if (!validateGenesisId(network.id)) {
    throw new Error(`Invalid genesis ID for network ${networkType}: ${network.id}`);
  }
  console.log(`Network configuration resolved:`, {
    type: networkType,
    name: network.name,
    id: network.id
  });
  return network;
}

export function getNodeUrl(network: Network): string {
  return NETWORKS[network].nodeUrl || 
    (network === Network.MAIN ? getMainnetNodeUrl() : getTestnetNodeUrl());
}