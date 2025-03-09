import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="bg-background py-16 md:py-24">
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
          <div className="md:w-1/2">
            <div className="relative">
              {/* NFT Showcase */}
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
              {/* Secondary NFT peeking from behind */}
              <div className="absolute top-6 -left-6 w-4/5 h-auto bg-card p-3 rounded-lg shadow-xl transform -rotate-6 z-10 border border-border">
                <div className="relative w-full h-0 pb-[75%]">
                  <div className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center">
                    <svg className="w-16 h-16 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 text-center">
          <div className="bg-card border border-border p-6 rounded-lg">
            <div className="text-3xl font-bold mb-2 text-foreground">25K+</div>
            <div className="text-muted-foreground">NFT Items</div>
          </div>
          <div className="bg-card border border-border p-6 rounded-lg">
            <div className="text-3xl font-bold mb-2 text-foreground">12K+</div>
            <div className="text-muted-foreground">Artists</div>
          </div>
          <div className="bg-card border border-border p-6 rounded-lg">
            <div className="text-3xl font-bold mb-2 text-foreground">8.5M</div>
            <div className="text-muted-foreground">Trading Volume</div>
          </div>
          <div className="bg-card border border-border p-6 rounded-lg">
            <div className="text-3xl font-bold mb-2 text-foreground">100%</div>
            <div className="text-muted-foreground">Secured by VeChain</div>
          </div>
        </div>
      </div>
    </section>
  );
}
