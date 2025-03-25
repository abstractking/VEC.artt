import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  VeChainWalletType, 
  getWalletDisplayName, 
  verifyWalletAvailability, 
  detectAvailableWallets,
  isMobileDevice
} from '@/lib/wallet-detection';
import { Check, Wallet, XCircle, AlertTriangle, Smartphone, Laptop, ExternalLink } from 'lucide-react';

interface WalletOption {
  type: VeChainWalletType;
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  recommended: boolean;
  deviceType: 'mobile' | 'desktop' | 'both';
  detailMessage: string;
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
  const [activeTab, setActiveTab] = useState('all');
  const isMobile = isMobileDevice();
  
  // Set initial active tab based on device type
  useEffect(() => {
    setActiveTab(isMobile ? 'mobile' : 'all');
  }, [isMobile]);

  // Define wallet options with availability checks and device compatibility
  const allWalletOptions: WalletOption[] = [
    {
      type: 'veworld',
      name: 'VeWorld',
      description: 'Official VeChain wallet with TestNet support',
      icon: <Wallet className="h-6 w-6" />,
      available: verifyWalletAvailability('veworld').available,
      recommended: true,
      deviceType: 'both',
      detailMessage: verifyWalletAvailability('veworld').message
    },
    {
      type: 'thor',
      name: 'VeChainThor',
      description: 'Browser extension for VeChain transactions',
      icon: <Wallet className="h-6 w-6" />,
      available: verifyWalletAvailability('thor').available,
      recommended: false,
      deviceType: 'desktop',
      detailMessage: verifyWalletAvailability('thor').message
    },
    {
      type: 'sync2',
      name: 'Sync2',
      description: 'Desktop wallet application with dApp browser',
      icon: <Laptop className="h-6 w-6" />,
      available: verifyWalletAvailability('sync2').available,
      recommended: false,
      deviceType: 'desktop',
      detailMessage: verifyWalletAvailability('sync2').message
    },
    {
      type: 'sync',
      name: 'Sync',
      description: 'Original VeChain desktop wallet',
      icon: <Laptop className="h-6 w-6" />,
      available: verifyWalletAvailability('sync').available,
      recommended: false,
      deviceType: 'desktop',
      detailMessage: verifyWalletAvailability('sync').message
    },
    {
      type: 'walletconnect',
      name: 'WalletConnect',
      description: 'Connect mobile wallets via QR code (Coming Soon)',
      icon: <Smartphone className="h-6 w-6" />,
      available: false, // Not yet implemented
      recommended: false,
      deviceType: 'mobile',
      detailMessage: verifyWalletAvailability('walletconnect').message
    }
  ];

  // Filter wallet options based on active tab
  const filteredWalletOptions = allWalletOptions.filter(wallet => {
    if (activeTab === 'all') return true;
    if (activeTab === 'mobile') return wallet.deviceType === 'mobile' || wallet.deviceType === 'both';
    if (activeTab === 'desktop') return wallet.deviceType === 'desktop' || wallet.deviceType === 'both';
    return true;
  });

  const handleSelectWallet = (walletType: VeChainWalletType) => {
    onSelectWallet(walletType);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Select a wallet to connect to VeCollab Marketplace
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-grow min-h-0">
          <TabsList className="grid grid-cols-3 mb-4 flex-shrink-0">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="mobile">Mobile</TabsTrigger>
            <TabsTrigger value="desktop">Desktop</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0 flex-grow overflow-y-auto pr-1 min-h-0">
            <div className="flex flex-col space-y-4">
              {filteredWalletOptions.map((wallet) => (
                <div 
                  key={wallet.type}
                  className={`flex flex-col p-3 sm:p-4 rounded-lg border
                    ${wallet.available 
                      ? 'cursor-pointer hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-primary' 
                      : 'opacity-70 cursor-not-allowed'}
                  `}
                  onClick={() => wallet.available && handleSelectWallet(wallet.type)}
                  tabIndex={wallet.available ? 0 : -1}
                  role="button"
                  aria-disabled={!wallet.available}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className={`p-2 rounded-full ${wallet.available ? 'bg-primary/10' : 'bg-muted/50'}`}>
                        {wallet.icon}
                      </div>
                      <div>
                        <h3 className="font-medium flex flex-wrap items-center gap-2 text-sm sm:text-base">
                          {wallet.name}
                          {wallet.recommended && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                              Recommended
                            </span>
                          )}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{wallet.description}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      {wallet.available ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                  </div>
                  
                  {/* Status message */}
                  <div className={`text-xs mt-1 px-2 py-1 rounded overflow-auto max-h-16
                    ${wallet.available ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300' : 
                                         'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>
                    {wallet.detailMessage}
                  </div>
                </div>
              ))}
              
              {filteredWalletOptions.length === 0 && (
                <div className="text-center p-4 border rounded-lg bg-muted/10">
                  <p>No compatible wallets found for this device type.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Help and resources section */}
        <div className="border-t pt-4 mt-auto flex-shrink-0">
          <p className="text-sm text-muted-foreground mb-3">
            Need help with wallets?
          </p>
          <div className="flex flex-col space-y-2">
            <Button 
              variant="outline" 
              size="sm"
              className="justify-start text-left"
              onClick={() => window.open('https://doc.vechain.org/getting-started/wallets.html', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Get a wallet
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="justify-start text-left"
              onClick={() => window.open('https://doc.vechain.org/tutorials/test-net.html', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Configure TestNet
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" className="mt-2">Cancel</Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}