/**
 * Network options for VeChain
 * This implementation follows VeWorld's expected API format
 */
export const enum Network {
  MAIN = 'main',
  TEST = 'test',
}

export interface NodeOptions {
  url: string;
  timeout?: number;
}

// This is critical - NetworkDescriptor must match EXACTLY what VeWorld expects
export interface NetworkDescriptor {
  id: string;     // This must be the genesis ID hash
  name: string;   // This must be lowercase 'main' or 'test'
}

// Network definitions exactly matching VeWorld's expectations
export const NETWORKS: Record<Network, NetworkDescriptor> = {
  [Network.MAIN]: {
    id: '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a', // Updated Mainnet genesis ID
    name: 'main',
  },
  [Network.TEST]: {
    id: '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127', // Updated TestNet genesis ID
    name: 'test',
  },
};

export function getNetwork(network: Network): NetworkDescriptor {
  return NETWORKS[network];
}