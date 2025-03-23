import { useState, useEffect } from "react";
import { AlertCircle, X, PhoneCall, Smartphone, Info, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWallet } from "@/hooks/useVechain";
import { useVeChain } from "@/hooks/useVechain";
import NetworkInstructions from "@/components/NetworkInstructions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import our wallet detection utilities
import { 
  VeChainWalletType, 
  detectAvailableWallets,
  isThorWalletAvailable,
  isVeWorldWalletAvailable,
  getWalletDisplayName
} from "@/lib/wallet-detection";

// Helper function to detect mobile devices
function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export default function WalletModal() {
  const { isConnecting, isModalOpen, setModalOpen, connectWallet, error, useRealWallet, toggleRealWallet } = useWallet();
  const vechain = useVeChain(); // Access VeChain context for advanced connection options
  
  const isDebugMode = typeof window !== 'undefined' && 
    (import.meta.env.DEV || 
     window.location.hostname.includes('replit') || 
     window.location.hostname.includes('netlify.app') ||
     import.meta.env.MODE !== 'production');

  // Network detection - this matches the reference screenshot
  const [selectedNetwork] = useState("VeChain"); // We currently only support VeChain network
  
  // Track available wallets
  const [availableWallets, setAvailableWallets] = useState<VeChainWalletType[]>([]);
  
  // Track if this is a mobile device
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect available wallets on mount
  useEffect(() => {
    const wallets = detectAvailableWallets();
    setAvailableWallets(wallets);
    console.log("Available wallets:", wallets);
    
    // Detect if this is a mobile device
    setIsMobile(isMobileDevice());
  }, []);

  const handleClose = () => {
    setModalOpen(false);
  };

  // Create wallet options with detection status
  const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');
  const veWorldDetected = isVeWorldWalletAvailable();
  const thorWalletDetected = isThorWalletAvailable();
  
  const walletOptions = [
    {
      id: "veworld" as VeChainWalletType,
      name: "VeWorld",
      description: "Browser plugin for VeChain",
      icon: "https://veworld.net/favicon.ico",
      handler: () => connectWallet("veworld"),
      type: "browser",
      available: veWorldDetected,
      installed: veWorldDetected,
      supportsMobile: true
    },
    {
      id: "thor" as VeChainWalletType,
      name: "VeChainThor",
      description: "Browser extension wallet",
      icon: "https://cdn.worldvectorlogo.com/logos/vechain-1.svg",
      handler: () => connectWallet("thor"),
      type: "browser",
      available: thorWalletDetected,
      installed: thorWalletDetected,
      supportsMobile: false
    },
    {
      id: "sync" as VeChainWalletType,
      name: "Sync",
      description: "Desktop wallet for VeChain",
      icon: "https://sync.vecha.in/favicon.png",
      handler: () => connectWallet("sync"),
      type: "desktop",
      available: true,  // We can't detect these, so assume available
      installed: false,  // But don't know if installed
      supportsMobile: false
    },
    {
      id: "sync2" as VeChainWalletType,
      name: "Sync2",
      description: "New desktop wallet for VeChain",
      icon: "https://sync2.vecha.in/favicon.png",
      handler: () => connectWallet("sync2"),
      type: "desktop",
      available: true,  // We can't detect these, so assume available
      installed: false,  // But don't know if installed
      supportsMobile: true
    },
    {
      id: "walletconnect" as VeChainWalletType,
      name: "Wallet Connect",
      description: "Connect via WalletConnect protocol",
      icon: "https://walletconnect.org/favicon.ico",
      handler: () => connectWallet("walletconnect"), // Now using proper type
      type: "protocol",
      available: false,  // Not fully implemented yet
      installed: false,
      supportsMobile: true
    }
  ];
  
  // Show instructions for mobile if needed
  const mobileInstructions = (
    <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg my-3">
      <div className="flex items-start">
        <Smartphone className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-yellow-800 dark:text-yellow-300">
          <p className="font-medium mb-1">Mobile Wallet Detected</p>
          <p className="text-xs">For the best experience on mobile, we recommend using VeWorld mobile app. It integrates seamlessly with the browser and provides a secure wallet experience.</p>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
      <DialogContent className={`${isMobile ? 'w-[95vw] max-w-[95vw]' : 'sm:max-w-md'}`}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-secondary flex items-center gap-2">
            <img src="https://cdn.worldvectorlogo.com/logos/vechain-1.svg" alt="VeChain" className="w-7 h-7" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription>
            Connect with one of our available wallet providers to continue:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Network selection section */}
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Network</h3>
            <div className="bg-slate-900 text-white p-3 rounded-lg text-center">
              {selectedNetwork}
            </div>
          </div>
          
          {/* Show Network Instructions only on Netlify */}
          {isNetlify && <NetworkInstructions />}
          
          {/* Mobile detection notice */}
          {isMobile && mobileInstructions}
          
          {/* Wallet selection section */}
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Select Your Wallet</h3>
            
            {isMobile ? (
              // Mobile-optimized wallet selector
              <Tabs defaultValue="mobile" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="mobile">Mobile Wallets</TabsTrigger>
                  <TabsTrigger value="desktop">Desktop/Other</TabsTrigger>
                </TabsList>
                
                <TabsContent value="mobile" className="mt-4">
                  <div className="space-y-2">
                    {walletOptions
                      .filter(w => w.supportsMobile)
                      .map((wallet, index) => (
                        <button
                          key={index}
                          className={`flex items-center p-4 rounded-lg w-full ${
                            wallet.available 
                              ? "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700" 
                              : "bg-gray-100/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400"
                          } transition-colors border border-transparent ${
                            wallet.available ? "hover:border-primary" : ""
                          }`}
                          onClick={wallet.handler}
                          disabled={isConnecting || !wallet.available}
                        >
                          <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mr-4">
                            <img src={wallet.icon} alt={wallet.name} className={`w-7 h-7 ${!wallet.available ? "opacity-50" : ""}`} />
                          </div>
                          <div className="text-left flex-grow">
                            <div className="flex items-center justify-between">
                              <span className="text-base font-medium block">{wallet.name}</span>
                              {wallet.installed && <Check size={18} className="text-emerald-500" />}
                              {wallet.id === "veworld" && !wallet.installed && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {wallet.installed ? wallet.description : "Tap to connect"}
                            </span>
                          </div>
                        </button>
                    ))}
                    
                    {walletOptions.filter(w => w.supportsMobile).length === 0 && (
                      <p className="text-center text-gray-500 py-4">No mobile wallets available</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="desktop" className="mt-4">
                  <div className="space-y-2">
                    {walletOptions
                      .filter(w => !w.supportsMobile || w.type === "desktop")
                      .map((wallet, index) => (
                        <button
                          key={index}
                          className={`flex items-center p-4 rounded-lg w-full ${
                            wallet.available 
                              ? "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700" 
                              : "bg-gray-100/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400"
                          } transition-colors border border-transparent ${
                            wallet.available ? "hover:border-primary" : ""
                          }`}
                          onClick={wallet.handler}
                          disabled={isConnecting || !wallet.available}
                        >
                          <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mr-4">
                            <img src={wallet.icon} alt={wallet.name} className={`w-7 h-7 ${!wallet.available ? "opacity-50" : ""}`} />
                          </div>
                          <div className="text-left flex-grow">
                            <div className="flex items-center justify-between">
                              <span className="text-base font-medium block">{wallet.name}</span>
                              {wallet.type === "desktop" && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                  Desktop
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {wallet.description}
                            </span>
                          </div>
                        </button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              // Desktop UI (original layout)
              <>
                {/* Browser Wallet Section */}
                <div className="mb-4">
                  <h4 className="text-xs font-medium mb-2 text-primary">Browser Extensions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {walletOptions.filter(w => w.type === "browser").map((wallet, index) => (
                      <button
                        key={index}
                        className={`flex items-center p-3 rounded-lg ${
                          wallet.installed 
                            ? "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700" 
                            : "bg-gray-100/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400"
                        } transition-colors border border-transparent ${
                          wallet.installed ? "hover:border-primary" : ""
                        }`}
                        onClick={wallet.handler}
                        disabled={isConnecting || !wallet.available}
                        title={wallet.installed ? wallet.description : `${wallet.name} not detected. Please install the extension.`}
                      >
                        <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                          <img src={wallet.icon} alt={wallet.name} className={`w-6 h-6 ${!wallet.installed ? "opacity-50" : ""}`} />
                        </div>
                        <div className="text-left flex-grow">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium block">{wallet.name}</span>
                            {wallet.installed && <Check size={16} className="text-emerald-500" />}
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {wallet.installed ? wallet.description : "Not installed"}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Desktop Wallet Section */}
                <div className="mb-4">
                  <h4 className="text-xs font-medium mb-2 text-primary">Desktop Applications</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {walletOptions.filter(w => w.type === "desktop").map((wallet, index) => (
                      <button
                        key={index}
                        className="flex items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-primary"
                        onClick={wallet.handler}
                        disabled={isConnecting}
                        title={wallet.description}
                      >
                        <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                          <img src={wallet.icon} alt={wallet.name} className="w-6 h-6" />
                        </div>
                        <div className="text-left flex-grow">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium block">{wallet.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              Desktop App
                            </span>
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">{wallet.description}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Other Connection Methods */}
                {walletOptions.filter(w => w.type === "protocol").length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium mb-2 text-primary">Other Connection Methods</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {walletOptions.filter(w => w.type === "protocol").map((wallet, index) => (
                        <button
                          key={index}
                          className={`flex items-center p-3 rounded-lg transition-colors border border-transparent 
                            ${wallet.available
                               ? "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-primary"
                               : "bg-gray-100/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400"
                            }`}
                          onClick={wallet.handler}
                          disabled={isConnecting || !wallet.available}
                          title={wallet.available ? wallet.description : `${wallet.name} not available in this environment`}
                        >
                          <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                            <img 
                              src={wallet.icon} 
                              alt={wallet.name} 
                              className={`w-6 h-6 ${!wallet.available ? "opacity-50" : ""}`} 
                            />
                          </div>
                          <div className="text-left flex-grow">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium block">{wallet.name}</span>
                              {wallet.type === "protocol" && wallet.available && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                  Available
                                </span>
                              )}
                              {wallet.type === "protocol" && !wallet.available && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                                  Coming Soon
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">{wallet.description}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Connection instructions based on device type */}
          {isMobile ? (
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <div className="flex items-start">
                <PhoneCall className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-medium mb-1">Mobile Wallet Tips</p>
                  <p className="text-xs">For the best experience on mobile, make sure your wallet app is already installed. Some wallets may prompt you to switch between apps during connection.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-medium mb-1">Desktop Wallet Connection</p>
                  <p className="text-xs">Desktop wallets like Sync and Sync2 will open in a separate application. 
                  Make sure you have installed the application and follow the prompts to connect.</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-sm text-gray-500 text-center">
          <p>By connecting your wallet, you agree to our Terms of Service and Privacy Policy</p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
