import React from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import WalletDebugger from '@/components/WalletDebugger';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NETWORKS as NETWORK_DESCRIPTORS, Network } from '@/lib/Network';
import { NETWORKS } from '@/lib/vechain';

/**
 * Wallet Test page for troubleshooting VeChain wallet connections
 */
export default function WalletTest() {
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