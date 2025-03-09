import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useWallet } from "@/hooks/useVechain";

export default function WalletModal() {
  const { isConnecting, isModalOpen, setModalOpen, connectWallet, error } = useWallet();
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
