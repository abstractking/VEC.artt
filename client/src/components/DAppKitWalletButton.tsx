import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Wallet } from 'lucide-react';
import { useVeChainDAppKit } from '@/contexts/VeChainDAppKitContext';
import { VeChainWalletType } from '@/lib/wallet-detection';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from '@/components/ui/separator';

// Wallet options with icons
const walletOptions: { 
  id: VeChainWalletType;
  name: string;
  logo: string;
  description: string;
}[] = [
  {
    id: 'veworld',
    name: 'VeWorld',
    logo: '/wallets/veworld.svg',
    description: 'Connect to VeWorld wallet',
  },
  {
    id: 'sync',
    name: 'Sync',
    logo: '/wallets/sync.svg',
    description: 'Connect to Sync (VeThor) wallet',
  },
  {
    id: 'wallet-connect',
    name: 'WalletConnect',
    logo: '/wallets/walletconnect.svg',
    description: 'Scan with WalletConnect',
  }
];

export default function DAppKitWalletButton() {
  const { account, isConnected, isConnecting, connect, disconnect } = useVeChainDAppKit();
  const [isOpen, setIsOpen] = useState(false);
  
  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Handle wallet connection
  const handleConnectWallet = async (walletType: VeChainWalletType) => {
    try {
      await connect(walletType);
      setIsOpen(false);
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };
  
  // Handle wallet disconnection
  const handleDisconnectWallet = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Wallet disconnection error:', error);
    }
  };
  
  // Close sheet on successful connection
  useEffect(() => {
    if (isConnected) {
      setIsOpen(false);
    }
  }, [isConnected]);
  
  return (
    <>
      {isConnected ? (
        <div className="flex items-center gap-2">
          <div className="bg-muted rounded-full px-3 py-1 text-sm flex items-center">
            <Wallet className="h-4 w-4 mr-1 text-green-500" />
            <span>{formatAddress(account || '')}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDisconnectWallet}
            className="text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Connect a wallet</SheetTitle>
            </SheetHeader>
            <Separator className="my-4" />
            <div className="grid gap-4 py-4">
              {walletOptions.map((wallet) => (
                <Button
                  key={wallet.id}
                  variant="outline"
                  className="flex justify-start items-center p-4 h-auto"
                  disabled={isConnecting}
                  onClick={() => handleConnectWallet(wallet.id)}
                >
                  <div className="flex items-center w-full gap-3">
                    <div className="bg-muted rounded-full p-2">
                      {/* Use a fallback icon if image fails to load */}
                      <div className="h-6 w-6 flex items-center justify-center">
                        {wallet.logo ? (
                          <img 
                            src={wallet.logo} 
                            alt={wallet.name} 
                            className="h-5 w-5"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/wallets/default-wallet.svg';
                            }}
                          />
                        ) : (
                          <Wallet className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-left">{wallet.name}</span>
                      <span className="text-xs text-muted-foreground text-left">{wallet.description}</span>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}