import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import WalletDebugger from '@/components/WalletDebugger';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, RefreshCw, Bug, HelpCircle, ArrowRight } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { NETWORKS as NETWORK_DESCRIPTORS, Network } from '@/lib/Network';
import { NETWORKS } from '@/lib/vechain';

/**
 * Wallet Test page for troubleshooting VeChain wallet connections
 */
export default function WalletTest() {
  const [proxyTestResult, setProxyTestResult] = useState<any>(null);
  const [isTestingProxy, setIsTestingProxy] = useState(false);
  const [genesisId, setGenesisId] = useState<string | null>(null);
  const { toast } = useToast();

  // Function to test server-side proxy
  const testServerProxy = async () => {
    setIsTestingProxy(true);
    setProxyTestResult(null);
    
    try {
      // Test getting the genesis ID from our proxy
      const response = await fetch('/api/vechain/genesis-id?network=test');
      const data = await response.json();
      
      setProxyTestResult({
        status: 'success',
        data,
        timestamp: new Date().toLocaleTimeString()
      });
      
      setGenesisId(data.genesisId);
      
      toast({
        title: "Proxy Test Successful",
        description: "Successfully connected to VeChain TestNet via server proxy",
        duration: 3000
      });
    } catch (error: any) {
      console.error("Proxy test failed:", error);
      
      setProxyTestResult({
        status: 'error',
        error: error.message || 'Unknown error',
        timestamp: new Date().toLocaleTimeString()
      });
      
      toast({
        title: "Proxy Test Failed",
        description: error.message || "Failed to connect to VeChain TestNet via server proxy",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsTestingProxy(false);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Wallet Connection Test | VeCollab</title>
      </Helmet>
      
      <div className="container mx-auto py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">VeChain Wallet Connection Test</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          This page provides tools to test and verify VeChain wallet connections with proper network configurations.
        </p>
        
        <Tabs defaultValue="debugger">
          <TabsList className="mb-6">
            <TabsTrigger value="debugger">Connection Debugger</TabsTrigger>
            <TabsTrigger value="config">Network Configuration</TabsTrigger>
            <TabsTrigger value="proxy">Server Proxy Test</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="debugger">
            <WalletDebugger />
          </TabsContent>
          
          <TabsContent value="config">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Network Descriptors (Official Format)</CardTitle>
                  <CardDescription>
                    These descriptors match the exact format required by VeWorld wallet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Badge className="mb-2">MainNet</Badge>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto">
                        {JSON.stringify(NETWORK_DESCRIPTORS[Network.MAIN], null, 2)}
                      </pre>
                    </div>
                    <div>
                      <Badge className="mb-2">TestNet</Badge>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto">
                        {JSON.stringify(NETWORK_DESCRIPTORS[Network.TEST], null, 2)}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Network Configurations (Internal)</CardTitle>
                  <CardDescription>
                    These are our internal network configurations with endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Badge className="mb-2">MainNet</Badge>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto">
                        {JSON.stringify(NETWORKS.main, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <Badge className="mb-2">TestNet</Badge>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto">
                        {JSON.stringify(NETWORKS.test, null, 2)}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="proxy">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Server-Side Proxy Test</CardTitle>
                <CardDescription>
                  Test our server-side proxy for VeChain node connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col items-center justify-center p-6 border rounded-md">
                    <p className="mb-4 text-center">
                      This test verifies if our server-side proxy can successfully connect to VeChain TestNet
                      and fetch the genesis ID. This helps diagnose CORS and connection issues.
                    </p>
                    
                    <Button 
                      onClick={testServerProxy} 
                      disabled={isTestingProxy} 
                      className="mb-4"
                    >
                      {isTestingProxy ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Testing Connection...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Test VeChain Proxy Connection
                        </>
                      )}
                    </Button>
                    
                    {proxyTestResult && (
                      <div className={`w-full p-4 rounded-md mt-4 ${
                        proxyTestResult.status === 'success' 
                          ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                          : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
                      }`}>
                        <div className="flex items-center mb-2">
                          {proxyTestResult.status === 'success' ? (
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                          )}
                          <h3 className={`font-medium ${
                            proxyTestResult.status === 'success' 
                              ? 'text-green-700 dark:text-green-300' 
                              : 'text-red-700 dark:text-red-300'
                          }`}>
                            {proxyTestResult.status === 'success' 
                              ? 'Proxy Connection Successful' 
                              : 'Proxy Connection Failed'}
                          </h3>
                        </div>
                        
                        <div className="text-sm">
                          <p className="mb-1">Timestamp: {proxyTestResult.timestamp}</p>
                          
                          {proxyTestResult.status === 'success' ? (
                            <div className="mt-2">
                              <p className="font-semibold">Genesis ID:</p>
                              <p className="font-mono text-xs break-all bg-black/5 dark:bg-white/5 p-2 rounded">
                                {genesisId || 'undefined'}
                              </p>
                              <p className="mt-2 font-semibold">Network:</p>
                              <p className="font-mono">
                                {proxyTestResult.data?.network || 'undefined'}
                              </p>
                            </div>
                          ) : (
                            <div className="mt-2 text-red-700 dark:text-red-300">
                              <p className="font-semibold">Error:</p>
                              <p className="font-mono text-xs break-all bg-black/5 dark:bg-white/5 p-2 rounded">
                                {proxyTestResult.error}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-gray-500">
                  The server-side proxy helps solve CORS issues when connecting to VeChain nodes.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About VeChain Wallet Connections</CardTitle>
                <CardDescription>
                  Understanding VeChain wallet connections and network configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  VeChain has multiple wallet options, each with its own connection method:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 border rounded">
                    <h3 className="text-lg font-medium mb-2">VeWorld Wallet</h3>
                    <p className="text-sm">
                      The newest official VeChain wallet extension requires specific network descriptors
                      for proper connection. It injects a <code>window.vechain</code> object with methods
                      like <code>newConnex()</code> and <code>newConnexVendor()</code>.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded">
                    <h3 className="text-lg font-medium mb-2">VeChainThor Wallet</h3>
                    <p className="text-sm">
                      The original VeChain browser extension injects a <code>window.thor</code> object
                      with an <code>enable()</code> method for connection. It uses a simpler connection
                      pattern.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded">
                    <h3 className="text-lg font-medium mb-2">Sync2</h3>
                    <p className="text-sm">
                      The desktop application for VeChain that provides enhanced security features.
                      It requires special handling for connection.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded">
                    <h3 className="text-lg font-medium mb-2">TestNet Requirements</h3>
                    <p className="text-sm">
                      When connecting to TestNet, the wallet must be configured for TestNet mode,
                      and the network descriptor must exactly match the expected format.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-gray-500">
                  For more information, visit the official 
                  <a href="https://docs.vechain.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 ml-1">
                    VeChain Documentation
                  </a>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}