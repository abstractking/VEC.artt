/**
 * Error Service
 * 
 * This module provides centralized error handling for the application,
 * with specific focus on wallet connection and blockchain interactions.
 * It standardizes error messages, logging, and user feedback.
 */

import { getLogLevel } from './environment-service';

// Error categories to better organize and handle errors
export enum ErrorCategory {
  WALLET_CONNECTION = 'wallet_connection',
  WALLET_SIGNATURE = 'wallet_signature',
  BLOCKCHAIN_TRANSACTION = 'blockchain_transaction',
  NETWORK = 'network',
  API = 'api',
  ENVIRONMENT = 'environment',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown'
}

// Standard error format for application
export interface AppError {
  message: string;        // User-friendly error message
  category: ErrorCategory; // Error category for handling
  code?: string;          // Optional error code
  originalError?: any;    // Original error for debugging
  details?: any;          // Additional error details
  suggestions?: string[]; // Possible solutions
}

// Determines the appropriate log level based on environment
const logLevel = getLogLevel();

// Logger function with level-based filtering
export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (['debug'].includes(logLevel)) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (['debug', 'info'].includes(logLevel)) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (['debug', 'info', 'warn'].includes(logLevel)) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    // Always log errors
    console.error(`[ERROR] ${message}`, ...args);
  }
};

// Centralized error handler for wallet errors
export const handleWalletError = (error: any, walletType: string): AppError => {
  let result: AppError = {
    message: 'An unknown wallet error occurred',
    category: ErrorCategory.WALLET_CONNECTION,
    originalError: error,
    details: { walletType }
  };
  
  // Default suggestions for wallet connection issues
  const defaultSuggestions = [
    'Make sure your wallet extension is installed and enabled',
    'Ensure your wallet is unlocked',
    'Check that you have the correct network selected in your wallet'
  ];
  
  // Extract a more specific message if possible
  if (error instanceof Error) {
    logger.debug(`Handling wallet error for ${walletType}:`, error);
    
    // Handle specific error types
    if (error.message.includes('User rejected')) {
      result.message = 'Connection request was rejected by the user';
      result.code = 'USER_REJECTED';
      result.suggestions = ['Please approve the connection request in your wallet'];
    } else if (error.message.includes('not detected') || error.message.includes('not found')) {
      result.message = `${walletType} wallet not detected`;
      result.code = 'WALLET_NOT_DETECTED';
      result.suggestions = [`Please install the ${walletType} wallet extension`];
    } else if (error.message.includes('network') || error.message.includes('chainId') || error.message.includes('genesisId')) {
      result.message = 'Network configuration error';
      result.category = ErrorCategory.NETWORK;
      result.code = 'NETWORK_ERROR';
      result.suggestions = ['Ensure your wallet is configured for the correct network'];
    } else {
      // Use the original error message, but clean it up
      result.message = error.message
        .replace(/^Error: /, '') // Remove "Error: " prefix
        .replace(/\.\s*$/, '');  // Remove trailing period
    }
  } else if (typeof error === 'string') {
    result.message = error;
  }
  
  // Add default suggestions if none were set
  if (!result.suggestions) {
    result.suggestions = defaultSuggestions;
  }
  
  // Log the error
  logger.error(`Wallet error (${walletType}): ${result.message}`, {
    code: result.code,
    details: result.details,
    originalError: error instanceof Error ? error.stack : error
  });
  
  return result;
};

// Format blockchain transaction errors
export const handleTransactionError = (error: any, txDetails?: any): AppError => {
  let result: AppError = {
    message: 'Transaction failed',
    category: ErrorCategory.BLOCKCHAIN_TRANSACTION,
    originalError: error,
    details: txDetails
  };
  
  if (error instanceof Error) {
    // Common transaction error patterns
    if (error.message.includes('gas')) {
      result.message = 'Transaction failed due to gas estimation';
      result.code = 'GAS_ERROR';
      result.suggestions = ['You may need to increase the gas limit'];
    } else if (error.message.includes('rejected')) {
      result.message = 'Transaction was rejected by the user';
      result.code = 'TX_REJECTED';
      result.suggestions = ['Please approve the transaction in your wallet'];
    } else if (error.message.includes('nonce')) {
      result.message = 'Transaction failed due to incorrect nonce';
      result.code = 'NONCE_ERROR';
      result.suggestions = ['Please wait for any pending transactions to complete'];
    } else {
      result.message = error.message.replace(/^Error: /, '');
    }
  }
  
  logger.error(`Transaction error: ${result.message}`, {
    code: result.code,
    details: result.details,
    originalError: error instanceof Error ? error.stack : error
  });
  
  return result;
};

// Handle application errors with consistent formatting
export const handleApplicationError = (error: any, category = ErrorCategory.UNKNOWN): AppError => {
  let result: AppError = {
    message: 'An unexpected error occurred',
    category,
    originalError: error
  };
  
  if (error instanceof Error) {
    result.message = error.message.replace(/^Error: /, '');
  } else if (typeof error === 'string') {
    result.message = error;
  }
  
  logger.error(`Application error (${category}): ${result.message}`, {
    originalError: error instanceof Error ? error.stack : error
  });
  
  return result;
};

// Create a formatted error from scratch
export const createAppError = (
  message: string, 
  category: ErrorCategory,
  code?: string,
  suggestions?: string[],
  details?: any
): AppError => {
  return {
    message,
    category,
    code,
    suggestions,
    details
  };
};