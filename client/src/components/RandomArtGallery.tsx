import { useState, useEffect } from "react";
import { Link } from "wouter";
import { NFT } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

interface RandomArtGalleryProps {
  nfts?: NFT[];
  isLoading?: boolean;
}

export default function RandomArtGallery({ nfts = [], isLoading = false }: RandomArtGalleryProps) {
  const [randomNfts, setRandomNfts] = useState<NFT[]>([]);

  // Function to get random NFTs
  const getRandomNfts = () => {
    if (nfts.length === 0) return [];
    
    // Create a copy of the array to avoid modifying the original
    const nftsCopy = [...nfts];
    const result: NFT[] = [];
    const count = Math.min(3, nftsCopy.length);
    
    // Select random NFTs
    for (let i = 0; i < count; i++) {
      if (nftsCopy.length === 0) break;
      
      // Get a random index
      const randomIndex = Math.floor(Math.random() * nftsCopy.length);
      // Add the NFT to the result
      result.push(nftsCopy[randomIndex]);
      // Remove the NFT from the copy to avoid duplicates
      nftsCopy.splice(randomIndex, 1);
    }
    
    return result;
  };

  // Initialize with random NFTs
  useEffect(() => {
    if (nfts.length > 0) {
      setRandomNfts(getRandomNfts());
    }
  }, [nfts]);

  // Handle refresh
  const handleRefresh = () => {
    setRandomNfts(getRandomNfts());
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Random Art Gallery</h2>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <Skeleton className="w-full h-64" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Random Art Gallery</h2>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <div className="bg-card rounded-xl p-8 text-center border border-border">
          <p className="text-muted-foreground">No artwork available yet. Add some NFTs to see them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Random Art Gallery</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {randomNfts.map((nft) => (
          <Link key={nft.id} href={`/nft/${nft.id}`} className="block w-full">
            <div className="bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow border border-border cursor-pointer h-full">
              <div className="w-full h-64 bg-muted rounded-t-xl overflow-hidden">
                {nft.imageUrl ? (
                  <img
                    src={nft.imageUrl}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const imgElement = e.target as HTMLImageElement;
                      imgElement.src = `https://placehold.co/600x400/3a4852/ffffff?text=${encodeURIComponent(nft.name || 'NFT')}`;
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
              <div className="p-5">
                <h3 className="font-bold text-foreground text-lg mb-2 truncate">{nft.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{nft.description}</p>
                <div className="flex justify-between items-center">
                  <p className="text-sm">
                    {nft.isForSale 
                      ? <span className="text-primary font-medium">{nft.price} {nft.currency}</span>
                      : <span className="text-muted-foreground">Not for sale</span>
                    }
                  </p>
                  <div className="bg-primary text-primary-foreground py-1.5 px-3 rounded-md text-sm font-medium">
                    View
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}