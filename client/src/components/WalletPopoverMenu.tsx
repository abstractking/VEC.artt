import React, { useState } from 'react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Wallet, ExternalLink } from "lucide-react";
import { VeChainWalletType } from '@/lib/wallet-detection';
import { useToast } from "@/hooks/use-toast";
import { getWalletDisplayName } from '@/lib/wallet-detection';

interface WalletPopoverMenuProps {
  onSelectWallet: (walletType: VeChainWalletType) => void;
  isConnecting: boolean;
}

export default function WalletPopoverMenu({
  onSelectWallet,
  isConnecting
}: WalletPopoverMenuProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const handleSelectWallet = async (walletType: VeChainWalletType) => {
    setOpen(false);
    
    try {
      console.log(`Selected wallet type: ${walletType}`);
      
      // Show toast notification for better UX
      toast({
        title: `Connecting to ${getWalletDisplayName(walletType)}`,
        description: "Please approve the connection request in your wallet",
        duration: 5000,
      });
      
      // Call the parent handler to initiate the connection
      onSelectWallet(walletType);
    } catch (error) {
      console.error("Wallet selection error:", error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to start wallet connection",
        variant: "destructive"
      });
    }
  };
  
  // Get detection status for installed wallets
  const hasVeWorld = typeof window !== 'undefined' && window.vechain && window.vechain.isVeWorld;
  const hasSync2 = typeof window !== 'undefined' && window.connex;
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full transition-colors font-semibold focus:ring-2 focus:ring-ring focus:ring-offset-2"
          disabled={isConnecting}
        >
          <Wallet className="mr-2 h-4 w-4" />
          {isConnecting ? (
            <>
              <span className="mr-2">Connecting</span>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </>
          ) : (
            "Connect Wallet"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <div className="grid gap-1 p-2">
          <div className="p-1">
            <h4 className="text-sm font-medium mb-1">Select Wallet</h4>
            <p className="text-xs text-muted-foreground mb-2">Choose a wallet to connect</p>
          </div>
          
          <Button
            variant="outline" 
            className="justify-start font-normal"
            onClick={() => handleSelectWallet('veworld')}
            disabled={isConnecting}
          >
            <Wallet className="mr-2 h-4 w-4" />
            VeWorld
            {!hasVeWorld && <span className="ml-auto text-xs text-muted-foreground">Not detected</span>}
          </Button>
          
          <Button
            variant="outline"
            className="justify-start font-normal"
            onClick={() => handleSelectWallet('sync2')}
            disabled={isConnecting}
          >
            <Wallet className="mr-2 h-4 w-4" />
            Sync2
            {!hasSync2 && <span className="ml-auto text-xs text-muted-foreground">Not detected</span>}
          </Button>
          
          <div className="p-2 text-xs text-muted-foreground">
            <div className="flex items-center">
              <ExternalLink className="h-3 w-3 mr-1" />
              <span>
                Don't have a wallet?{' '}
                <a 
                  href="https://www.veworld.net/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Get VeWorld
                </a>
              </span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}