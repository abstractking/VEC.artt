import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/useVechain";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  const [, navigate] = useLocation();
  const { isConnected, connectWallet } = useWallet();
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
              <span className="text-secondary">Ve</span>Collab
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="font-medium text-secondary hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/explore" className="font-medium text-secondary hover:text-primary transition-colors">
              Explore
            </Link>
            <Link href="/create" className="font-medium text-secondary hover:text-primary transition-colors">
              Create
            </Link>
            <Link href="/artists" className="font-medium text-secondary hover:text-primary transition-colors">
              Artists
            </Link>
          </nav>

          {/* Desktop Search */}
          <div className="hidden md:flex items-center relative">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search items, collections, and accounts"
                className="border border-gray-300 rounded-full px-4 py-2 pl-10 w-64 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
            </form>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            
            {isConnected ? (
              <Link 
                href={user ? `/profile/${user.id}` : "/profile"} 
                className="hidden md:flex items-center"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold mr-2">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="font-medium text-secondary">
                  {user?.username || "Profile"}
                </span>
              </Link>
            ) : (
              <Button
                onClick={handleConnectWallet}
                className="hidden md:block bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-full transition-colors font-poppins font-semibold"
              >
                Connect Wallet
              </Button>
            )}
            
            <button
              onClick={toggleMenu}
              className="md:hidden text-secondary"
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
                className="border border-gray-300 rounded-full px-4 py-2 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
            </form>
            
            <Link 
              href="/" 
              className="font-medium text-secondary hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            
            <Link 
              href="/explore" 
              className="font-medium text-secondary hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Explore
            </Link>
            
            <Link 
              href="/create" 
              className="font-medium text-secondary hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Create
            </Link>
            
            <Link 
              href="/artists" 
              className="font-medium text-secondary hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Artists
            </Link>
            
            {isConnected ? (
              <Link 
                href={user ? `/profile/${user.id}` : "/profile"}
                className="font-medium text-secondary hover:text-primary transition-colors py-2 flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold mr-2">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <span>{user?.username || "Profile"}</span>
              </Link>
            ) : (
              <Button
                onClick={handleConnectWallet}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-full transition-colors font-poppins font-semibold"
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
