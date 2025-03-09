import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NFT } from "@shared/schema";
import NFTCard from "@/components/NFTCard";

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("recent");
  const [priceRange, setPriceRange] = useState("all");

  // Fetch NFTs
  const { data: nfts, isLoading } = useQuery({
    queryKey: ['/api/nfts'],
  });

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter NFTs based on search term and filters
  const filteredNFTs = nfts ? nfts.filter((nft: NFT) => {
    const matchesSearch = searchTerm === "" || 
      nft.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      nft.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = category === "all" || nft.metadata?.category === category;
    
    const matchesPriceRange = priceRange === "all" || (() => {
      const price = parseFloat(nft.price || "0");
      if (priceRange === "under10") return price < 10;
      if (priceRange === "10to50") return price >= 10 && price <= 50;
      if (priceRange === "50to100") return price > 50 && price <= 100;
      if (priceRange === "over100") return price > 100;
      return true;
    })();
    
    return matchesSearch && matchesCategory && matchesPriceRange;
  }) : [];
  
  // Sort NFTs
  const sortedNFTs = [...(filteredNFTs || [])].sort((a: NFT, b: NFT) => {
    if (sort === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sort === "priceAsc") {
      return parseFloat(a.price || "0") - parseFloat(b.price || "0");
    }
    if (sort === "priceDesc") {
      return parseFloat(b.price || "0") - parseFloat(a.price || "0");
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col mb-10">
          <h1 className="text-3xl font-bold font-poppins text-secondary mb-2">
            Explore NFTs
          </h1>
          <p className="text-gray-600">
            Discover, collect, and sell extraordinary NFTs on VeChain's premier marketplace
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-grow">
              <Input
                placeholder="Search NFTs by name or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-6 rounded-full"
              />
              <Search className="absolute left-3 top-3 text-gray-400" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="art">Art</SelectItem>
                  <SelectItem value="collectibles">Collectibles</SelectItem>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under10">Under 10 VET</SelectItem>
                  <SelectItem value="10to50">10 - 50 VET</SelectItem>
                  <SelectItem value="50to100">50 - 100 VET</SelectItem>
                  <SelectItem value="over100">Over 100 VET</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recently Added</SelectItem>
                  <SelectItem value="priceAsc">Price: Low to High</SelectItem>
                  <SelectItem value="priceDesc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* NFT Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm">
                <Skeleton className="h-64 w-full rounded-t-xl" />
                <div className="p-5">
                  <Skeleton className="h-4 w-3/4 mb-3" />
                  <Skeleton className="h-6 w-1/2 mb-3" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-8 w-24 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedNFTs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedNFTs.map((nft: NFT) => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <Filter className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-secondary mb-2">No NFTs Found</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              We couldn't find any NFTs matching your criteria. Try adjusting your filters or search term.
            </p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setCategory("all");
                setPriceRange("all");
                setSort("recent");
              }}
              className="bg-primary hover:bg-primary-dark text-white font-medium"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
