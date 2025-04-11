import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import WalletButton from "@/components/WalletButton";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : 'auto';
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
    <header className={`fixed top-0 left-0 right-0 z-50 bg-background ${isScrolled ? 'shadow-md' : ''} transition-shadow duration-300`}>
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
            <Link href="/games" className="font-medium text-foreground hover:text-primary transition-colors">
              Games 👾
            </Link>
          </nav>
          
          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <WalletButton />
            
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
      <div className={`md:hidden fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="container mx-auto px-4 py-3 min-h-full">
          <div className="flex flex-col space-y-4">
            <Link 
              href="/" 
              className="font-medium text-foreground hover:text-primary transition-colors py-2 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            
            <Link 
              href="/explore" 
              className="font-medium text-foreground hover:text-primary transition-colors py-2 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Explore
            </Link>
            
            <Link 
              href="/create" 
              className="font-medium text-foreground hover:text-primary transition-colors py-2 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Create
            </Link>
            
            <Link 
              href="/artists" 
              className="font-medium text-foreground hover:text-primary transition-colors py-2 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Artists
            </Link>
            
            <Link 
              href="/games" 
              className="font-medium text-foreground hover:text-primary transition-colors py-2 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <span role="img" aria-label="games" className="mr-2">👾</span>
              Games
            </Link>
            
            <div className="py-4">
              <WalletButton />
            </div>
            
            <div className="flex justify-center py-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
