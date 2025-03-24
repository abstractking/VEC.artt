/**
 * Type definitions for Connex (VeChain) vendor signing
 * This file expands on the standard Connex types to properly
 * handle signing certificate and transaction operations
 */

interface ConnexSignCertificateOptions {
  purpose: string;
  payload: {
    type: "text" | "binary";
    content: string;
  };
}

interface ConnexSignTxOptions {
  // Transaction clause
  to: string | null; // destination address, or null for contract creation
  value: string; // hex string, e.g. '0x64'
  data?: string; // hex string
}

interface ConnexVendorSignResult {
  annex?: {
    domain: string;
    timestamp: number;
    signer: string;
  };
  signature?: string;
  certified?: boolean;
  txid?: string;
  signer?: string;
}

interface ConnexVendor {
  sign(type: 'cert', message: ConnexSignCertificateOptions): {
    request(): Promise<ConnexVendorSignResult>;
  };
  sign(type: 'tx', message: ConnexSignTxOptions[]): {
    request(): Promise<ConnexVendorSignResult>;
  };
}

// Add Thor types
interface ConnexThor {
  account(address: string): any;
  transaction(id: string): any;
  filter: any;
  ticker(): any;
  explain(clauses: any[]): any;
  genesis: {
    id: string;
  };
  status: {
    head: {
      id: string;
      number: number;
      timestamp: number;
    }
  };
}

// Extend Connex types
interface Connex {
  thor: ConnexThor;
  vendor: ConnexVendor;
}

// Add VeWorld types for wallet
interface VeWorldWallet {
  isVeWorld: boolean;
  newConnex(options: any): Promise<Connex>;
  newConnexVendor(options: any): Promise<ConnexVendor>;
  request(options: any): Promise<any>;
  getVendor?(): Promise<ConnexVendor>;
}

// Extend the Window interface
interface Window {
  connex?: Connex;
  vechain?: VeWorldWallet;
  thor?: any;
}