import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { NFT } from "@shared/schema";

interface RandomArtGalleryProps {
  nfts?: NFT[];
  isLoading?: boolean;
}

export default function RandomArtGallery({ nfts = [], isLoading = false }: RandomArtGalleryProps) {
  const [featuredNFT, setFeaturedNFT] = useState<NFT | null>(null);

  // Function to get a random NFT
  const getRandomNFT = () => {
    if (nfts.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * nfts.length);
    return nfts[randomIndex];
  };

  // Initialize with random NFT and update every 20 minutes
  useEffect(() => {
    if (nfts.length > 0) {
      setFeaturedNFT(getRandomNFT());

      // Update every 20 minutes
      const interval = setInterval(() => {
        setFeaturedNFT(getRandomNFT());
      }, 20 * 60 * 1000); // 20 minutes in milliseconds

      return () => clearInterval(interval);
    }
  }, [nfts]);

  // Handle manual refresh
  const handleRefresh = () => {
    setFeaturedNFT(getRandomNFT());
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured NFT</h2>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <Skeleton className="w-full h-[400px]" />
          <div className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!featuredNFT) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured NFT</h2>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <div className="bg-card rounded-xl p-8 text-center border border-border">
          <p className="text-muted-foreground">No artwork available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured NFT</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      <Link href={`/nft/${featuredNFT.id}`} className="block">
        <div className="bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow border border-border cursor-pointer">
          <div className="w-full h-[400px] bg-muted rounded-t-xl overflow-hidden">
            {featuredNFT.imageUrl ? (
              <img
                src={featuredNFT.imageUrl}
                alt={featuredNFT.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const imgElement = e.target as HTMLImageElement;
                  imgElement.src = `https://placehold.co/600x400/3a4852/ffffff?text=${encodeURIComponent(featuredNFT.name || 'NFT')}`;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-12 h-12 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="p-6">
            <h3 className="font-bold text-foreground text-xl mb-2">{featuredNFT.name}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{featuredNFT.description}</p>
            <div className="flex justify-between items-center">
              <p className="text-sm">
                {featuredNFT.isForSale 
                  ? <span className="text-primary font-medium">{featuredNFT.price} {featuredNFT.currency}</span>
                  : <span className="text-muted-foreground">Not for sale</span>
                }
              </p>
              <div className="bg-primary text-primary-foreground py-2 px-4 rounded-md text-sm font-medium">
                View Details
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}