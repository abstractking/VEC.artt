import { AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useVeChain } from '@/contexts/VeChainContext';
import { useState } from 'react';
import { useEffect } from 'react';
import { Network } from '@/lib/Network';

interface BlockchainConnectionErrorProps {
  onRetry?: () => void;
}

/**
 * Component that displays when blockchain connection fails
 * Provides helpful guidance and retry options
 */
export default function BlockchainConnectionError({ onRetry }: BlockchainConnectionErrorProps) {
  const { networkType, error } = useVeChain();
  const [isRetrying, setIsRetrying] = useState(false);
  const [countdown, setCountdown] = useState(10);
  
  // Auto countdown for retry
  useEffect(() => {
    if (!isRetrying) return;
    
    if (countdown <= 0) {
      handleRetry();
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown, isRetrying]);
  
  const handleRetry = () => {
    setIsRetrying(false);
    if (onRetry) {
      onRetry();
    } else {
      // Default retry: reload the page
      window.location.reload();
    }
  };
  
  const startRetryCountdown = () => {
    setIsRetrying(true);
    setCountdown(10);
  };
  
  const getBlockExplorerUrl = () => {
    return networkType === Network.MAIN 
      ? 'https://explore.vechain.org/' 
      : 'https://explore-testnet.vechain.org/';
  };
  
  const getNetworkName = () => {
    return networkType === Network.MAIN ? 'VeChain MainNet' : 'VeChain TestNet';
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5" />
          Blockchain Connection Error
        </CardTitle>
        <CardDescription className="text-red-600 dark:text-red-400">
          Unable to connect to {getNetworkName()} blockchain network
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Failed</AlertTitle>
          <AlertDescription>
            {error ? error.message : 'Network nodes are currently unreachable'}
          </AlertDescription>
        </Alert>
        
        <div className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
          <p>This could be due to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>VeChain network nodes being temporarily unavailable</li>
            <li>Your internet connection having issues</li>
            <li>A browser extension or firewall blocking connections</li>
            <li>The VeChain network experiencing high traffic</li>
          </ul>
        </div>
        
        <div className="flex flex-col gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
          <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">Suggestions:</h3>
          <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc pl-5">
            <li>Check the {getNetworkName()} status on a block explorer</li>
            <li>Verify your internet connection</li>
            <li>Try refreshing the page</li>
            <li>If using a wallet extension, check that it's properly configured</li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.open(getBlockExplorerUrl(), '_blank')}
          className="flex items-center gap-1"
        >
          <ExternalLink className="w-4 h-4" />
          Check Network Status
        </Button>
        
        <Button 
          variant="default" 
          size="sm" 
          onClick={isRetrying ? handleRetry : startRetryCountdown}
          disabled={isRetrying && countdown > 0}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? `Retry in ${countdown}s` : 'Retry Connection'}
        </Button>
      </CardFooter>
    </Card>
  );
}