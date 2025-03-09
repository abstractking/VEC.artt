import { useState } from "react";
import { Link } from "wouter";
import { Clock, Tag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NFT } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface NFTCardProps {
  nft: NFT;
}

export default function NFTCard({ nft }: NFTCardProps) {
  // Fetch creator info
  const { data: creator } = useQuery({
    queryKey: [`/api/users/${nft.creatorId}`],
    enabled: !!nft.creatorId,
  });

  // Format remaining time for auctions (placeholder logic)
  const formatTimeRemaining = () => {
    return "5h 12m"; // This would be dynamic in a real application
  };

  return (
    <div className="bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow border border-border">
      <div className="relative group">
        <div className="w-full h-64 bg-muted object-cover rounded-t-xl overflow-hidden">
          {nft.imageUrl ? (
            <img
              src={nft.imageUrl}
              alt={nft.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback on error
                console.log(`Image load error for NFT: ${nft.id}, URL: ${nft.imageUrl?.substring(0, 30)}...`);
                (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/808080/ffffff?text=Image+Unavailable';
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
        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Link href={`/nft/${nft.id}`}>
            <Button className="bg-background text-foreground font-semibold py-2 px-4 rounded-full transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <Eye className="mr-2 h-4 w-4" />
              View NFT
            </Button>
          </Link>
        </div>
        {nft.isForSale && nft.isBiddable && (
          <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm rounded-full py-1 px-3 text-xs font-semibold text-foreground">
            <Clock className="inline mr-1 h-3 w-3" />
            Ending in {formatTimeRemaining()}
          </div>
        )}
        {nft.isForSale && !nft.isBiddable && (
          <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm rounded-full py-1 px-3 text-xs font-semibold text-primary-foreground">
            <Tag className="inline mr-1 h-3 w-3" />
            Buy Now
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
            {creator?.profileImage ? (
              <img
                src={creator.profileImage}
                alt={creator.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xs font-bold">
                {creator?.username?.charAt(0).toUpperCase() || "C"}
              </div>
            )}
          </div>
          <div className="ml-2">
            <p className="text-xs text-muted-foreground">Creator</p>
            <p className="text-sm font-semibold text-foreground">
              {creator?.username ? `@${creator.username}` : `@user${nft.creatorId}`}
            </p>
          </div>
        </div>
        <h3 className="font-bold text-foreground text-lg mb-2">{nft.name}</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-muted-foreground">
              {nft.isForSale 
                ? (nft.isBiddable ? "Current Bid" : "Price") 
                : "Not for sale"}
            </p>
            {nft.isForSale && (
              <p className="text-primary font-semibold">{nft.price} {nft.currency}</p>
            )}
          </div>
          <Link href={`/nft/${nft.id}`}>
            <Button 
              size="sm" 
              variant={nft.isForSale ? "default" : "secondary"}
            >
              {nft.isForSale 
                ? (nft.isBiddable ? "Place bid" : "Buy now") 
                : "View details"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
