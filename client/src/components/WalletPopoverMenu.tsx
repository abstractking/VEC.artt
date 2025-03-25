import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { VeChainWalletType } from '@/lib/wallet-detection';
import { useToast } from "@/hooks/use-toast";
import { getWalletDisplayName, isMobileDevice } from '@/lib/wallet-detection';
import WalletSelectionDialog from './WalletSelectionDialog';

interface WalletPopoverMenuProps {
  onSelectWallet: (walletType: VeChainWalletType) => void;
  isConnecting: boolean;
}

export default function WalletPopoverMenu({
  onSelectWallet,
  isConnecting
}: WalletPopoverMenuProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = isMobileDevice();
  
  const handleSelectWallet = async (walletType: VeChainWalletType) => {
    setIsDialogOpen(false);
    
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
  
  return (
    <>
      <Button
        className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full transition-colors font-semibold focus:ring-2 focus:ring-ring focus:ring-offset-2"
        disabled={isConnecting}
        onClick={() => setIsDialogOpen(true)}
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
      
      <WalletSelectionDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSelectWallet={handleSelectWallet}
      />
    </>
  );
}