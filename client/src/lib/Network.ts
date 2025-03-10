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
    id: '0x00000000c05d2f87b389c15e9e8e4f7b6c88e9e8a7b384f727e431355de5b093', // Updated TestNet genesis ID per VeChain docs
    name: 'test',
  },
};

export function getNetwork(network: Network): NetworkDescriptor {
  return NETWORKS[network];
}