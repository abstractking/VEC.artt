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
import { useDAppKit } from '@/contexts/DAppKitProvider';

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
  const [activeTab, setActiveTab] = useState('all');
  const isMobile = isMobileDevice();
  const { web3Modal } = useDAppKit();
  
  // Set initial active tab based on device type
  useEffect(() => {
    setActiveTab(isMobile ? 'mobile' : 'all');
  }, [isMobile]);
  
  // Generate wallet options based on available wallets
  const availableWallets = detectAvailableWallets();
  
  const walletOptions: WalletOption[] = [
    {
      type: 'veworld',
      name: 'VeWorld',
      description: 'Connect using VeWorld browser extension or mobile app',
      icon: <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">V</div>,
      available: availableWallets.includes('veworld'),
      recommended: true,
      deviceType: 'both',
      detailMessage: availableWallets.includes('veworld') 
        ? 'Available and recommended' 
        : 'Install VeWorld for the best experience'
    },
    {
      type: 'sync2',
      name: 'Sync2',
      description: 'Connect using the Sync2 desktop application',
      icon: <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">S2</div>,
      available: availableWallets.includes('sync2'),
      recommended: false,
      deviceType: 'desktop',
      detailMessage: 'Best for desktop users'
    },
    {
      type: 'sync',
      name: 'Sync',
      description: 'Connect using the Sync desktop application',
      icon: <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">S</div>,
      available: availableWallets.includes('sync'),
      recommended: false,
      deviceType: 'desktop',
      detailMessage: 'Original desktop wallet'
    },
    {
      type: 'walletconnect',
      name: 'WalletConnect',
      description: 'Scan with your mobile wallet using WalletConnect',
      icon: <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">WC</div>,
      available: true, // WalletConnect is always available
      recommended: isMobile && !availableWallets.includes('veworld'),
      deviceType: 'both',
      detailMessage: 'Connect with any WalletConnect-compatible wallet'
    },
  ];
  
  const handleSelectWalletConnect = () => {
    web3Modal.open();
    onClose();
  };

  // Special handler for directly opening specific wallet types
  const handleOpenWallet = (walletType: VeChainWalletType) => {
    console.log(`Opening wallet: ${walletType}`);
    
    // Call the provided callback with the wallet type
    onSelectWallet(walletType);
    onClose();
    
    // For Sync wallets, we should also show an alert to inform the user
    if (walletType === 'sync' || walletType === 'sync2') {
      const walletName = walletType === 'sync' ? 'Sync' : 'Sync2';
      setTimeout(() => {
        alert(`Please open your ${walletName} application to connect.\n\nIf you don't have it installed, please download it from the VeChain website.`);
      }, 100);
    }
  };
  
  const filteredWallets = activeTab === 'all' 
    ? walletOptions 
    : walletOptions.filter(wallet => wallet.deviceType === activeTab || wallet.deviceType === 'both');
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to the VeCollab marketplace
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-1">
              All
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-1">
              <Smartphone className="w-4 h-4" />
              Mobile
            </TabsTrigger>
            <TabsTrigger value="desktop" className="flex items-center gap-1">
              <Laptop className="w-4 h-4" />
              Desktop
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            <div className="space-y-3">
              {filteredWallets.map((wallet) => (
                <div 
                  key={wallet.type}
                  className={`p-4 rounded-lg border flex items-center gap-3 ${
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
                  <div className="flex-1">
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
                        <a 
                          href={wallet.type === 'veworld' ? 'https://veworld.com' : 'https://sync.vecha.in/'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 flex items-center gap-1 mt-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Install <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>By connecting a wallet, you agree to VeCollab's <a href="#" className="text-blue-500">Terms of Service</a> and <a href="#" className="text-blue-500">Privacy Policy</a>.</p>
            </div>
            
            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <a 
                href="https://vechain.org/wallets/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline flex items-center gap-1"
              >
                Learn about wallets <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}