import React from 'react';
import { getNetwork } from '@/lib/vechain';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import { InfoIcon, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NetworkInstructions() {
  const networkConfig = getNetwork();
  const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');
  
  // Only show instructions on Netlify deployment for TestNet
  if (!isNetlify || networkConfig.name !== 'TestNet') {
    return null;
  }
  
  return (
    <Alert className="mb-6 border-blue-400 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
      <InfoIcon className="h-5 w-5 text-blue-500" />
      <AlertTitle className="text-blue-700 dark:text-blue-300 font-medium mb-2">
        VeChain TestNet Required
      </AlertTitle>
      <AlertDescription className="text-blue-600 dark:text-blue-400">
        <p className="mb-3">
          This deployment requires a VeChain wallet configured for TestNet:
        </p>
        <ol className="list-decimal ml-5 space-y-2 mb-4">
          <li>Install <a href="https://sync.vecha.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-300 font-medium underline">VeChain Sync2</a> or <a href="https://chrome.google.com/webstore/detail/vechain-thor-wallet/lnlcmgajjnlhbenjkompccdnpopdeici" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-300 font-medium underline">VeChain Thor Wallet</a> extension</li>
          <li>Configure your wallet to use <strong>TestNet</strong></li>
          <li>Get test tokens from the <a href="https://faucet.vecha.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-300 font-medium underline">VeChain TestNet Faucet</a></li>
        </ol>
        <div className="flex space-x-4">
          <Button 
            size="sm" 
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-100 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900"
            onClick={() => window.open('https://docs.vechain.org/thor/get-started/connex.html', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Learn More
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-100 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900"
            onClick={() => window.open('https://faucet.vecha.in/', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Get TestNet Tokens
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}