import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, ExternalLink } from 'lucide-react';
import { VeChainWalletType } from '@/lib/wallet-detection';

interface DAppKitWalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (walletType: VeChainWalletType) => void;
}

const wallets = [
  {
    type: 'veworld' as VeChainWalletType,
    name: 'VeWorld',
    icon: '/wallets/veworld.svg',
    available: true,
    recommended: true,
    installUrl: 'https://www.veworld.net/install'
  },
  {
    type: 'sync2' as VeChainWalletType,
    name: 'Sync2',
    icon: '/wallets/sync.svg',
    available: true,
    installUrl: 'https://sync.vecha.in/#download'
  },
  {
    type: 'wallet-connect' as VeChainWalletType,
    name: 'WalletConnect',
    icon: '/wallets/walletconnect.svg',
    available: true,
    installUrl: 'https://walletconnect.com/explorer'
  }
];

export default function DAppKitWalletDialog({ isOpen, onClose, onSelectWallet }: DAppKitWalletDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Select a wallet to connect to VeChain
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-4">
          {wallets.map((wallet) => (
            <Button
              key={wallet.type}
              variant="outline"
              className="flex items-center justify-start h-auto p-4 gap-3"
              onClick={() => onSelectWallet(wallet.type)}
            >
              <div className="bg-muted rounded-full p-2">
                <img src={wallet.icon} alt={wallet.name} className="h-6 w-6" />
              </div>
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{wallet.name}</span>
                  {wallet.recommended && (
                    <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full flex items-center">
                      <Check className="h-3 w-3 mr-0.5" />
                      Recommended
                    </span>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}