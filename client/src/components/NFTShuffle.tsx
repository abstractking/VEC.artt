import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import NFT type from schema
import type { NFT } from "@shared/schema";

type NFTShuffleProps = {
  nfts?: NFT[]; // NFTs to display in the shuffle
  isLoading?: boolean; // Loading state
  interval?: number; // Rotation interval in milliseconds (default: 20000ms/20s)
  displayCount?: number; // Number of NFTs to display at once
};

/**
 * NFTShuffle Component
 * 
 * Displays a rotating gallery of NFTs with smooth transitions.
 * - Automatically rotates NFTs every 20 seconds
 * - Allows manual navigation with previous/next buttons
 * - Fades in/out NFTs for a smooth transition effect
 * - Adapts to various screen sizes
 */
export default function NFTShuffle({ 
  nfts = [], 
  isLoading = false, 
  interval = 20000, 
  displayCount = 1 
}: NFTShuffleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get the current NFT to display
  const getCurrentNFTs = useCallback(() => {
    if (!nfts || nfts.length === 0) return [];
    
    const result = [];
    for (let i = 0; i < displayCount; i++) {
      const index = (currentIndex + i) % nfts.length;
      result.push(nfts[index]);
    }
    return result;
  }, [nfts, currentIndex, displayCount]);

  // Function to advance to the next NFT
  const goToNext = useCallback(() => {
    if (!nfts || nfts.length === 0) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % nfts.length);
      setIsTransitioning(false);
    }, 300); // Match this with the animation duration
  }, [nfts]);

  // Function to go to the previous NFT
  const goToPrevious = useCallback(() => {
    if (!nfts || nfts.length === 0) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + nfts.length) % nfts.length);
      setIsTransitioning(false);
    }, 300); // Match this with the animation duration
  }, [nfts]);

  // Set up the automatic rotation timer
  useEffect(() => {
    if (!nfts || nfts.length <= 1) return; // Don't rotate if there's only one NFT or none
    
    const timer = setInterval(goToNext, interval);
    
    // Clean up the timer when the component unmounts
    return () => clearInterval(timer);
  }, [nfts, interval, goToNext]);

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-lg overflow-hidden bg-card">
        <Skeleton className="h-[300px] w-full" />
        <div className="p-6">
          <Skeleton className="h-6 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  // We no longer need the error state since we're not doing our own query

  // Empty state
  if (!nfts || nfts.length === 0) {
    return (
      <div className="rounded-lg overflow-hidden border border-border bg-card p-6 text-center">
        <p className="text-muted-foreground mb-4">No NFTs available for showcase</p>
        <Link href="/create">
          <Button>Create Your First NFT</Button>
        </Link>
      </div>
    );
  }

  const currentNFTs = getCurrentNFTs();

  return (
    <div className="relative rounded-lg overflow-hidden border border-border bg-card">
      {/* Navigation buttons */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-background/80 text-foreground hover:bg-background"
          onClick={goToPrevious}
          aria-label="Previous NFT"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-background/80 text-foreground hover:bg-background"
          onClick={goToNext}
          aria-label="Next NFT"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* NFT Display */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {currentNFTs.map((nft: NFT) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: isTransitioning ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="aspect-[4/3] relative">
                <img 
                  src={nft.imageUrl} 
                  alt={nft.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl md:text-2xl font-bold mb-2 line-clamp-1">{nft.name}</h3>
                <p className="mb-4 text-sm md:text-base opacity-90 line-clamp-2">{nft.description}</p>
                <Link href={`/nft/${nft.id}`}>
                  <Button className="w-full">View Details</Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination dots */}
      {nfts.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2 z-10">
          {Array.from({ length: nfts.length }).map((_, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex ? 'bg-primary' : 'bg-white/40'
              }`}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentIndex(i);
                  setIsTransitioning(false);
                }, 300);
              }}
              aria-label={`Go to NFT ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}