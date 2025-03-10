import { useState, useEffect } from "react";
import { AlertCircle, X, ToggleLeft, ToggleRight, Info } from "lucide-react";
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
import NetworkInstructions from "@/components/NetworkInstructions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function WalletModal() {
  const { isConnecting, isModalOpen, setModalOpen, connectWallet, error, useRealWallet, toggleRealWallet } = useWallet();
  const isDebugMode = typeof window !== 'undefined' && 
    (import.meta.env.DEV || 
     window.location.hostname.includes('replit') || 
     window.location.hostname.includes('netlify.app') ||
     import.meta.env.MODE !== 'production');

  // Network detection - this matches the reference screenshot
  const [selectedNetwork] = useState("VeChain"); // We currently only support VeChain network

  const handleClose = () => {
    setModalOpen(false);
  };

  const walletOptions = [
    {
      name: "VeWorld",
      description: "Browser plugin for VeChain",
      icon: "https://veworld.net/favicon.ico",
      handler: () => connectWallet("veworld"),
      type: "browser"
    },
    {
      name: "VeChainThor",
      description: "Browser extension wallet",
      icon: "https://cdn.worldvectorlogo.com/logos/vechain-1.svg",
      handler: () => connectWallet("thor"),
      type: "browser"
    },
    {
      name: "Sync",
      description: "Desktop wallet for VeChain",
      icon: "https://sync.vecha.in/favicon.png",
      handler: () => connectWallet("sync"),
      type: "desktop"
    },
    {
      name: "Sync2",
      description: "New desktop wallet for VeChain",
      icon: "https://sync2.vecha.in/favicon.png",
      handler: () => connectWallet("sync2"),
      type: "desktop"
    },
    {
      name: "Wallet Connect",
      description: "Connect via WalletConnect protocol",
      icon: "https://walletconnect.org/favicon.ico",
      handler: () => connectWallet("walletconnect"),
      type: "protocol"
    }
  ];
  
  // Add debug option in development or replit environments, but NOT on Netlify
  const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');
  if (isDebugMode && !isNetlify) {
    walletOptions.push({
      name: "Debug Test Wallet (Dev Only)",
      description: "For development testing only",
      icon: "https://icongr.am/material/bug.svg?size=128&color=2563eb",
      handler: () => connectWallet("debug"),
      type: "debug"
    });
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-secondary flex items-center gap-2">
            <img src="https://cdn.worldvectorlogo.com/logos/vechain-1.svg" alt="VeChain" className="w-7 h-7" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription>
            Connect with one of our available wallet providers to continue:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Network selection section */}
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Network</h3>
            <div className="bg-slate-900 text-white p-3 rounded-lg text-center">
              {selectedNetwork}
            </div>
          </div>
          
          {/* Show Network Instructions only on Netlify */}
          {isNetlify && <NetworkInstructions />}
          
          {/* Wallet selection section */}
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Select Your Wallet</h3>
            
            {/* Browser Wallet Section */}
            <div className="mb-4">
              <h4 className="text-xs font-medium mb-2 text-primary">Browser Extensions</h4>
              <div className="grid grid-cols-2 gap-2">
                {walletOptions.filter(w => w.type === "browser").map((wallet, index) => (
                  <button
                    key={index}
                    className="flex items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-primary"
                    onClick={wallet.handler}
                    disabled={isConnecting}
                    title={wallet.description}
                  >
                    <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                      <img src={wallet.icon} alt={wallet.name} className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-medium block">{wallet.name}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{wallet.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Desktop Wallet Section */}
            <div className="mb-4">
              <h4 className="text-xs font-medium mb-2 text-primary">Desktop Applications</h4>
              <div className="grid grid-cols-2 gap-2">
                {walletOptions.filter(w => w.type === "desktop").map((wallet, index) => (
                  <button
                    key={index}
                    className="flex items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-primary"
                    onClick={wallet.handler}
                    disabled={isConnecting}
                    title={wallet.description}
                  >
                    <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                      <img src={wallet.icon} alt={wallet.name} className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-medium block">{wallet.name}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{wallet.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Other Connection Methods */}
            {walletOptions.filter(w => w.type === "protocol" || w.type === "debug").length > 0 && (
              <div>
                <h4 className="text-xs font-medium mb-2 text-primary">Other Connection Methods</h4>
                <div className="grid grid-cols-2 gap-2">
                  {walletOptions.filter(w => w.type === "protocol" || w.type === "debug").map((wallet, index) => (
                    <button
                      key={index}
                      className={`flex items-center p-3 rounded-lg transition-colors border border-transparent 
                        ${wallet.type === "debug" 
                          ? "bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900 hover:border-amber-400" 
                          : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-primary"}`}
                      onClick={wallet.handler}
                      disabled={isConnecting}
                      title={wallet.description}
                    >
                      <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                        <img src={wallet.icon} alt={wallet.name} className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-medium block">{wallet.name}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{wallet.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Connection instructions for desktop wallets */}
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">Desktop Wallet Connection</p>
                <p className="text-xs">Desktop wallets like Sync and Sync2 will open in a separate application. 
                Make sure you have installed the application and follow the prompts to connect.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Add real wallet mode toggle for development - Hide on Netlify */}
        {isDebugMode && !isNetlify && (
          <>
            <Separator className="my-4" />
            
            <div className="flex flex-col space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-2" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-300 text-sm">
                      Developer Mode
                    </h4>
                    <p className="text-amber-700 dark:text-amber-400 text-xs mt-1">
                      Toggle between real blockchain interaction and demo mode. 
                      Real wallet mode requires the VeChain wallet extension to be installed
                      and configured. Demo mode uses simulated transactions.
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
