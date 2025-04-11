import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Clock, Tag, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NFT } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "../context/WalletContext";

interface NFTCardProps {
  nft: NFT;
}

export default function NFTCard({ nft }: NFTCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { walletInfo } = useWallet();
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState<boolean>(false);
  
  // Fetch creator info
  const { data: creator } = useQuery({
    queryKey: [`/api/users/${nft.creatorId}`],
    enabled: !!nft.creatorId,
  });

  // Check if NFT is in user's favorites when user changes
  useEffect(() => {
    if (user && nft) {
      // Check if this NFT is in user's favorites
      const favorites = user.favorites || [];
      setIsFavorite(favorites.includes(nft.id));
    }
  }, [user, nft]);

  // Calculate auction time remaining
  useEffect(() => {
    if (!nft?.isBiddable || !nft?.metadata?.auctionEndDate) return;
    
    // Function to update the time remaining display
    const updateTimeRemaining = () => {
      const endDate = new Date(nft.metadata.auctionEndDate);
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft("Ended");
        return;
      }
      
      // Calculate time components
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      // Format time remaining
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };
    
    // Initial update
    updateTimeRemaining();
    
    // Update every minute (less frequent than in detail view)
    const interval = setInterval(updateTimeRemaining, 60000);
    
    // Clean up
    return () => clearInterval(interval);
  }, [nft]);

  // Handle favorite toggle
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail page
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to add items to your favorites",
        variant: "destructive",
      });
      return;
    }

    if (isTogglingFavorite) return;
    
    setIsTogglingFavorite(true);
    
    try {
      const currentFavorites = user.favorites || [];
      const newFavorites = isFavorite 
        ? currentFavorites.filter(id => id !== nft.id)
        : [...currentFavorites, nft.id];
      
      // Update user favorites
      await apiRequest("PATCH", `/api/users/${user.id}`, {
        favorites: newFavorites
      });
      
      // Update local state
      setIsFavorite(!isFavorite);
      
      // Invalidate user queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}`] });
      
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite 
          ? `${nft.name} has been removed from your favorites`
          : `${nft.name} has been added to your favorites`,
      });
    } catch (error) {
      console.error("Favorite toggle error:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  return (
    <Link href={`/nft/${nft.id}`} className="block w-full h-full">
      <div className="bg-card rounded-xl shadow-sm border border-border cursor-pointer h-full transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px] hover:border-primary/30 group">
        <div className="relative overflow-hidden">
          <div className="w-full h-64 bg-muted object-cover rounded-t-xl overflow-hidden">
            {nft.imageUrl ? (
              <img
                src={nft.imageUrl}
                alt={nft.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                onError={(e) => {
                  // Detailed error logging
                  const imgElement = e.target as HTMLImageElement;
                  console.error(`Image load error for NFT: ${nft.id}`, { 
                    url: nft.imageUrl, 
                    error: e 
                  });
                  // Set a more visually appealing placeholder with the NFT name
                  imgElement.src = `https://placehold.co/600x400/3a4852/ffffff?text=${encodeURIComponent(nft.name || 'NFT')}`;
                  // Add a class to style the placeholder
                  imgElement.classList.add('placeholder-img');
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center transition-colors duration-300 group-hover:bg-muted/80">
                <svg className="w-12 h-12 text-muted-foreground transition-transform duration-300 group-hover:scale-110" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            {/* Overlay effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          {/* Favorite button */}
          <button 
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 z-10 
              ${isFavorite 
                ? 'bg-primary/90 text-primary-foreground hover:bg-primary' 
                : 'bg-background/90 text-foreground hover:bg-background hover:text-primary'}
              transform group-hover:scale-110`}
            onClick={toggleFavorite}
          >
            <Heart 
              className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} 
            />
          </button>

          {/* Auction timer */}
          {nft.isForSale && nft.isBiddable && nft.metadata?.auctionEndDate && (
            <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm rounded-full py-1 px-3 text-xs font-semibold text-card-foreground z-10 transition-all duration-300 group-hover:bg-background/100 group-hover:shadow-md">
              <Clock className="inline mr-1 h-3 w-3" />
              {timeLeft === "Ended" ? "Auction ended" : `Ending in ${timeLeft}`}
            </div>
          )}
          
          {/* Buy now tag */}
          {nft.isForSale && !nft.isBiddable && (
            <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm rounded-full py-1 px-3 text-xs font-semibold text-primary-foreground z-10 transition-all duration-300 group-hover:bg-primary group-hover:shadow-md">
              <Tag className="inline mr-1 h-3 w-3" />
              Buy Now
            </div>
          )}
        </div>
        <div className="p-5 transition-colors duration-300 group-hover:bg-card/80">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 rounded-full bg-muted overflow-hidden transition-transform duration-300 group-hover:scale-105">
              {creator?.profileImage ? (
                <img
                  src={creator.profileImage}
                  alt={creator.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xs font-bold transition-colors duration-300 group-hover:bg-primary/20">
                  {creator?.username?.charAt(0).toUpperCase() || "C"}
                </div>
              )}
            </div>
            <div className="ml-2">
              <p className="text-xs text-card-foreground/60 transition-colors duration-300 group-hover:text-card-foreground/80">Creator</p>
              <p className="text-sm font-semibold text-card-foreground transition-all duration-300 group-hover:text-primary">
                {creator?.username ? `@${creator.username}` : `@user${nft.creatorId}`}
              </p>
            </div>
          </div>
          <h3 className="font-bold text-card-foreground text-lg mb-2 transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5">{nft.name}</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-card-foreground/70 transition-colors duration-300 group-hover:text-card-foreground/90">
                {nft.isForSale 
                  ? (nft.isBiddable ? "Current Bid" : "Price") 
                  : "Not for sale"}
              </p>
              {nft.isForSale && (
                <p className="text-primary font-semibold transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary/90">{nft.price} {nft.currency}</p>
              )}
            </div>
            <div 
              className={`py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 
                ${nft.isForSale 
                  ? 'bg-primary text-primary-foreground group-hover:shadow-md group-hover:bg-primary/90' 
                  : 'bg-secondary text-secondary-foreground group-hover:shadow-md group-hover:bg-secondary/90'
                } group-hover:scale-105`}
              onClick={(e) => e.stopPropagation()}
            >
              {nft.isForSale 
                ? (nft.isBiddable ? "Place bid" : "Buy now") 
                : "View details"}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
