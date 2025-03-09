import { useEffect } from "react";
import Hero from "@/components/Hero";
import TopCollections from "@/components/TopCollections";
import TrendingNFTs from "@/components/TrendingNFTs";
import CreatorSpotlight from "@/components/CreatorSpotlight";
import CreateAndSell from "@/components/CreateAndSell";
import Newsletter from "@/components/Newsletter";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  // Fetch collections for homepage
  const { data: collections, isLoading: collectionsLoading } = useQuery({
    queryKey: ['/api/collections'],
    staleTime: 60000, // Cache for 1 minute
  });

  // Fetch NFTs for homepage
  const { data: nfts, isLoading: nftsLoading } = useQuery({
    queryKey: ['/api/nfts'],
    staleTime: 60000, // Cache for 1 minute
  });

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      
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
