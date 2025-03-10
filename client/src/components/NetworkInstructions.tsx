import React, { useState } from 'react';
import { getNetwork } from '@/lib/vechain';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import { 
  InfoIcon, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Chrome, 
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function NetworkInstructions() {
  const networkConfig = getNetwork();
  const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');
  const [isExpanded, setIsExpanded] = useState(false);
  
  // For testing purposes, let's show this in development too
  // Regular condition: Only show instructions on Netlify deployment for TestNet
  const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
  const showForTesting = isDev; // Show in development for testing
  
  if ((!isNetlify && !showForTesting) || networkConfig.name !== 'TestNet') {
    return null;
  }
  
  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className="mb-6 border border-blue-400 rounded-lg bg-blue-50 dark:bg-blue-950 dark:border-blue-800 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start">
          <InfoIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="ml-2 flex-grow">
            <div className="flex items-center justify-between">
              <h3 className="text-blue-700 dark:text-blue-300 font-medium">
                VeChain TestNet Required
              </h3>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 h-auto">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-blue-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-blue-500" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
              This deployment requires a VeChain wallet configured for TestNet. Click for detailed setup instructions.
            </p>
          </div>
        </div>
      </div>
      
      <CollapsibleContent>
        <div className="px-4 pb-4">
          <Tabs defaultValue="extension">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="extension" className="flex items-center gap-2">
                <Chrome className="h-4 w-4" />
                Browser Extensions
              </TabsTrigger>
              <TabsTrigger value="desktop" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Desktop Applications
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="extension" className="text-blue-600 dark:text-blue-400 text-sm space-y-4">
              <div>
                <h4 className="font-medium mb-2">VeWorld Browser Extension</h4>
                <ol className="list-decimal ml-5 space-y-2">
                  <li>Install the <a href="https://veworld.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-300 font-medium underline">VeWorld browser extension</a></li>
                  <li>Open the extension and create or import a wallet</li>
                  <li>Click on the network dropdown in the top right (it might say "Main")</li>
                  <li>Select "Test" network from the dropdown</li>
                  <li>Get free test tokens from the <a href="https://faucet.vecha.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-300 font-medium underline">VeChain TestNet Faucet</a></li>
                  <li><strong>Important:</strong> When the connection prompt appears, make sure to approve it to allow this application to connect to your wallet</li>
                  <li>VeWorld uses different connection methods from other wallets. If you experience any issues, please ensure you have the latest version of the extension installed</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">VeChainThor Wallet Extension</h4>
                <ol className="list-decimal ml-5 space-y-2">
                  <li>Install the <a href="https://chrome.google.com/webstore/detail/vechain-thor-wallet/lnlcmgajjnlhbenjkompccdnpopdeici" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-300 font-medium underline">VeChainThor Wallet extension</a></li>
                  <li>Open the extension and create or import a wallet</li>
                  <li>Click on the settings gear icon in the top right</li>
                  <li>Select "Network" and choose "TestNet"</li>
                  <li>Get free test tokens from the <a href="https://faucet.vecha.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-300 font-medium underline">VeChain TestNet Faucet</a></li>
                </ol>
              </div>
            </TabsContent>
            
            <TabsContent value="desktop" className="text-blue-600 dark:text-blue-400 text-sm space-y-4">
              <div>
                <h4 className="font-medium mb-2">Sync2 Desktop Application</h4>
                <ol className="list-decimal ml-5 space-y-2">
                  <li>Download and install <a href="https://sync2.vecha.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-300 font-medium underline">Sync2 desktop application</a></li>
                  <li>Open the application and create or import a wallet</li>
                  <li>Click on the settings icon (gear)</li>
                  <li>Select "Network" and choose "TestNet"</li>
                  <li>Get free test tokens from the <a href="https://faucet.vecha.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-300 font-medium underline">VeChain TestNet Faucet</a></li>
                  <li>When connecting, allow the connection in the pop-up window from Sync2</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Original Sync Application</h4>
                <ol className="list-decimal ml-5 space-y-2">
                  <li>Download and install <a href="https://sync.vecha.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-300 font-medium underline">Sync desktop application</a></li>
                  <li>Open the application and create or import a wallet</li>
                  <li>Click on the settings tab</li>
                  <li>Under "Node URL", select "TestNet"</li>
                  <li>Get free test tokens from the <a href="https://faucet.vecha.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-300 font-medium underline">VeChain TestNet Faucet</a></li>
                  <li>Note: Sync requires manual connection through its browser</li>
                </ol>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex space-x-4 mt-4">
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
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}