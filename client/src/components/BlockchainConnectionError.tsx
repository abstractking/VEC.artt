import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircleIcon, RefreshCwIcon, WalletIcon } from 'lucide-react';
import { Network } from '@/lib/Network';
import { useWallet } from '@/contexts/WalletContext'; 
import { Link } from 'wouter';

interface BlockchainConnectionErrorProps {
  onRetry?: () => void;
}

/**
 * Component that displays when blockchain connection fails
 * Provides helpful guidance and retry options
 */
export default function BlockchainConnectionError({ onRetry }: BlockchainConnectionErrorProps) {
  const { connectWallet } = useWallet();
  const network = import.meta.env.VITE_REACT_APP_VECHAIN_NETWORK || 'test';
  const isTestNet = network !== 'main';
  
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Refresh the page as a default option
      window.location.reload();
    }
  };
  
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      // After successful connection, retry the operation
      handleRetry();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-destructive/10">
        <div className="flex items-start gap-4">
          <AlertCircleIcon className="h-8 w-8 text-destructive mt-1" />
          <div>
            <CardTitle className="text-xl font-semibold">Blockchain Connection Error</CardTitle>
            <CardDescription className="text-muted-foreground">
              We're having trouble connecting to the VeChain {isTestNet ? 'TestNet' : 'MainNet'} blockchain.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <Alert variant="destructive">
          <AlertTitle className="font-medium">Connection failed</AlertTitle>
          <AlertDescription>
            The application couldn't establish a connection to the VeChain blockchain. This may be due to network issues or browser restrictions.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Recommended Solutions:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Make sure you have a wallet extension installed (VeWorld or Sync2)</li>
            <li>Check your internet connection and try again</li>
            <li>Try connecting your wallet directly using the button below</li>
            {isTestNet && (
              <li>For TestNet connections, make sure your wallet is configured for TestNet</li>
            )}
            <li>Try using our wallet testing page for more detailed diagnostics</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-2">
        <Button variant="outline" onClick={handleRetry} className="w-full sm:w-auto">
          <RefreshCwIcon className="h-4 w-4 mr-2" />
          Retry Connection
        </Button>
        <Button onClick={handleConnectWallet} className="w-full sm:w-auto">
          <WalletIcon className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
        <Link href="/wallet-test-advanced">
          <Button variant="secondary" className="w-full sm:w-auto">
            Wallet Diagnostics
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}