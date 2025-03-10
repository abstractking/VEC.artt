import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Menu, X, Search, LogOut, Wallet, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/useVechain";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationCenter from "@/components/NotificationCenter";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

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

          {/* Desktop Search */}
          <div className="hidden md:flex items-center relative">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search items, collections, and accounts"
                className="border border-input rounded-full px-4 py-2 pl-10 w-64 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
            
            {/* Notification Center */}
            {isConnected && (
              <div className="hidden md:block">
                <NotificationCenter />
              </div>
            )}
            
            {/* Wallet Balance for Desktop */}
            {isConnected && (
              <div className="hidden md:flex items-center bg-muted/50 rounded-full px-3 py-1.5 mr-2">
                <Wallet className="h-4 w-4 text-primary mr-1.5" />
                <span className="text-sm font-medium">
                  {walletBalance.vet} VET
                </span>
              </div>
            )}
            
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
                  <DropdownMenuItem asChild>
                    <Link href={user ? `/profile/${user.id}` : "/profile"} className="cursor-pointer">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/create" className="cursor-pointer">
                      Create NFT
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/badges" className="cursor-pointer flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-amber-500" />
                      Achievement Badges
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <div 
                      className="flex items-center text-destructive cursor-pointer"
                      onClick={handleDisconnectWallet}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Disconnect Wallet
                    </div>
                  </DropdownMenuItem>
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
          <div className="flex flex-col space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search items, collections, and accounts"
                className="border border-input rounded-full px-4 py-2 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-muted-foreground h-5 w-5" />
            </form>
            
            <Link 
              href="/" 
              className="font-medium text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            
            <Link 
              href="/explore" 
              className="font-medium text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Explore
            </Link>
            
            <Link 
              href="/create" 
              className="font-medium text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Create
            </Link>
            
            <Link 
              href="/artists" 
              className="font-medium text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Artists
            </Link>
            
            {/* Wallet balance for mobile */}
            {isConnected && (
              <div className="flex items-center bg-muted/50 rounded-full px-3 py-1.5">
                <Wallet className="h-4 w-4 text-primary mr-1.5" />
                <span className="text-sm font-medium">
                  {walletBalance.vet} VET
                </span>
              </div>
            )}
            
            {isConnected ? (
              <>
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
                
                <Link 
                  href="/badges"
                  className="font-medium text-foreground hover:text-primary transition-colors py-2 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                  Achievement Badges
                </Link>
                
                <div 
                  className="flex items-center text-destructive font-medium py-2 cursor-pointer"
                  onClick={handleDisconnectWallet}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Disconnect Wallet
                </div>
              </>
            ) : (
              <Button
                onClick={handleConnectWallet}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full transition-colors font-semibold focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Connect Wallet
              </Button>
            )}
            
            {/* Mobile Notification Center */}
            {isConnected && (
              <div className="py-2">
                <NotificationCenter />
              </div>
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
