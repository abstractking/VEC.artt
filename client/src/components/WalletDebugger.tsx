import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NETWORKS as NETWORK_DESCRIPTORS, Network } from '@/lib/Network';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check } from 'lucide-react';

/**
 * Wallet Debugger Component for troubleshooting VeChain wallet connections
 * This component displays detailed information about network configuration and wallet connection
 */
export default function WalletDebugger() {
  const [veWorldAvailable, setVeWorldAvailable] = useState<boolean>(false);
  const [thorAvailable, setThorAvailable] = useState<boolean>(false);
  const [activeWallet, setActiveWallet] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionDetails, setConnectionDetails] = useState<any>(null);
  
  useEffect(() => {
    // Check if VeWorld wallet is available
    if (typeof window !== 'undefined' && (window as any).vechain) {
      try {
        const vechain = (window as any).vechain;
        if (vechain.isVeWorld) {
          setVeWorldAvailable(true);
        }
      } catch (e) {
        console.error("Error checking VeWorld availability:", e);
      }
    }
    
    // Check if Thor wallet is available
    if (typeof window !== 'undefined' && (window as any).thor) {
      setThorAvailable(true);
    }
  }, []);
  
  const connectToVeWorld = async () => {
    try {
      setConnectionError(null);
      setActiveWallet('veworld');
      
      if (typeof window === 'undefined' || !(window as any).vechain) {
        throw new Error("VeWorld wallet not available");
      }
      
      const vechain = (window as any).vechain;
      
      if (!vechain.isVeWorld) {
        throw new Error("Not a valid VeWorld wallet extension");
      }
      
      // Log available methods
      console.log("VeWorld API methods:", Object.keys(vechain));
      
      // Test network configuration for TestNet
      const networkDescriptor = NETWORK_DESCRIPTORS[Network.TEST];
      
      // Create connexOptions
      const connexOptions = {
        node: 'https://testnet.veblocks.net',
        network: networkDescriptor
      };
      
      console.log("Connecting with network options:", connexOptions);
      const connex = await vechain.newConnex(connexOptions);
      
      // Create a vendor
      const vendorOptions = {
        network: networkDescriptor
      };
      
      console.log("Creating vendor with options:", vendorOptions);
      const vendor = await vechain.newConnexVendor(vendorOptions);
      
      setConnectionDetails({
        connex: connex ? "Connected" : "Failed",
        vendor: vendor ? "Connected" : "Failed",
        networkDescriptor,
        walletType: "VeWorld"
      });
    } catch (error: any) {
      console.error("VeWorld connection failed:", error);
      setConnectionError(error.message || "Unknown error connecting to VeWorld");
      setActiveWallet(null);
    }
  };
  
  const connectToThor = async () => {
    try {
      setConnectionError(null);
      setActiveWallet('thor');
      
      if (typeof window === 'undefined' || !(window as any).thor) {
        throw new Error("Thor wallet not available");
      }
      
      const vendor = await (window as any).thor.enable();
      
      if (!vendor) {
        throw new Error("Failed to enable Thor wallet");
      }
      
      setConnectionDetails({
        vendor: vendor ? "Connected" : "Failed",
        walletType: "Thor"
      });
    } catch (error: any) {
      console.error("Thor connection failed:", error);
      setConnectionError(error.message || "Unknown error connecting to Thor wallet");
      setActiveWallet(null);
    }
  };
  
  const checkWalletReady = (walletType: string) => {
    if (walletType === 'veworld') {
      return veWorldAvailable;
    } else if (walletType === 'thor') {
      return thorAvailable;
    }
    return false;
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Wallet Connection Debugger</CardTitle>
        <CardDescription>
          Test VeChain wallet connections with proper network configuration
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="veworld">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="veworld" disabled={!veWorldAvailable}>
              VeWorld Wallet
              {veWorldAvailable ? 
                <Badge variant="outline" className="ml-2 bg-green-600 text-white"><Check className="h-3 w-3 mr-1" /> Available</Badge> : 
                <Badge variant="destructive" className="ml-2"><AlertTriangle className="h-3 w-3 mr-1" /> Not Detected</Badge>
              }
            </TabsTrigger>
            <TabsTrigger value="thor" disabled={!thorAvailable}>
              VeChainThor Wallet
              {thorAvailable ? 
                <Badge variant="outline" className="ml-2 bg-green-600 text-white"><Check className="h-3 w-3 mr-1" /> Available</Badge> : 
                <Badge variant="destructive" className="ml-2"><AlertTriangle className="h-3 w-3 mr-1" /> Not Detected</Badge>
              }
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <TabsContent value="veworld">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">VeWorld Wallet Connection</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Connect to VeWorld wallet with proper TestNet network configuration
                  </p>
                </div>
                
                <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
                  <h4 className="font-medium mb-2">TestNet Network Configuration</h4>
                  <pre className="text-xs overflow-auto bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    {JSON.stringify(
                      {
                        id: NETWORK_DESCRIPTORS[Network.TEST].id,
                        name: NETWORK_DESCRIPTORS[Network.TEST].name
                      }, 
                      null, 
                      2
                    )}
                  </pre>
                </div>
                
                {connectionError && (
                  <div className="p-4 border border-red-300 rounded-md bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                    <h4 className="font-medium flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Connection Error
                    </h4>
                    <p className="text-sm mt-1">{connectionError}</p>
                  </div>
                )}
                
                {connectionDetails && activeWallet === 'veworld' && (
                  <div className="p-4 border border-green-300 rounded-md bg-green-50 dark:bg-green-900/20">
                    <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      Connection Successful
                    </h4>
                    <Separator className="my-2" />
                    <div className="text-sm space-y-2">
                      <div><strong>Connex:</strong> {connectionDetails.connex}</div>
                      <div><strong>Vendor:</strong> {connectionDetails.vendor}</div>
                      <div><strong>Network:</strong> {connectionDetails.networkDescriptor?.name}</div>
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={connectToVeWorld} 
                  disabled={!veWorldAvailable || activeWallet === 'veworld'}
                  className="w-full"
                >
                  Connect to VeWorld
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="thor">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">VeChainThor Wallet Connection</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Connect to VeChainThor wallet extension
                  </p>
                </div>
                
                {connectionError && activeWallet === 'thor' && (
                  <div className="p-4 border border-red-300 rounded-md bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                    <h4 className="font-medium flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Connection Error
                    </h4>
                    <p className="text-sm mt-1">{connectionError}</p>
                  </div>
                )}
                
                {connectionDetails && activeWallet === 'thor' && (
                  <div className="p-4 border border-green-300 rounded-md bg-green-50 dark:bg-green-900/20">
                    <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      Connection Successful
                    </h4>
                    <Separator className="my-2" />
                    <div className="text-sm">
                      <div><strong>Vendor:</strong> {connectionDetails.vendor}</div>
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={connectToThor} 
                  disabled={!thorAvailable || activeWallet === 'thor'}
                  className="w-full"
                >
                  Connect to Thor
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-xs text-gray-500">
          Testing VeChain wallet connections with proper network configuration
        </div>
      </CardFooter>
    </Card>
  );
}