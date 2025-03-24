import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VeChainWalletType, getWalletDisplayName, verifyWalletAvailability } from '@/lib/wallet-detection';
import { Check, Wallet, XCircle, AlertTriangle } from 'lucide-react';

interface WalletOption {
  type: VeChainWalletType;
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  recommended: boolean;
}

interface WalletSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (walletType: VeChainWalletType) => void;
}

export default function WalletSelectionDialog({
  isOpen,
  onClose,
  onSelectWallet
}: WalletSelectionDialogProps) {
  // Define wallet options with availability checks
  const walletOptions: WalletOption[] = [
    {
      type: 'veworld',
      name: 'VeWorld',
      description: 'Official VeChain wallet extension with mobile support',
      icon: <Wallet className="h-6 w-6" />,
      available: verifyWalletAvailability('veworld').available,
      recommended: true
    },
    {
      type: 'sync2',
      name: 'Sync2',
      description: 'VeChain wallet with desktop browser support',
      icon: <Wallet className="h-6 w-6" />,
      available: verifyWalletAvailability('sync2').available,
      recommended: false
    }
  ];

  const handleSelectWallet = (walletType: VeChainWalletType) => {
    onSelectWallet(walletType);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Select a wallet to connect to VeCollab Marketplace
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 py-4">
          {walletOptions.map((wallet) => (
            <div 
              key={wallet.type}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                wallet.available 
                  ? 'cursor-pointer hover:bg-accent hover:text-accent-foreground' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => wallet.available && handleSelectWallet(wallet.type)}
            >
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  {wallet.icon}
                </div>
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    {wallet.name}
                    {wallet.recommended && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">{wallet.description}</p>
                </div>
              </div>
              <div className="flex-shrink-0">
                {wallet.available ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Non-wallet options and troubleshooting */}
        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            Don't have a wallet?
          </p>
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => window.open('https://doc.vechain.org/getting-started/wallets.html', '_blank')}
            >
              Get a wallet
            </Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}