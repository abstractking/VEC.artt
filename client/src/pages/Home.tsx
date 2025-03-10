import { useEffect } from "react";
import Hero from "@/components/Hero";
import TopCollections from "@/components/TopCollections";
import TrendingNFTs from "@/components/TrendingNFTs";
import CreatorSpotlight from "@/components/CreatorSpotlight";
import CreateAndSell from "@/components/CreateAndSell";
import Newsletter from "@/components/Newsletter";
import NFTShuffle from "@/components/NFTShuffle";
import RandomArtGallery from "@/components/RandomArtGallery";
import TransactionTest from "@/components/TransactionTest";
import TestNetGuide from "@/components/TestNetGuide";
import NetworkInstructions from "@/components/NetworkInstructions";
import { useQuery } from "@tanstack/react-query";
import type { Collection, NFT } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();
  
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
      {/* Network Instructions Panel - Always Visible */}
      <div className="w-full bg-blue-100 dark:bg-blue-900 py-4 sticky top-16 z-30 shadow-lg border-y-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-3">
            <span className="inline-block px-4 py-1 bg-blue-600 text-white font-bold rounded-full text-sm">TESTNET SETUP REQUIRED</span>
          </div>
          <NetworkInstructions />
        </div>
      </div>
      
      <Hero />
      
      {/* TestNet Guide for Netlify deployments */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <TestNetGuide />
      </section>
      
      {/* NFT Shuffle Component - auto-rotating featured NFTs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Featured NFTs</h2>
          <p className="text-muted-foreground">Discover unique digital assets rotating every 20 seconds</p>
        </div>
        <div className="grid grid-cols-1 gap-8">
          <NFTShuffle nfts={nfts || []} interval={20000} isLoading={nftsLoading} />
        </div>
      </section>
      
      <TopCollections 
        collections={collections || []} 
        isLoading={collectionsLoading} 
      />
      
      {/* Random Art Gallery */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <RandomArtGallery
          nfts={nfts || []} 
          isLoading={nftsLoading}
        />
      </section>
      
      <TrendingNFTs 
        nfts={nfts || []} 
        isLoading={nftsLoading} 
      />
      
      <CreatorSpotlight />
      
      <CreateAndSell />
      
      {/* Show transaction test component only when user is logged in */}
      {user && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gradient-to-b from-background to-accent/10">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Notification System</h2>
            <p className="text-muted-foreground">Test the real-time WebSocket notification system with simulated transactions and direct notifications</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <TransactionTest />
          </div>
        </section>
      )}
      
      <Newsletter />
    </div>
  );
}
