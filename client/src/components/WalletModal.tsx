import { useState, useEffect } from "react";
import { AlertCircle, X, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWallet } from "@/hooks/useVechain";

export default function WalletModal() {
  const { isConnecting, isModalOpen, setModalOpen, connectWallet, error, useRealWallet, toggleRealWallet } = useWallet();
  const isDebugMode = import.meta.env.DEV || window.location.hostname.includes('replit');

  const handleClose = () => {
    setModalOpen(false);
  };

  const walletOptions = [
    {
      name: "VeChain Thor Wallet",
      icon: "https://cdn.worldvectorlogo.com/logos/vechain-1.svg",
      handler: () => connectWallet("thor")
    },
    {
      name: "Sync2",
      icon: "https://sync2.vecha.in/favicon.png",
      handler: () => connectWallet("sync2")
    },
    {
      name: "Trust Wallet",
      icon: "https://trustwallet.com/assets/images/favicon.png",
      handler: () => connectWallet("trust")
    }
  ];
  
  // Add debug option in development or replit environments
  if (isDebugMode) {
    walletOptions.push({
      name: "Debug Test Wallet (Dev Only)",
      icon: "https://icongr.am/material/bug.svg?size=128&color=2563eb",
      handler: () => connectWallet("debug")
    });
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-secondary">Connect your wallet</DialogTitle>
          <DialogDescription>
            Connect with one of our available wallet providers to continue:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {walletOptions.map((wallet, index) => (
            <button
              key={index}
              className="w-full bg-white border border-gray-300 rounded-lg p-4 flex items-center hover:shadow-md transition-shadow"
              onClick={wallet.handler}
              disabled={isConnecting}
            >
              <img src={wallet.icon} alt={wallet.name} className="w-6 h-6 mr-4" />
              <span className="font-medium">{wallet.name}</span>
              {isConnecting && <span className="ml-auto">Connecting...</span>}
            </button>
          ))}
          
          {error && (
            <div className="text-destructive text-sm mt-2">
              {error}
            </div>
          )}
        </div>
        
        {/* Add real wallet mode toggle for development */}
        {isDebugMode && (
          <>
            <Separator className="my-4" />
            
            <div className="flex flex-col space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-2" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-300 text-sm">Developer Mode</h4>
                    <p className="text-amber-700 dark:text-amber-400 text-xs mt-1">
                      Toggle between real blockchain interaction and mock mode. 
                      Real wallet mode will require you to have the VeChain wallet extension installed
                      and properly configured.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="real-wallet-toggle" className="font-medium">
                    {useRealWallet ? "Real Wallet Interaction" : "Mock Wallet Interaction"}
                  </Label>
                  <p className="text-sm text-gray-500">
                    {useRealWallet
                      ? "All transactions will require wallet signatures"
                      : "Transactions will be simulated (no real blockchain interaction)"}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {useRealWallet ? (
                    <ToggleRight className="h-6 w-6 text-primary" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                  )}
                  <Switch
                    id="real-wallet-toggle"
                    checked={useRealWallet}
                    onCheckedChange={toggleRealWallet}
                  />
                </div>
              </div>
            </div>
          </>
        )}
        
        <div className="mt-4 text-sm text-gray-500 text-center">
          <p>By connecting your wallet, you agree to our <a href="#" className="text-primary">Terms of Service</a> and <a href="#" className="text-primary">Privacy Policy</a>.</p>
        </div>
        
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
