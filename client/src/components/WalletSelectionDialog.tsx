import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VeChainWalletType } from '@/lib/wallet-detection';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, AlertTriangle } from 'lucide-react';

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
  // Handle wallet selection
  const handleSelectWallet = (walletType: VeChainWalletType) => {
    onSelectWallet(walletType);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Wallet</DialogTitle>
          <DialogDescription>
            Choose which wallet you want to connect to.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-4 py-4">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => handleSelectWallet('veworld')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                VeWorld
                <Badge variant="outline" className="ml-2">Recommended</Badge>
              </CardTitle>
              <CardDescription>
                Official VeChain wallet for desktop and mobile
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <p className="text-sm text-muted-foreground">
                Connect to VeWorld wallet for the best compatibility with VeChain.
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="secondary" className="w-full" onClick={() => handleSelectWallet('veworld')}>
                Connect to VeWorld
              </Button>
            </CardFooter>
          </Card>

          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => handleSelectWallet('sync2')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Sync2</CardTitle>
              <CardDescription>
                Legacy VeChain wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <p className="text-sm text-muted-foreground">
                Connect to Sync2 wallet for desktop.
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full" onClick={() => handleSelectWallet('sync2')}>
                Connect to Sync2
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
          <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-500" />
          <p>
            Some wallets may not be installed or available on your device. If connection fails, please try another wallet or install the recommended wallet.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}