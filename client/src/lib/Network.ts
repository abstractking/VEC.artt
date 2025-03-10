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
    id: '0x1', // For mainnet, VeWorld expects 0x1
    name: 'main',
  },
  [Network.TEST]: {
    id: '0x000000000b2bce3c70bc649a02749e8687721b09ed2e57f46685eca98e8e0b61', // Updated TestNet genesis ID
    name: 'test',
  },
};

export function getNetwork(network: Network): NetworkDescriptor {
  return NETWORKS[network];
}