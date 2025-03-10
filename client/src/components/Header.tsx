import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Menu, X, Search, LogOut, Wallet, Trophy, User, BadgeCheck, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/useVechain";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationCenter from "@/components/NotificationCenter";
import NetworkIndicator from "@/components/NetworkIndicator";
import FaucetLink from "@/components/FaucetLink";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Header() {
  const [, navigate] = useLocation();
  const { isConnected, connectWallet, disconnectWallet, walletAddress, walletBalance } = useWallet();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  const handleConnectWallet = async () => {
    await connectWallet();
    setIsMenuOpen(false);
  };
  
  const handleDisconnectWallet = () => {
    disconnectWallet();
    setIsMenuOpen(false);
  };

  // Check if page is scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 bg-background ${isScrolled ? 'shadow-md' : ''} transition-shadow duration-300`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-primary font-bold text-2xl cursor-pointer">
              <span className="text-foreground">Ve</span>Collab
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="font-medium text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/explore" className="font-medium text-foreground hover:text-primary transition-colors">
              Explore
            </Link>
            <Link href="/create" className="font-medium text-foreground hover:text-primary transition-colors">
              Create
            </Link>
            <Link href="/artists" className="font-medium text-foreground hover:text-primary transition-colors">
              Artists
            </Link>
          </nav>

          {/* Desktop Search and Notification */}
          <div className="hidden md:flex items-center space-x-2">
            {isConnected && <NotificationCenter />}
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search items..."
                className="border border-input rounded-full px-4 py-2 pl-10 w-48 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-muted-foreground h-5 w-5" />
            </form>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            
            {isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="hidden md:flex items-center cursor-pointer hover:opacity-90 transition-opacity">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold mr-2">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="font-medium text-foreground">
                      {user?.username || "Profile"}
                    </span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <ScrollArea className="h-80 rounded-md">
                    {/* Profile - First in the list */}
                    <DropdownMenuItem asChild>
                      <Link href={user ? `/profile/${user.id}` : "/profile"} className="cursor-pointer flex items-center">
                        <User className="h-4 w-4 mr-2 text-primary" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    
                    {/* Wallet Balance - Second item */}
                    <DropdownMenuItem asChild>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <Wallet className="h-4 w-4 mr-2 text-green-600" />
                          <span>{walletBalance.vet} VET</span>
                        </div>
                        <NetworkIndicator />
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <FaucetLink />
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Artist section with Achievements underneath */}
                    <DropdownMenuItem asChild>
                      <Link href="/artists" className="cursor-pointer flex items-center">
                        <BadgeCheck className="h-4 w-4 mr-2 text-blue-500" />
                        Artists
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/badges" className="cursor-pointer flex items-center">
                        <Trophy className="h-4 w-4 mr-2 text-amber-500" />
                        Achievements
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Other menu items */}
                    <DropdownMenuItem asChild>
                      <Link href="/create" className="cursor-pointer flex items-center">
                        <ScrollText className="h-4 w-4 mr-2 text-purple-500" />
                        Create NFT
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/" className="cursor-pointer flex items-center">
                        <span className="text-blue-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                          </svg>
                        </span>
                        Home
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/explore" className="cursor-pointer flex items-center">
                        <Search className="h-4 w-4 mr-2 text-blue-400" />
                        Explore
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <div 
                        className="flex items-center text-destructive cursor-pointer"
                        onClick={handleDisconnectWallet}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Disconnect Wallet
                      </div>
                    </DropdownMenuItem>
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={handleConnectWallet}
                className="hidden md:block bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full transition-colors font-semibold focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Connect Wallet
              </Button>
            )}
            
            <button
              onClick={toggleMenu}
              className="md:hidden text-foreground"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden bg-background ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="flex items-center space-x-2 pb-3">
              {isConnected && <NotificationCenter />}
              <form onSubmit={handleSearch} className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search items..."
                  className="border border-input rounded-full px-4 py-2 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-muted-foreground h-5 w-5" />
              </form>
            </div>
              
            {/* Profile section - top priority */}
            {isConnected && (
              <Link 
                href={user ? `/profile/${user.id}` : "/profile"}
                className="font-medium text-foreground hover:text-primary transition-colors py-2 flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold mr-2">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <span>{user?.username || "Profile"}</span>
              </Link>
            )}
            
            {/* Wallet balance for mobile */}
            {isConnected && (
              <div className="flex items-center bg-muted/50 rounded-full px-3 py-1.5">
                <Wallet className="h-4 w-4 text-green-600 mr-1.5" />
                <span className="text-sm font-medium">
                  {walletBalance.vet} VET
                </span>
              </div>
            )}
            
            <div className="h-px w-full bg-border my-2"></div>
            
            <Link 
              href="/" 
              className="font-medium text-foreground hover:text-primary transition-colors py-2 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </span>
              Home
            </Link>

            <Link 
              href="/artists" 
              className="font-medium text-foreground hover:text-primary transition-colors py-2 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <BadgeCheck className="h-5 w-5 mr-2 text-blue-500" />
              Artists
            </Link>
            
            <Link 
              href="/badges"
              className="font-medium text-foreground hover:text-primary transition-colors py-2 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <Trophy className="h-5 w-5 mr-2 text-amber-500" />
              Achievements
            </Link>
            
            <div className="h-px w-full bg-border my-2"></div>
            
            <Link 
              href="/explore" 
              className="font-medium text-foreground hover:text-primary transition-colors py-2 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <Search className="h-5 w-5 mr-2 text-primary" />
              Explore
            </Link>
            
            <Link 
              href="/create" 
              className="font-medium text-foreground hover:text-primary transition-colors py-2 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <ScrollText className="h-5 w-5 mr-2 text-purple-500" />
              Create
            </Link>
            
            <div className="h-px w-full bg-border my-2"></div>
            
            {isConnected ? (
              <div 
                className="flex items-center text-destructive font-medium py-2 cursor-pointer"
                onClick={handleDisconnectWallet}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Disconnect Wallet
              </div>
            ) : (
              <Button
                onClick={handleConnectWallet}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full transition-colors font-semibold focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Connect Wallet
              </Button>
            )}
            
            <div className="flex justify-center py-2">
              <ThemeToggle />
            </div>
            </div>
        </div>
      </div>
    </header>
  );
}
