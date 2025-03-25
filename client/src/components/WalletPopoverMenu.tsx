import React from 'react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { VeChainWalletType } from '@/lib/wallet-detection';

interface WalletPopoverMenuProps {
  onSelectWallet: (walletType: VeChainWalletType) => void;
  isConnecting: boolean;
}

export default function WalletPopoverMenu({
  onSelectWallet,
  isConnecting
}: WalletPopoverMenuProps) {
  return (
    <Popover>
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
      <PopoverContent className="w-56 p-0" align="end">
        <div className="grid gap-1 p-2">
          <div className="p-1">
            <h4 className="text-sm font-medium mb-1">Select Wallet</h4>
            <p className="text-xs text-muted-foreground mb-2">Connect to continue</p>
          </div>
          <Button
            variant="outline" 
            className="justify-start font-normal"
            onClick={() => onSelectWallet('veworld')}
          >
            <Wallet className="mr-2 h-4 w-4" />
            VeWorld
          </Button>
          <Button
            variant="outline"
            className="justify-start font-normal"
            onClick={() => onSelectWallet('sync2')}
          >
            <Wallet className="mr-2 h-4 w-4" />
            Sync2
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}