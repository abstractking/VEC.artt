import React from 'react';
import { getNetwork } from '@/lib/vechain';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InfoIcon, ExternalLink, Download, Key, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import FaucetLink from './FaucetLink';

/**
 * TestNetGuide component
 * 
 * Displays comprehensive instructions for setting up and using VeChain TestNet
 * Only shown on Netlify deployments when TestNet is the selected network
 */
export default function TestNetGuide() {
  const networkConfig = getNetwork();
  const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');
  
  // Only show guide on Netlify deployment for TestNet
  if (!isNetlify || networkConfig.name !== 'TestNet') {
    return null;
  }
  
  return (
    <Card className="w-full mb-8 border-blue-200 bg-blue-50/50 dark:bg-blue-950/30 dark:border-blue-900">
      <CardHeader>
        <div className="flex items-center gap-2">
          <InfoIcon className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-xl text-blue-700 dark:text-blue-300">
            VeChain TestNet Guide
          </CardTitle>
        </div>
        <CardDescription className="text-blue-600 dark:text-blue-400">
          This deployment runs on VeChain TestNet. Follow these steps to interact with the platform.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-blue-700 dark:text-blue-300 flex items-center mb-2">
              <Download className="h-4 w-4 mr-2" />
              Step 1: Install a compatible wallet
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
              You'll need a VeChain-compatible wallet to interact with the application:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                variant="outline"
                size="sm"
                className="justify-start border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300"
                onClick={() => window.open('https://sync.vecha.in/', '_blank')}
              >
                <img src="https://sync.vecha.in/favicon.png" alt="VeChain Sync2" className="h-4 w-4 mr-2" />
                Sync2 Web Wallet
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="justify-start border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300"
                onClick={() => window.open('https://chrome.google.com/webstore/detail/vechain-thor-wallet/lnlcmgajjnlhbenjkompccdnpopdeici', '_blank')}
              >
                <img src="https://cdn.worldvectorlogo.com/logos/vechain-1.svg" alt="VeChain Thor" className="h-4 w-4 mr-2" />
                VeChain Thor Extension
              </Button>
            </div>
          </div>
          
          <Separator className="bg-blue-200 dark:bg-blue-800" />
          
          <div>
            <h3 className="font-medium text-blue-700 dark:text-blue-300 flex items-center mb-2">
              <Key className="h-4 w-4 mr-2" />
              Step 2: Configure for TestNet
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
              Your wallet must be configured to use the TestNet network:
            </p>
            <ul className="list-disc ml-5 space-y-1 text-sm text-blue-600 dark:text-blue-400">
              <li>In Sync2, open the settings menu and select "Network"</li>
              <li>Choose "TestNet" from the network dropdown</li>
              <li>In Thor Wallet, click the network name in the top-right and select "Test"</li>
            </ul>
          </div>
          
          <Separator className="bg-blue-200 dark:bg-blue-800" />
          
          <div>
            <h3 className="font-medium text-blue-700 dark:text-blue-300 flex items-center mb-2">
              <Wallet className="h-4 w-4 mr-2" />
              Step 3: Get TestNet tokens
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
              You'll need test tokens (which have no real value) to perform transactions:
            </p>
            <div className="mt-2">
              <Button 
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => window.open('https://faucet.vecha.in/', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Get Free Test Tokens
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col items-start gap-2">
        <p className="text-xs text-blue-500 dark:text-blue-400">
          <strong>Note:</strong> TestNet is a sandbox environment for development and testing. 
          Transactions don't require real cryptocurrency and have no monetary value.
        </p>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="link" 
            size="sm"
            className="text-blue-600 h-auto p-0"
            onClick={() => window.open('https://docs.vechain.org/thor/learn/network.html', '_blank')}
          >
            VeChain Networks
          </Button>
          <span className="text-blue-400">•</span>
          <Button 
            variant="link" 
            size="sm"
            className="text-blue-600 h-auto p-0"
            onClick={() => window.open('https://docs.vechain.org/thor/get-started/connex.html', '_blank')}
          >
            Wallet Connection
          </Button>
          <span className="text-blue-400">•</span>
          <Button 
            variant="link" 
            size="sm"
            className="text-blue-600 h-auto p-0"
            onClick={() => window.open('https://explore-testnet.vechain.org/', '_blank')}
          >
            TestNet Explorer
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}