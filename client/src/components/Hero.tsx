import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { NFT } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Fetch NFTs for showcase
  const { data: nfts, isLoading } = useQuery<NFT[]>({
    queryKey: ['/api/nfts'],
    select: (data: NFT[]) => {
      // Get up to 5 NFTs for the showcase
      if (Array.isArray(data)) {
        return data.slice(0, 5);
      }
      return [];
    }
  });
  
  // Function to go to the next NFT
  const goToNext = () => {
    if (!nfts || nfts.length <= 1) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % nfts.length);
      setIsTransitioning(false);
    }, 300);
  };

  // Function to go to the previous NFT
  const goToPrevious = () => {
    if (!nfts || nfts.length <= 1) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + nfts.length) % nfts.length);
      setIsTransitioning(false);
    }, 300);
  };
  
  // Set up automatic rotation
  useEffect(() => {
    if (!nfts || nfts.length <= 1) return;
    
    const timer = setInterval(() => {
      goToNext();
    }, 20000); // Rotate every 20 seconds
    
    return () => clearInterval(timer);
  }, [nfts]);
  
  // Get the current NFT to display
  const currentNFT = nfts && nfts.length > 0 ? nfts[currentIndex] : null;
  // Get the previous NFT to create the stacked effect
  const prevIndex = currentIndex === 0 ? (nfts?.length ?? 0) - 1 : currentIndex - 1;
  const prevNFT = nfts && nfts.length > 0 ? nfts[prevIndex] : null;
  
  return (
    <section className="bg-background py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-poppins text-foreground">
              Discover, Collect & Sell <span className="text-primary">NFTs</span> on VeChain
            </h1>
            <p className="text-lg mb-8 text-muted-foreground">
              The premier decentralized marketplace for VeChain NFTs. Buy, sell, and collect unique digital assets powered by VeChain blockchain technology.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/explore">
                <Button className="px-6 py-3 rounded-full font-poppins font-semibold text-center w-full sm:w-auto">
                  Explore NFTs
                </Button>
              </Link>
              <Link href="/create">
                <Button variant="outline" className="px-6 py-3 rounded-full font-poppins font-semibold text-center w-full sm:w-auto">
                  Create NFT
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2 w-full">
            <div className="relative">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="w-full aspect-square rounded-xl" />
                </div>
              ) : nfts && nfts.length > 0 ? (
                <>
                  {/* Navigation buttons for larger screens */}
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 z-30 hidden md:block">
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
                  
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 z-30 hidden md:block">
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
                  
                  {/* Secondary NFT (previous one peeking from behind) */}
                  {prevNFT && (
                    <div className="absolute top-6 -left-6 w-4/5 h-auto md:block hidden bg-card p-3 rounded-lg shadow-xl transform -rotate-6 z-10 border border-border">
                      <Link href={`/nft/${prevNFT.id}`} className="block cursor-pointer">
                        <div className="relative w-full h-0 pb-[75%] overflow-hidden rounded-lg">
                          {prevNFT.imageUrl ? (
                            <img 
                              src={prevNFT.imageUrl} 
                              alt={prevNFT.name}
                              className="absolute inset-0 w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center">
                              <svg className="w-16 h-16 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  )}
                  
                  {/* Main NFT Showcase with animation */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentNFT?.id || 'placeholder'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isTransitioning ? 0 : 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-card p-3 rounded-lg shadow-xl transform md:rotate-3 z-20 relative border border-border"
                    >
                      {currentNFT ? (
                        <Link href={`/nft/${currentNFT.id}`} className="block cursor-pointer">
                          <div className="relative w-full aspect-square overflow-hidden rounded-lg">
                            {currentNFT.imageUrl ? (
                              <img 
                                src={currentNFT.imageUrl} 
                                alt={currentNFT.name}
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                                <svg className="w-16 h-16 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="absolute bottom-6 left-6 right-6 bg-background/90 backdrop-blur-sm p-4 rounded-lg border border-border">
                            <h3 className="font-poppins font-bold text-foreground">{currentNFT.name}</h3>
                            <div className="flex justify-between items-center mt-2">
                              <div className="flex items-center">
                                <div className="rounded-full w-8 h-8 bg-primary/20 flex items-center justify-center text-primary font-semibold">
                                  {currentNFT.creatorId ? `${currentNFT.creatorId}`.charAt(0) : "A"}
                                </div>
                                <span className="ml-2 text-sm text-muted-foreground">
                                  @{currentNFT.creatorId ? `user${currentNFT.creatorId}` : "digitalartist"}
                                </span>
                              </div>
                              <div className="text-primary font-semibold">
                                {currentNFT.price || "—"} {currentNFT.currency || "VET"}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <>
                          <div className="relative w-full aspect-square overflow-hidden rounded-lg">
                            <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                              <svg className="w-16 h-16 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          </div>
                          <div className="absolute bottom-6 left-6 right-6 bg-background/90 backdrop-blur-sm p-4 rounded-lg border border-border">
                            <h3 className="font-poppins font-bold text-foreground">Cosmic Wanderer #371</h3>
                            <div className="flex justify-between items-center mt-2">
                              <div className="flex items-center">
                                <div className="rounded-full w-8 h-8 bg-primary/20 flex items-center justify-center text-primary font-semibold">
                                  A
                                </div>
                                <span className="ml-2 text-sm text-muted-foreground">
                                  @digitalartist
                                </span>
                              </div>
                              <div className="text-primary font-semibold">
                                5.2 VET
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Pagination dots */}
                  {nfts.length > 1 && (
                    <div className="absolute -bottom-8 left-0 right-0 flex justify-center space-x-2">
                      {nfts.map((_, i: number) => (
                        <button
                          key={i}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i === currentIndex ? 'bg-primary' : 'bg-muted'
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
                </>
              ) : (
                <div className="bg-card p-3 rounded-lg shadow-xl transform rotate-3 z-20 relative border border-border">
                  <div className="relative w-full h-0 pb-[100%]">
                    <div className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center">
                      <svg className="w-16 h-16 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 bg-background/90 backdrop-blur-sm p-4 rounded-lg border border-border">
                    <h3 className="font-poppins font-bold text-foreground">Cosmic Wanderer #371</h3>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center">
                        <div className="rounded-full w-8 h-8 bg-muted"></div>
                        <span className="ml-2 text-sm text-muted-foreground">@digitalartist</span>
                      </div>
                      <div className="text-primary font-semibold">5.2 VET</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 text-center">
          <div className="bg-card border border-border p-5 md:p-6 rounded-lg">
            <div className="text-2xl md:text-3xl font-bold mb-2 text-foreground">25K+</div>
            <div className="text-muted-foreground text-sm md:text-base">NFT Items</div>
          </div>
          <div className="bg-card border border-border p-5 md:p-6 rounded-lg">
            <div className="text-2xl md:text-3xl font-bold mb-2 text-foreground">12K+</div>
            <div className="text-muted-foreground text-sm md:text-base">Artists</div>
          </div>
          <div className="bg-card border border-border p-5 md:p-6 rounded-lg">
            <div className="text-2xl md:text-3xl font-bold mb-2 text-foreground">8.5M</div>
            <div className="text-muted-foreground text-sm md:text-base">Trading Volume</div>
          </div>
          <div className="bg-card border border-border p-5 md:p-6 rounded-lg">
            <div className="text-2xl md:text-3xl font-bold mb-2 text-foreground">100%</div>
            <div className="text-muted-foreground text-sm md:text-base">Secured by VeChain</div>
          </div>
        </div>
      </div>
    </section>
  );
}
