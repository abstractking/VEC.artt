/**
 * VeWorld Mobile Connector
 * 
 * This specialized component provides a dedicated interface for connecting to 
 * VeWorld mobile wallet with enhanced mobile-specific error handling and guidance.
 */

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink, AlertTriangle, CheckCircle, Smartphone } from "lucide-react";

import { isVeWorldMobileApp, isIosDevice, isAndroidDevice, getVeWorldMobileInfo } from "@/lib/veworld-mobile-detect";
import { useVeChain } from "@/contexts/VeChainContext";
import { Network } from "@/lib/Network";

interface VeWorldMobileConnectorProps {
  onSuccess?: (address: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export default function VeWorldMobileConnector({
  onSuccess,
  onError,
  className = ""
}: VeWorldMobileConnectorProps) {
  const { toast } = useToast();
  const { connect, account, error: veChainError, networkType } = useVeChain();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  // Detect device information when component mounts
  useEffect(() => {
    const info = getVeWorldMobileInfo();
    setDeviceInfo(info);
    
    // If we're already in VeWorld mobile app, show success message
    if (info?.isVeWorldMobile) {
      toast({
        title: "VeWorld Mobile Detected",
        description: "You are already browsing from the VeWorld mobile app.",
      });
    }
  }, [toast]);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    setConnectionStatus('connecting');
    
    try {
      console.log("VeWorldMobileConnector: Attempting to connect to VeWorld mobile");
      await connect();
      
      // Success state
      setConnectionStatus('connected');
      setIsLoading(false);
      
      if (onSuccess && account) {
        onSuccess(account);
      }
    } catch (err) {
      console.error("VeWorldMobileConnector: Connection error", err);
      setConnectionStatus('error');
      setIsLoading(false);
      setError(err instanceof Error ? err.message : String(err));
      
      if (onError) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  };
  
  // Determine if we're running in VeWorld mobile app
  const isVeWorldMobile = deviceInfo?.isVeWorldMobile || false;
  
  // Platform-specific app store links
  const getAppStoreLink = () => {
    if (isIosDevice()) {
      return "https://apps.apple.com/us/app/veworld-mobile/id1572423395";
    } else if (isAndroidDevice()) {
      return "https://play.google.com/store/apps/details?id=com.vechain.wallet";
    }
    return "https://www.vechain.org/";
  };

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          VeWorld Mobile Connection
        </CardTitle>
        <CardDescription>
          Connect directly with the VeWorld mobile wallet app
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Device Detection Information */}
        {deviceInfo && (
          <div className="mb-4 text-sm">
            <p className="mb-2">
              <span className="font-medium">Platform:</span> {deviceInfo.platform}
            </p>
            <p className="mb-2">
              <span className="font-medium">Wallet Status:</span> {deviceInfo.isVeWorldMobile 
                ? <span className="text-green-600 dark:text-green-400 font-medium">VeWorld Mobile App</span>
                : <span className="text-yellow-600 dark:text-yellow-400">Standard Browser</span>
              }
            </p>
            <p className="mb-2">
              <span className="font-medium">Network:</span> {networkType === Network.MAIN 
                ? <span className="text-purple-600 dark:text-purple-400">MainNet</span>
                : <span className="text-blue-600 dark:text-blue-400">TestNet</span>
              }
            </p>
          </div>
        )}
        
        {/* Status Alerts */}
        {isVeWorldMobile && (
          <Alert variant="default" className="mb-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>VeWorld Mobile Detected</AlertTitle>
            <AlertDescription>
              You're already using the VeWorld mobile app. Simply click "Connect" to continue.
            </AlertDescription>
          </Alert>
        )}
        
        {!isVeWorldMobile && (
          <Alert variant="default" className="mb-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertTitle>VeWorld Mobile Not Detected</AlertTitle>
            <AlertDescription>
              Please open this page in the VeWorld mobile app browser for the best experience.
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Connection Status */}
        {connectionStatus === 'connected' && account && (
          <Alert variant="default" className="mb-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Connected Successfully</AlertTitle>
            <AlertDescription>
              Wallet address: {account.substring(0, 8)}...{account.substring(account.length - 6)}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col gap-4">
        {!isVeWorldMobile && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => window.open(getAppStoreLink(), '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Download VeWorld Mobile
          </Button>
        )}
        
        <Button
          className="w-full"
          onClick={handleConnect}
          disabled={isLoading || connectionStatus === 'connected'}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : connectionStatus === 'connected' ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Connected
            </>
          ) : (
            'Connect to VeWorld'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}