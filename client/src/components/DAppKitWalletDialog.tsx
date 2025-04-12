
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VeChainWalletType } from '@/lib/wallet-detection';
import { useToast } from "@/hooks/use-toast";
import { Check, AlertTriangle } from 'lucide-react';

interface DAppKitWalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (walletType: VeChainWalletType) => void;
}

export default function DAppKitWalletDialog({
  isOpen,
  onClose,
  onSelectWallet
}: DAppKitWalletDialogProps) {
  const { toast } = useToast();
  const [selectedWallet, setSelectedWallet] = useState<VeChainWalletType | null>(null);

  // Reset selected wallet when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedWallet(null);
    }
  }, [isOpen]);

  const wallets = [
    {
      type: 'veworld' as VeChainWalletType,
      name: 'VeWorld',
      description: 'Official VeChain Wallet',
      icon: '/wallets/veworld.svg',
      recommended: true
    },
    {
      type: 'sync2' as VeChainWalletType,
      name: 'Sync2',
      description: 'VeChain Desktop Wallet',
      icon: '/wallets/sync.svg'
    },
    {
      type: 'wallet-connect' as VeChainWalletType,
      name: 'WalletConnect',
      description: 'Connect mobile wallets',
      icon: '/wallets/walletconnect.svg'
    }
  ];

  const handleWalletSelect = async (wallet: VeChainWalletType) => {
    try {
      setSelectedWallet(wallet);
      console.log('Selected wallet:', wallet);
      
      toast({
        title: `Connecting to ${wallet}`,
        description: "Please approve the connection request in your wallet",
      });

      await onSelectWallet(wallet);
      onClose();
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive"
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose your preferred wallet to connect
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {wallets.map((wallet) => (
            <button
              key={wallet.type}
              className={`
                flex items-center space-x-4 p-4 rounded-lg border 
                transition-colors hover:bg-accent
                ${selectedWallet === wallet.type ? 'border-primary' : 'border-border'}
              `}
              onClick={() => handleWalletSelect(wallet.type)}
            >
              <img 
                src={wallet.icon} 
                alt={wallet.name} 
                className="w-8 h-8"
              />
              <div className="flex-1 text-left">
                <div className="flex items-center">
                  <p className="font-medium">{wallet.name}</p>
                  {wallet.recommended && (
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {wallet.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
