import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NETWORKS as NETWORK_DESCRIPTORS, Network } from '@/lib/Network';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check, RefreshCw, Bug, HelpCircle, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

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
  const [browserInfo, setBrowserInfo] = useState<any>(null);
  const [extensionDetails, setExtensionDetails] = useState<any>({});
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const { toast } = useToast();
  
  const detectBrowser = () => {
    if (typeof window === 'undefined') return null;
    
    const userAgent = navigator.userAgent;
    let browserName = "Unknown";
    let browserVersion = "Unknown";
    
    // Detect Chrome
    if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Edg") === -1) {
      browserName = "Chrome";
      const chromeVersion = userAgent.match(/Chrome\/(\d+\.\d+)/);
      browserVersion = chromeVersion ? chromeVersion[1] : "Unknown";
    } 
    // Detect Edge
    else if (userAgent.indexOf("Edg") > -1) {
      browserName = "Edge";
      const edgeVersion = userAgent.match(/Edg\/(\d+\.\d+)/);
      browserVersion = edgeVersion ? edgeVersion[1] : "Unknown";
    }
    // Detect Firefox
    else if (userAgent.indexOf("Firefox") > -1) {
      browserName = "Firefox";
      const firefoxVersion = userAgent.match(/Firefox\/(\d+\.\d+)/);
      browserVersion = firefoxVersion ? firefoxVersion[1] : "Unknown";
    }
    // Detect Safari
    else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
      browserName = "Safari";
      const safariVersion = userAgent.match(/Safari\/(\d+\.\d+)/);
      browserVersion = safariVersion ? safariVersion[1] : "Unknown";
    }
    
    return {
      name: browserName,
      version: browserVersion,
      userAgent: userAgent,
      platform: navigator.platform,
      isCompatible: ['Chrome', 'Edge'].includes(browserName)
    };
  };
  
  const checkWalletExtensions = async () => {
    setIsChecking(true);
    const details: Record<string, any> = {};
    let hasVeWorld = false;
    let hasThor = false;
    
    // List of known wallet provider keys (these may be registered by different wallet extensions)
    const walletProviderKeys = ['veworld', 'vechain', 'sync', 'sync2', 'thor', 'thorify'];
    
    try {
      // Check VeWorld through official method
      if (typeof window !== 'undefined' && (window as any).vechain) {
        try {
          const vechain = (window as any).vechain;
          
          console.log("Found vechain object, methods:", Object.keys(vechain));
          
          // Check if it's explicitly VeWorld
          if (vechain.isVeWorld) {
            hasVeWorld = true;
            details['veworld'] = {
              available: true,
              version: 'Unknown', // VeWorld doesn't expose version info directly
              methods: Object.keys(vechain).join(', '),
              connectionMethods: getConnectionMethods(vechain),
              supportsTestNet: true,
              isConnected: false
            };
          } else {
            // It's a VeChain provider but not explicitly VeWorld
            details['veworld'] = {
              available: false,
              error: 'vechain object exists but isVeWorld is falsy',
              methods: Object.keys(vechain).join(', '),
              connectionMethods: getConnectionMethods(vechain),
            };
          }
        } catch (e) {
          console.error("Error checking VeWorld details:", e);
          details['veworld'] = {
            available: false,
            error: e instanceof Error ? e.message : String(e)
          };
        }
      } else {
        details['veworld'] = {
          available: false,
          error: 'vechain object not found in window'
        };
      }
      
      // Check Thor wallet
      if (typeof window !== 'undefined' && (window as any).thor) {
        hasThor = true;
        try {
          const thor = (window as any).thor;
          details['thor'] = {
            available: true,
            version: 'Unknown', // Thor doesn't expose version info directly
            methods: typeof thor === 'object' ? Object.keys(thor).join(', ') : 'Not an object',
            connectionMethods: getConnectionMethods(thor),
            supportsTestNet: true,
            isConnected: false
          };
        } catch (e) {
          console.error("Error checking Thor details:", e);
          details['thor'] = {
            available: false,
            error: e instanceof Error ? e.message : String(e)
          };
        }
      } else {
        details['thor'] = {
          available: false,
          error: 'thor object not found in window'
        };
      }
      
      // Check all possible wallet providers that aren't covered above
      for (const key of walletProviderKeys) {
        if (key === 'vechain' || key === 'thor') continue; // Skip those we already checked
        
        if (typeof window !== 'undefined' && (window as any)[key]) {
          try {
            const provider = (window as any)[key];
            
            // Check if this is a valid provider with expected methods
            details[key] = {
              available: true,
              methods: typeof provider === 'object' ? Object.keys(provider).join(', ') : 'Not an object',
              connectionMethods: getConnectionMethods(provider),
              supportsTestNet: 'Unknown',
              rawProvider: String(provider)
            };
            
            // Special handling for known providers
            if (key === 'sync' || key === 'sync2') {
              console.log(`Found ${key} wallet provider`);
              // Mark as having some wallet available
              if (!hasVeWorld && !hasThor) {
                // Only set Thor as true if we don't already have one detected
                hasThor = true;
              }
            }
          } catch (e) {
            console.error(`Error checking ${key} details:`, e);
            details[key] = {
              available: false,
              error: e instanceof Error ? e.message : String(e)
            };
          }
        }
      }
    } catch (e) {
      console.error("Error during wallet detection:", e);
    } finally {
      setVeWorldAvailable(hasVeWorld);
      setThorAvailable(hasThor);
      setExtensionDetails(details);
      setIsChecking(false);
      setBrowserInfo(detectBrowser());
    }
  };
  
  // Helper to check what connection methods a provider supports
  const getConnectionMethods = (provider: any): string[] => {
    if (!provider || typeof provider !== 'object') return [];
    
    const methodsToCheck = ['enable', 'createProvider', 'getProvider', 'getVendor', 'connect', 'newConnex', 'newConnexVendor'];
    
    return methodsToCheck.filter(method => 
      typeof provider[method] === 'function'
    );
  };
  
  useEffect(() => {
    checkWalletExtensions();
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
      
      let connex = null;
      let vendor = null;
      let successMethod = "";
      
      // First try with the complete network object format
      try {
        // Create connexOptions
        const connexOptions = {
          node: 'https://testnet.vechain.org/', // Adding trailing slash for VeWorld compatibility
          network: networkDescriptor
        };
        
        console.log("Trying network object format:", connexOptions);
        connex = await vechain.newConnex(connexOptions);
        
        // Create a vendor
        const vendorOptions = {
          network: networkDescriptor
        };
        
        console.log("Creating vendor with network object:", vendorOptions);
        vendor = await vechain.newConnexVendor(vendorOptions);
        
        successMethod = "network object format";
      } catch (error) {
        const methodError = error as Error;
        console.log("Network object format failed:", methodError.message);
        
        // If that fails, try with the genesis parameter approach
        try {
          console.log("Trying genesis parameter approach...");
          
          const connexOptions = {
            node: 'https://testnet.vechain.org/', // Adding trailing slash for VeWorld compatibility
            genesis: networkDescriptor.id
          };
          
          connex = await vechain.newConnex(connexOptions);
          
          const vendorOptions = {
            genesis: networkDescriptor.id
          };
          
          vendor = await vechain.newConnexVendor(vendorOptions);
          
          successMethod = "genesis parameter";
        } catch (error) {
          const altMethodError = error as Error;
          console.error("Alternative method also failed:", altMethodError.message);
          throw new Error(`Both connection methods failed:\n1. ${methodError.message}\n2. ${altMethodError.message}`);
        }
      }
      
      if (!connex || !vendor) {
        throw new Error("Failed to initialize Connex or Vendor");
      }
      
      setConnectionDetails({
        connex: connex ? "Connected" : "Failed",
        vendor: vendor ? "Connected" : "Failed",
        networkDescriptor,
        successMethod,
        walletType: "VeWorld"
      });
      
      toast({
        title: "Connected Successfully",
        description: `Wallet connected using ${successMethod} approach`,
        duration: 3000
      });
    } catch (error: any) {
      console.error("VeWorld connection failed:", error);
      setConnectionError(error.message || "Unknown error connecting to VeWorld");
      setActiveWallet(null);
      
      toast({
        title: "Connection Failed",
        description: error.message || "Unknown error connecting to VeWorld",
        variant: "destructive",
        duration: 5000
      });
    }
  };
  
  const connectToThor = async () => {
    try {
      setConnectionError(null);
      setActiveWallet('thor');
      
      if (typeof window === 'undefined' || !(window as any).thor) {
        throw new Error("Thor wallet not available");
      }
      
      console.log("Connecting to Thor wallet...");
      const vendor = await (window as any).thor.enable();
      
      if (!vendor) {
        throw new Error("Failed to enable Thor wallet");
      }
      
      console.log("Thor wallet connected successfully:", vendor);
      
      setConnectionDetails({
        vendor: vendor ? "Connected" : "Failed",
        walletType: "Thor",
        address: vendor.address || "Unknown"
      });
      
      toast({
        title: "Thor Wallet Connected",
        description: `Successfully connected to Thor wallet`,
        duration: 3000
      });
    } catch (error: any) {
      console.error("Thor connection failed:", error);
      setConnectionError(error.message || "Unknown error connecting to Thor wallet");
      setActiveWallet(null);
      
      toast({
        title: "Connection Failed",
        description: error.message || "Unknown error connecting to Thor wallet",
        variant: "destructive",
        duration: 5000
      });
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
        {/* Browser information section */}
        <div className="mb-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
          <h3 className="text-md font-medium mb-2 flex items-center">
            <HelpCircle className="h-4 w-4 mr-2" />
            Browser Environment
          </h3>
          
          {browserInfo && (
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><strong>Browser:</strong> {browserInfo.name}</div>
                <div><strong>Version:</strong> {browserInfo.version}</div>
                <div><strong>Platform:</strong> {browserInfo.platform}</div>
                <div>
                  <strong>Compatible:</strong> {' '}
                  {browserInfo.isCompatible ? 
                    <span className="text-green-600">Yes</span> : 
                    <span className="text-red-600">No</span>
                  }
                </div>
              </div>
              {!browserInfo.isCompatible && (
                <div className="text-yellow-600 dark:text-yellow-400 mt-2 font-medium flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  VeChain wallets are best supported in Chrome and Edge browsers.
                </div>
              )}
            </div>
          )}
          
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkWalletExtensions} 
              disabled={isChecking}
              className="text-xs"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh Detection
                </>
              )}
            </Button>
          </div>
        </div>
        
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
      
      <CardFooter className="flex-col space-y-4 border-t p-4">
        <div className="w-full">
          <h3 className="text-md font-medium mb-2 flex items-center">
            <Bug className="h-4 w-4 mr-2" />
            Detected Providers
          </h3>
          
          <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-900 text-xs overflow-auto max-h-64">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(extensionDetails, null, 2)}
            </pre>
            <div className="mt-2 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-6"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(extensionDetails, null, 2));
                  toast({
                    title: "Copied to clipboard",
                    description: "Provider details copied for debugging",
                    duration: 3000
                  });
                }}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 pt-2 border-t">
          This diagnostic information can help troubleshoot wallet detection issues
        </div>
      </CardFooter>
    </Card>
  );
}