import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";
import { VeChainWalletType } from '@/lib/wallet-detection';
import { useToast } from "@/hooks/use-toast";
import { getWalletDisplayName } from '@/lib/wallet-detection';
import { useDAppKitWallet } from '@/hooks/useDAppKitWallet';
import DAppKitWalletDialog from './DAppKitWalletDialog';
import { truncateAddress } from '@/lib/utils';

interface DAppKitWalletButtonProps {
  className?: string;
}

export default function DAppKitWalletButton({ className = '' }: DAppKitWalletButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { address, isConnected, isConnecting, connect, disconnect } = useDAppKitWallet();
  const { toast } = useToast();
  
  const handleSelectWallet = async (walletType: VeChainWalletType) => {
    setIsDialogOpen(false);
    
    try {
      console.log(`Selected wallet type using DApp Kit: ${walletType}`);
      
      // Show toast notification for better UX
      toast({
        title: `Connecting to ${getWalletDisplayName(walletType)}`,
        description: "Please approve the connection request in your wallet",
        duration: 5000,
      });
      
      // Call connect method from the hook
      await connect(walletType);
    } catch (error) {
      console.error("Wallet selection error:", error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to start wallet connection",
        variant: "destructive"
      });
    }
  };
  
  const handleDisconnect = () => {
    disconnect();
  };
  
  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          className={`${className} font-mono text-xs`}
        >
          <Wallet className="mr-2 h-4 w-4" />
          {truncateAddress(address)}
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleDisconnect}
          title="Disconnect wallet"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <Button
        className={`${className} bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full transition-colors font-semibold focus:ring-2 focus:ring-ring focus:ring-offset-2`}
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
      
      <DAppKitWalletDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSelectWallet={handleSelectWallet}
      />
    </>
  );
}