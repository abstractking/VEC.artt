import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";
import { truncateAddress } from "@/lib/utils";
import { useDAppKitWallet } from "@/hooks/useDAppKitWallet";
import DAppKitWalletDialog from "./DAppKitWalletDialog";
import { VeChainWalletType } from "@/lib/wallet-detection";

interface VeChainWalletButtonProps {
  className?: string;
}

/**
 * VeChainWalletButton
 * 
 * A button that handles wallet connection using the VeChain dapp-kit-react hooks.
 * This is a simplified implementation that delegates all wallet connection logic to the SDK.
 */
export default function VeChainWalletButton({ className = '' }: VeChainWalletButtonProps) {
  const { address, isConnected, isConnecting, connect, disconnect } = useDAppKitWallet();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSelectWallet = async (walletType: VeChainWalletType) => {
    try {
      await connect(walletType);
    } catch (error) {
      console.error("Wallet connection error:", error);
    }
  };

  // If connected, show account address
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
          onClick={disconnect}
          title="Disconnect wallet"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // If not connected, show connect button
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
          "DAppKit Wallet"
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