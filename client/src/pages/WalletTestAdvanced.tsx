/**
 * Advanced Wallet Testing Page
 * 
 * This page provides detailed diagnostic tools for testing wallet connections
 * across different environments with better error handling.
 */
import React, { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useVeChain } from '@/contexts/VeChainContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { InfoIcon, AlertTriangleIcon, CheckCircleIcon, XCircleIcon, RefreshCwIcon } from 'lucide-react';
import { Network } from '@/lib/Network';
import { connectVeWorld } from '@/lib/veworld-connector';
import { connectSmartWallet, isMobileDevice } from '@/lib/mobile-wallet-connector';

export default function WalletTestAdvanced() {
  const { walletAddress, isConnected, error, walletType, connectWallet, disconnectWallet } = useWallet();
  const vechain = useVeChain();
  
  // State for test results
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [selectedTest, setSelectedTest] = useState<string>('basic');
  const [testRunning, setTestRunning] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [errorDetails, setErrorDetails] = useState<string>('');
  
  // Run environment checks on mount
  useEffect(() => {
    checkEnvironment();
  }, []);
  
  // Check environment variables and settings
  const checkEnvironment = () => {
    try {
      // Get environment variables
      const envVars = {
        VITE_REACT_APP_VECHAIN_NETWORK: import.meta.env.VITE_REACT_APP_VECHAIN_NETWORK,
        VITE_VECHAIN_MAINNET_GENESIS_ID: import.meta.env.VITE_VECHAIN_MAINNET_GENESIS_ID,
        VITE_VECHAIN_TESTNET_GENESIS_ID: import.meta.env.VITE_VECHAIN_TESTNET_GENESIS_ID,
        VITE_DEPLOYMENT_ENV: import.meta.env.VITE_DEPLOYMENT_ENV,
      };
      
      // Get network information
      const networkType = envVars.VITE_REACT_APP_VECHAIN_NETWORK === 'main' ? Network.MAIN : Network.TEST;
      
      // Check for mobile device
      const mobile = isMobileDevice();
      
      // Set network info
      setNetworkInfo({
        envVars,
        networkType,
        isMobile: mobile,
        hasWebsocket: typeof WebSocket !== 'undefined',
        hasCrypto: typeof window.crypto !== 'undefined',
        userAgent: navigator.userAgent,
      });
      
      // Check available wallet objects
      const walletObjects = {
        hasConnex: typeof window.connex !== 'undefined',
        hasVechain: typeof (window as any).vechain !== 'undefined',
        hasVeWorld: typeof (window as any).vechain?.isVeWorld === 'boolean',
        hasThor: typeof (window as any).thor !== 'undefined',
      };
      
      setWalletInfo({
        ...walletObjects,
        availableGlobals: Object.keys(window).filter(key => 
          key.toLowerCase().includes('vechain') || 
          key.toLowerCase().includes('thor') || 
          key.toLowerCase() === 'connex'
        ),
      });
      
    } catch (error) {
      console.error('Error checking environment:', error);
      setErrorDetails(error instanceof Error ? error.message : String(error));
    }
  };
  
  // Run basic connection test
  const runBasicTest = async () => {
    setTestRunning(true);
    setTestResults({
      ...testResults,
      basic: { success: false, message: 'Running test...' }
    });
    
    try {
      const isConnected = vechain.connex && vechain.connex.thor && vechain.connex.thor.genesis;
      if (!isConnected) {
        throw new Error('No active VeChain connection');
      }
      
      const genesisId = vechain.connex.thor.genesis.id;
      const bestBlock = await vechain.connex.thor.status.head;
      
      setTestResults({
        ...testResults,
        basic: { 
          success: true, 
          message: `Connected to ${vechain.networkType} network. Genesis ID: ${genesisId.substring(0, 10)}... Best block: #${bestBlock.number}` 
        }
      });
    } catch (error) {
      console.error('Basic test error:', error);
      setTestResults({
        ...testResults,
        basic: { 
          success: false, 
          message: `Connection test failed: ${error instanceof Error ? error.message : String(error)}` 
        }
      });
    } finally {
      setTestRunning(false);
    }
  };
  
  // Run VeWorld specific test
  const runVeWorldTest = async () => {
    setTestRunning(true);
    setTestResults({
      ...testResults,
      veworld: { success: false, message: 'Running VeWorld test...' }
    });
    
    try {
      const networkType = import.meta.env.VITE_REACT_APP_VECHAIN_NETWORK === 'main' ? Network.MAIN : Network.TEST;
      
      // Use our specialized VeWorld connector
      const result = await connectVeWorld(networkType);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (!result.connex || !result.vendor) {
        throw new Error('VeWorld connection failed to return valid connex or vendor');
      }
      
      // Try to get genesis information
      const genesisId = result.connex.thor?.genesis?.id || 'Unknown';
      
      setTestResults({
        ...testResults,
        veworld: { 
          success: true, 
          message: `Successfully connected to VeWorld. Network: ${networkType}, Genesis ID: ${genesisId.substring(0, 10)}...` 
        }
      });
    } catch (error) {
      console.error('VeWorld test error:', error);
      setTestResults({
        ...testResults,
        veworld: { 
          success: false, 
          message: `VeWorld connection test failed: ${error instanceof Error ? error.message : String(error)}` 
        }
      });
    } finally {
      setTestRunning(false);
    }
  };
  
  // Run mobile-optimized connection test
  const runMobileTest = async () => {
    setTestRunning(true);
    setTestResults({
      ...testResults,
      mobile: { success: false, message: 'Running mobile connection test...' }
    });
    
    try {
      const networkType = import.meta.env.VITE_REACT_APP_VECHAIN_NETWORK === 'main' ? Network.MAIN : Network.TEST;
      
      // Use our mobile-optimized connector
      const result = await connectSmartWallet(networkType);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (!result.connex) {
        throw new Error('Mobile connection failed to return valid connex instance');
      }
      
      // Try to get basic information
      const genesisId = result.connex.thor?.genesis?.id || 'Unknown';
      
      setTestResults({
        ...testResults,
        mobile: { 
          success: true, 
          message: `Successfully connected using mobile connector. Address: ${result.address?.substring(0, 10)}..., Genesis ID: ${genesisId.substring(0, 10)}...` 
        }
      });
    } catch (error) {
      console.error('Mobile test error:', error);
      setTestResults({
        ...testResults,
        mobile: { 
          success: false, 
          message: `Mobile connection test failed: ${error instanceof Error ? error.message : String(error)}` 
        }
      });
    } finally {
      setTestRunning(false);
    }
  };
  
  // Run WalletContext connection test
  const runContextTest = async () => {
    setTestRunning(true);
    setTestResults({
      ...testResults,
      context: { success: false, message: 'Running WalletContext test...' }
    });
    
    try {
      // Disconnect first if already connected
      if (isConnected) {
        disconnectWallet();
      }
      
      // Attempt to connect using WalletContext
      await connectWallet();
      
      // Check if connection was successful
      if (!isConnected && !walletAddress) {
        throw new Error('Failed to connect via WalletContext');
      }
      
      setTestResults({
        ...testResults,
        context: { 
          success: true, 
          message: `Successfully connected via WalletContext. Wallet type: ${walletType}, Address: ${walletAddress?.substring(0, 10)}...` 
        }
      });
    } catch (error) {
      console.error('Context test error:', error);
      setTestResults({
        ...testResults,
        context: { 
          success: false, 
          message: `WalletContext connection test failed: ${error instanceof Error ? error.message : String(error)}` 
        }
      });
    } finally {
      setTestRunning(false);
    }
  };
  
  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Advanced Wallet Connection Testing</h1>
      
      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Environment Information</CardTitle>
            <CardDescription>Current environment settings and detected features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Network Configuration</h3>
                {networkInfo ? (
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                    {JSON.stringify(networkInfo, null, 2)}
                  </pre>
                ) : (
                  <p>Loading network information...</p>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Wallet Detection</h3>
                {walletInfo ? (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant={walletInfo.hasConnex ? "default" : "outline"}>
                        Connex {walletInfo.hasConnex ? "✓" : "✗"}
                      </Badge>
                      <Badge variant={walletInfo.hasVechain ? "default" : "outline"}>
                        VeChain {walletInfo.hasVechain ? "✓" : "✗"}
                      </Badge>
                      <Badge variant={walletInfo.hasVeWorld ? "default" : "outline"}>
                        VeWorld {walletInfo.hasVeWorld ? "✓" : "✗"}
                      </Badge>
                      <Badge variant={walletInfo.hasThor ? "default" : "outline"}>
                        Thor {walletInfo.hasThor ? "✓" : "✗"}
                      </Badge>
                    </div>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                      {JSON.stringify(walletInfo.availableGlobals, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p>Loading wallet information...</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={checkEnvironment} className="flex items-center gap-2">
              <RefreshCwIcon className="w-4 h-4" />
              Refresh Environment Info
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Connection Tests</CardTitle>
            <CardDescription>Run tests to verify wallet connections</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" value={selectedTest} onValueChange={setSelectedTest}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="veworld">VeWorld</TabsTrigger>
                <TabsTrigger value="mobile">Mobile</TabsTrigger>
                <TabsTrigger value="context">Context</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic">
                <div className="space-y-4">
                  <p>Tests basic VeChain connection using the existing Connex instance from VeChainContext.</p>
                  
                  {testResults.basic && (
                    <Alert variant={testResults.basic.success ? "default" : "destructive"}>
                      <div className="flex items-start gap-2">
                        {testResults.basic.success ? 
                          <CheckCircleIcon className="h-5 w-5 text-green-500" /> :
                          <XCircleIcon className="h-5 w-5 text-red-500" />
                        }
                        <div>
                          <AlertTitle>
                            {testResults.basic.success ? 'Connection Successful' : 'Connection Failed'}
                          </AlertTitle>
                          <AlertDescription>{testResults.basic.message}</AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  )}
                  
                  <Button onClick={runBasicTest} disabled={testRunning}>
                    {testRunning ? 'Testing...' : 'Run Basic Test'}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="veworld">
                <div className="space-y-4">
                  <p>Tests VeWorld wallet connection using our specialized connector.</p>
                  
                  {testResults.veworld && (
                    <Alert variant={testResults.veworld.success ? "default" : "destructive"}>
                      <div className="flex items-start gap-2">
                        {testResults.veworld.success ? 
                          <CheckCircleIcon className="h-5 w-5 text-green-500" /> :
                          <XCircleIcon className="h-5 w-5 text-red-500" />
                        }
                        <div>
                          <AlertTitle>
                            {testResults.veworld.success ? 'VeWorld Connection Successful' : 'VeWorld Connection Failed'}
                          </AlertTitle>
                          <AlertDescription>{testResults.veworld.message}</AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  )}
                  
                  <Button onClick={runVeWorldTest} disabled={testRunning}>
                    {testRunning ? 'Testing...' : 'Test VeWorld Connection'}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="mobile">
                <div className="space-y-4">
                  <p>Tests mobile-optimized wallet connection using our smart connector.</p>
                  
                  {testResults.mobile && (
                    <Alert variant={testResults.mobile.success ? "default" : "destructive"}>
                      <div className="flex items-start gap-2">
                        {testResults.mobile.success ? 
                          <CheckCircleIcon className="h-5 w-5 text-green-500" /> :
                          <XCircleIcon className="h-5 w-5 text-red-500" />
                        }
                        <div>
                          <AlertTitle>
                            {testResults.mobile.success ? 'Mobile Connection Successful' : 'Mobile Connection Failed'}
                          </AlertTitle>
                          <AlertDescription>{testResults.mobile.message}</AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  )}
                  
                  <Button onClick={runMobileTest} disabled={testRunning}>
                    {testRunning ? 'Testing...' : 'Test Mobile Connection'}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="context">
                <div className="space-y-4">
                  <p>Tests wallet connection using our WalletContext.</p>
                  
                  {testResults.context && (
                    <Alert variant={testResults.context.success ? "default" : "destructive"}>
                      <div className="flex items-start gap-2">
                        {testResults.context.success ? 
                          <CheckCircleIcon className="h-5 w-5 text-green-500" /> :
                          <XCircleIcon className="h-5 w-5 text-red-500" />
                        }
                        <div>
                          <AlertTitle>
                            {testResults.context.success ? 'Context Connection Successful' : 'Context Connection Failed'}
                          </AlertTitle>
                          <AlertDescription>{testResults.context.message}</AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  )}
                  
                  <Button onClick={runContextTest} disabled={testRunning}>
                    {testRunning ? 'Testing...' : 'Test WalletContext Connection'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Wallet Status</CardTitle>
            <CardDescription>Current wallet connection status from WalletContext</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <Badge variant={isConnected ? "default" : "secondary"}>
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>
                {walletType && (
                  <Badge variant="outline">{walletType}</Badge>
                )}
              </div>
              
              {walletAddress && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Wallet Address</h3>
                  <code className="bg-muted p-2 rounded-md text-sm block">{walletAddress}</code>
                </div>
              )}
              
              {error && (
                <Alert variant="destructive">
                  <AlertTriangleIcon className="h-4 w-4" />
                  <AlertTitle>Connection Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => connectWallet()} 
                  disabled={isConnected || testRunning}
                >
                  Connect Wallet
                </Button>
                <Button 
                  variant="outline" 
                  onClick={disconnectWallet} 
                  disabled={!isConnected || testRunning}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}