import { useEffect } from "react";
import Hero from "@/components/Hero";
import TopCollections from "@/components/TopCollections";
import TrendingNFTs from "@/components/TrendingNFTs";
import CreatorSpotlight from "@/components/CreatorSpotlight";
import CreateAndSell from "@/components/CreateAndSell";
import Newsletter from "@/components/Newsletter";
import NFTShuffle from "@/components/NFTShuffle";
import { useQuery } from "@tanstack/react-query";
import type { Collection, NFT } from "@shared/schema";

export default function Home() {
  // Fetch collections for homepage
  const { data: collections, isLoading: collectionsLoading } = useQuery<Collection[]>({
    queryKey: ['/api/collections'],
    staleTime: 60000, // Cache for 1 minute
  });

  // Fetch NFTs for homepage
  const { data: nfts, isLoading: nftsLoading } = useQuery<NFT[]>({
    queryKey: ['/api/nfts'],
    staleTime: 60000, // Cache for 1 minute
  });

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      
      {/* NFT Shuffle Component - auto-rotating featured NFTs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Featured NFTs</h2>
          <p className="text-muted-foreground">Discover unique digital assets rotating every 20 seconds</p>
        </div>
        <div className="grid grid-cols-1 gap-8">
          <NFTShuffle interval={20000} />
        </div>
      </section>
      
      <TopCollections 
        collections={collections || []} 
        isLoading={collectionsLoading} 
      />
      
      <TrendingNFTs 
        nfts={nfts || []} 
        isLoading={nftsLoading} 
      />
      
      <CreatorSpotlight />
      
      <CreateAndSell />
      
      <Newsletter />
    </div>
  );
}
