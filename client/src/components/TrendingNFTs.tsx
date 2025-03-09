import { useState } from "react";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { NFT } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import NFTCard from "./NFTCard";

interface TrendingNFTsProps {
  nfts: NFT[];
  isLoading: boolean;
}

export default function TrendingNFTs({ nfts, isLoading }: TrendingNFTsProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Filter NFTs by category if needed
  const filteredNFTs = nfts?.filter((nft) => {
    if (activeCategory === "all") return true;
    if (!nft.metadata) return false;
    
    // Safely access category by casting metadata to any
    const metadata = nft.metadata as any;
    return metadata.category === activeCategory;
  });
  
  // Display up to 4 NFTs
  const displayedNFTs = filteredNFTs?.slice(0, 4) || [];

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <Skeleton className="h-10 w-64" />
            <div className="hidden md:flex space-x-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-24 rounded-full" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-card rounded-xl shadow-sm border border-border">
                <Skeleton className="w-full h-64 rounded-t-xl" />
                <div className="p-5">
                  <div className="flex items-center mb-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="ml-2">
                      <Skeleton className="h-3 w-16 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <div className="flex justify-between items-center">
                    <div>
                      <Skeleton className="h-3 w-20 mb-1" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-9 w-24 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold font-poppins text-foreground">Trending NFTs</h2>
          <div className="hidden md:flex space-x-2">
            <button 
              className={`bg-card border border-border rounded-full px-4 py-2 font-medium text-foreground hover:bg-muted transition-colors ${
                activeCategory === 'all' ? 'bg-primary text-primary-foreground border-primary' : ''
              }`}
              onClick={() => setActiveCategory('all')}
            >
              All
            </button>
            <button 
              className={`bg-card border border-border rounded-full px-4 py-2 font-medium text-foreground hover:bg-muted transition-colors ${
                activeCategory === 'art' ? 'bg-primary text-primary-foreground border-primary' : ''
              }`}
              onClick={() => setActiveCategory('art')}
            >
              Art
            </button>
            <button 
              className={`bg-card border border-border rounded-full px-4 py-2 font-medium text-foreground hover:bg-muted transition-colors ${
                activeCategory === 'collectibles' ? 'bg-primary text-primary-foreground border-primary' : ''
              }`}
              onClick={() => setActiveCategory('collectibles')}
            >
              Collectibles
            </button>
            <button 
              className={`bg-card border border-border rounded-full px-4 py-2 font-medium text-foreground hover:bg-muted transition-colors ${
                activeCategory === 'photography' ? 'bg-primary text-primary-foreground border-primary' : ''
              }`}
              onClick={() => setActiveCategory('photography')}
            >
              Photography
            </button>
          </div>
          <select 
            className="md:hidden bg-card border border-border rounded-full px-4 py-2 font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
          >
            <option value="all">All</option>
            <option value="art">Art</option>
            <option value="collectibles">Collectibles</option>
            <option value="photography">Photography</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedNFTs.length > 0 ? (
            displayedNFTs.map((nft) => (
              <NFTCard key={nft.id} nft={nft} />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">No NFTs available in this category yet.</p>
              <Link href="/create">
                <Button className="mt-4">
                  Create an NFT
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link href="/explore">
            <Button variant="secondary" className="font-semibold py-3 px-8 rounded-full">
              Explore more NFTs
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
