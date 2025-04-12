import React, { useState } from 'react';
import { X, Check, XCircle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VeChainWalletType } from '@/lib/wallet-detection';
import { useDAppKitWallet } from '@/hooks/useDAppKitWallet';

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
  const [isLoading, setIsLoading] = useState(false);
  const { openModal } = useDAppKitWallet();

  // Define wallet options
  const wallets = [
    {
      type: 'veworld' as VeChainWalletType,
      name: 'VeWorld',
      description: 'Connect to VeWorld Browser Extension',
      available: true,
      recommended: true,
      icon: <img src="/assets/wallets/veworld.svg" alt="VeWorld" className="w-10 h-10" />
    },
    {
      type: 'sync2' as VeChainWalletType,
      name: 'Sync2',
      description: 'Connect to VeChain Sync2 Wallet',
      available: true,
      recommended: false,
      icon: <img src="/assets/wallets/sync2.svg" alt="Sync2" className="w-10 h-10" />
    },
    {
      type: 'wallet-connect' as VeChainWalletType,
      name: 'WalletConnect',
      description: 'Connect with QR code or mobile wallet',
      available: true,
      recommended: false,
      icon: <img src="/assets/wallets/walletconnect.svg" alt="WalletConnect" className="w-10 h-10" />
    }
  ];

  const handleOpenWallet = (walletType: VeChainWalletType) => {
    setIsLoading(true);
    onSelectWallet(walletType);
    onClose();
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleSelectWalletConnect = () => {
    openModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Connect your wallet to interact with this application
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 py-4">
          {wallets.map((wallet) => (
            <div 
              key={wallet.type}
              className={`flex items-center p-3 rounded-lg border ${
                wallet.available 
                  ? 'hover:border-primary cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => {
                if (!wallet.available) return;
                
                if (wallet.type === 'walletconnect' || wallet.type === 'wallet-connect') {
                  handleSelectWalletConnect();
                } else {
                  handleOpenWallet(wallet.type);
                }
              }}
            >
              {wallet.icon}
              <div className="flex-1 ml-3">
                <div className="font-medium flex items-center gap-2">
                  {wallet.name}
                  {wallet.recommended && (
                    <span className="bg-green-100 text-green-800 text-xs rounded px-1 py-0.5 flex items-center gap-1">
                      <Check className="w-3 h-3" /> 
                      Recommended
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{wallet.description}</div>
              </div>
              <div className="flex items-center">
                {wallet.available ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <div className="flex flex-col items-end">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="text-xs text-red-500">Not installed</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}