import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Check, ExternalLink, InfoIcon, LogOut, Wallet } from 'lucide-react';
import { useVeChainDAppKit } from '@/contexts/VeChainDAppKitContext';
import { VeChainWalletType } from '@/lib/wallet-detection';
import { isWalletExtensionAvailable, isMobileDevice } from '@/lib/dappkit-helpers';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Wallet options with icons and installation links
const walletOptions: { 
  id: VeChainWalletType;
  name: string;
  logo: string;
  description: string;
  type: 'extension' | 'mobile' | 'protocol';
  installUrl: string;
}[] = [
  {
    id: 'veworld',
    name: 'VeWorld',
    logo: '/wallets/veworld.svg',
    description: 'Official VeChain wallet',
    type: 'extension',
    installUrl: 'https://www.veworld.net/install'
  },
  {
    id: 'sync2',
    name: 'Sync2',
    logo: '/wallets/sync.svg',
    description: 'Connect to Sync2 wallet',
    type: 'extension',
    installUrl: 'https://sync.vecha.in/#download'
  },
  {
    id: 'wallet-connect',
    name: 'WalletConnect',
    logo: '/wallets/walletconnect.svg',
    description: 'Scan with WalletConnect',
    type: 'protocol',
    installUrl: 'https://walletconnect.com/explorer'
  }
];

export default function DAppKitWalletButton() {
  const { account, isConnected, isConnecting, connect, disconnect, error } = useVeChainDAppKit();
  const [isOpen, setIsOpen] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<VeChainWalletType[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [connectError, setConnectError] = useState(''); // Added state for connection errors

  // Check for available wallets when the component mounts
  useEffect(() => {
    // Set mobile state
    setIsMobile(isMobileDevice());

    // Determine available wallets
    const checkWallets = () => {
      const available: VeChainWalletType[] = [];

      // Always add WalletConnect as it doesn't require a browser extension
      available.push('wallet-connect');

      // Check for VeWorld and Sync2 wallets
      if (isWalletExtensionAvailable('veworld')) {
        available.push('veworld');
        console.log("[WalletButton] VeWorld wallet detected");
      }

      if (isWalletExtensionAvailable('sync2')) {
        available.push('sync2');
        console.log("[WalletButton] Sync2 wallet detected");
      }

      // On mobile, only show appropriate options
      if (isMobileDevice()) {
        console.log("[WalletButton] Mobile device detected");
      }

      console.log("[WalletButton] Available wallets:", available);
      setAvailableWallets(available);
    };

    checkWallets();

    // Re-check when window is focused (user might have installed a wallet)
    const handleFocus = () => {
      checkWallets();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Handle wallet connection with improved error handling
  const handleConnectWallet = async (walletType: VeChainWalletType) => {
    try {
      console.log("[WalletButton] Attempting to connect to wallet type:", walletType);
      await connect(walletType);
      setIsOpen(false);
      setConnectError(''); // Clear error on successful connection
    } catch (err: any) {
      console.error('[WalletButton] Wallet connection error:', err);
      setConnectError(err.message || 'An unexpected error occurred.');
    }
  };

  // Handle wallet disconnection
  const handleDisconnectWallet = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('[WalletButton] Wallet disconnection error:', error);
    }
  };

  // Check if a wallet is installed
  const isWalletInstalled = (walletType: VeChainWalletType): boolean => {
    if (walletType === 'wallet-connect') return true; // Always available
    return isWalletExtensionAvailable(walletType);
  };

  // Open wallet install URL
  const openInstallUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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
            <Button onClick={() => {
              console.log('Opening wallet dialog');
              setIsOpen(true); //Corrected this line
            }}>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Connect a wallet</SheetTitle>
              <SheetDescription>
                Select a wallet to connect to the VeChain {import.meta.env.VITE_REACT_APP_VECHAIN_NETWORK === 'main' ? 'Mainnet' : 'Testnet'}.
              </SheetDescription>
            </SheetHeader>

            {connectError && ( // Display connection error
              <Alert variant="destructive" className="my-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{connectError}</AlertDescription>
              </Alert>
            )}

            {error && ( // Display other errors
              <Alert variant="destructive" className="my-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            {isMobile && (
              <Alert className="my-4">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Mobile Device Detected</AlertTitle>
                <AlertDescription>
                  For the best experience, we recommend using the VeWorld or Sync2 mobile app.
                </AlertDescription>
              </Alert>
            )}

            <Separator className="my-4" />

            <div className="grid gap-4 py-4">
              {walletOptions.map((wallet) => {
                // Skip desktop extensions on mobile and vice versa
                if (isMobile && wallet.type === 'extension' && wallet.id !== 'wallet-connect') {
                  return null;
                }

                const isInstalled = isWalletInstalled(wallet.id);

                return (
                  <div key={wallet.id} className="relative">
                    <Button
                      variant={isInstalled ? "outline" : "secondary"}
                      className="flex justify-start items-center p-4 h-auto w-full relative"
                      disabled={isConnecting || !isInstalled}
                      onClick={() => isInstalled ? handleConnectWallet(wallet.id) : openInstallUrl(wallet.installUrl)}
                    >
                      <div className="flex items-center w-full gap-3">
                        <div className={`rounded-full p-2 ${isInstalled ? 'bg-muted' : 'bg-muted/50'}`}>
                          {/* Use a fallback icon if image fails to load */}
                          <div className="h-6 w-6 flex items-center justify-center">
                            {wallet.logo ? (
                              <img 
                                src={wallet.logo} 
                                alt={wallet.name} 
                                className={`h-5 w-5 ${!isInstalled ? 'opacity-50' : ''}`}
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
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-left">{wallet.name}</span>
                            {isInstalled && wallet.id !== 'wallet-connect' && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full flex items-center">
                                      <Check className="h-3 w-3 mr-0.5" />
                                      <span>Installed</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{wallet.name} is installed and ready to use</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground text-left">{wallet.description}</span>
                        </div>
                        {!isInstalled && (
                          <div className="ml-auto flex items-center text-xs text-primary">
                            <span className="mr-1">Install</span>
                            <ExternalLink className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </Button>
                  </div>
                );
              })}
            </div>

            <SheetFooter className="flex flex-col pt-4 gap-2">
              <div className="text-sm text-muted-foreground">
                Don't have a wallet?{' '}
                <a 
                  href="https://www.veworld.net/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Learn more about VeChain wallets
                </a>
              </div>

              <div className="text-xs text-muted-foreground/80">
                By connecting your wallet, you agree to the Terms of Service and Privacy Policy.
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}