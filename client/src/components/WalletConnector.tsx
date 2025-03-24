import React from 'react';
import { Button } from '@/components/ui/button';
import { WalletIcon, AlertCircleIcon } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useVeChain } from '@/contexts/VeChainContext';
import BlockchainConnectionError from '@/components/BlockchainConnectionError';

interface WalletConnectorProps {
  children: React.ReactNode;
  requireConnection?: boolean;
  showErrors?: boolean;
  fallbackComponent?: React.ReactNode;
}

/**
 * WalletConnector component
 * 
 * Provides a consistent wrapper for wallet connection across the application
 * Shows appropriate UI based on connection state and errors
 * 
 * @param children - Content to display when wallet is connected
 * @param requireConnection - Whether to require wallet connection to show children
 * @param showErrors - Whether to show blockchain connection errors
 * @param fallbackComponent - Optional custom component to show when wallet is not connected
 */
export default function WalletConnector({
  children,
  requireConnection = true,
  showErrors = true,
  fallbackComponent
}: WalletConnectorProps) {
  const { isConnected, connectWallet } = useWallet();
  const { error: blockchainError, isInitializing } = useVeChain();

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  // If blockchain has an error and we should show errors
  if (blockchainError && !isInitializing && showErrors) {
    return (
      <div className="w-full max-w-2xl mx-auto my-4">
        <BlockchainConnectionError onRetry={() => window.location.reload()} />
      </div>
    );
  }

  // If we require connection and wallet is not connected
  if (requireConnection && !isConnected) {
    // If a custom fallback component is provided, use that
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    // Otherwise show the default connection prompt
    return (
      <div className="w-full bg-background rounded-lg border border-border p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <WalletIcon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            You need to connect your VeChain wallet to access this feature.
          </p>
          <Button onClick={handleConnectWallet} size="lg">
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  // If no wallet is required or wallet is connected, render children
  return <>{children}</>;
}