import React, { useState } from 'react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Wallet, AlertCircle, CheckCircle2 } from "lucide-react";
import { VeChainWalletType } from '@/lib/wallet-detection';
import { useToast } from "@/hooks/use-toast";

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
      // Add small delay to let the UI update
      setTimeout(() => {
        onSelectWallet(walletType);
      }, 100);
      
      console.log(`Selected wallet: ${walletType}`);
      toast({
        title: `Connecting to ${walletType}`,
        description: "Please approve the connection request in your wallet",
      });
    } catch (error) {
      console.error("Wallet selection error:", error);
    }
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full transition-colors font-semibold focus:ring-2 focus:ring-ring focus:ring-offset-2"
          disabled={isConnecting}
          onClick={() => setOpen(true)}
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
      <PopoverContent className="w-56 p-0" align="end">
        <div className="grid gap-1 p-2">
          <div className="p-1">
            <h4 className="text-sm font-medium mb-1">Select Wallet</h4>
            <p className="text-xs text-muted-foreground mb-2">Connect to continue</p>
          </div>
          <Button
            variant="outline" 
            className="justify-start font-normal"
            onClick={() => handleSelectWallet('veworld')}
            disabled={isConnecting}
          >
            <Wallet className="mr-2 h-4 w-4" />
            VeWorld
          </Button>
          <Button
            variant="outline"
            className="justify-start font-normal"
            onClick={() => handleSelectWallet('sync2')}
            disabled={isConnecting}
          >
            <Wallet className="mr-2 h-4 w-4" />
            Sync2
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}