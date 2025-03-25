/**
 * VeWorld Wallet Connector
 * 
 * This module provides a specialized connector for the VeWorld wallet
 * that directly matches the exact format expected by the VeWorld API.
 * Optimized for mobile users and enhanced error handling.
 */

import { Network } from './Network';
import { connectVeWorld as newConnectVeWorld } from './veworld-connector-new';
import { isMobileDevice as newIsMobileDevice } from './veworld-connector-new';

// Export the new functions for backward compatibility
export const connectVeWorld = newConnectVeWorld;
export const isMobileDevice = newIsMobileDevice;

// Export types
export interface VeWorldWallet {
  isVeWorld: boolean;
  newConnex: (options: any) => Promise<any>;
  newConnexVendor: (options: any) => Promise<any>;
  getVendor?: () => Promise<any>;
  request: (options: any) => Promise<any>;
}

export interface VeWorldConnection {
  connex: any;
  vendor: any;
  error?: string;
}

// Deprecated functions - these are kept for compatibility but will use the new implementation
export async function connectVeWorldWallet(networkType: Network): Promise<VeWorldConnection> {
  console.log("Using new VeWorld connector implementation");
  return connectVeWorld(networkType);
}

export async function connectVeWorldWalletAlt(networkType: Network): Promise<VeWorldConnection> {
  console.log("Using new VeWorld connector implementation");
  return connectVeWorld(networkType);
}

export async function connectVeWorldWalletMinimal(networkType: Network): Promise<VeWorldConnection> {
  console.log("Using new VeWorld connector implementation");
  return connectVeWorld(networkType);
}