import { Link } from "wouter";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface CreatorCardProps {
  creator: User;
}

export default function CreatorCard({ creator }: CreatorCardProps) {
  // Fetch NFTs created by this creator
  const { data: createdNFTs } = useQuery({
    queryKey: [`/api/nfts/creator/${creator.id}`],
    enabled: !!creator.id,
  });

  // Get up to 3 NFTs for preview
  const previewNFTs = createdNFTs?.slice(0, 3) || [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col items-center">
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200">
          {creator.profileImage ? (
            <img 
              src={creator.profileImage} 
              alt={creator.username} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold">
              {creator.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1">
          <i className="fas fa-check text-white text-xs"></i>
        </div>
      </div>
      <Link href={`/profile/${creator.id}`}>
        <h3 className="font-bold text-lg mb-1 hover:text-primary transition-colors">
          {creator.username}
        </h3>
      </Link>
      <p className="text-gray-500 text-sm mb-3">@{creator.username.toLowerCase()}</p>
      
      <div className="mb-4">
        <span className="text-primary font-semibold">
          {/* This would be dynamic in a real app */}
          {Math.floor(Math.random() * 500)}K VET
        </span>
        <span className="text-gray-500 text-sm"> volume</span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 w-full mb-4">
        {previewNFTs.length > 0 ? (
          previewNFTs.map((nft: any, index: number) => (
            <div key={index} className="w-full h-12 rounded-md overflow-hidden bg-gray-200">
              {nft.imageUrl && (
                <img 
                  src={nft.imageUrl} 
                  alt={nft.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))
        ) : (
          // If no NFTs, show placeholders
          <>
            <div className="w-full h-12 bg-gray-200 rounded-md"></div>
            <div className="w-full h-12 bg-gray-200 rounded-md"></div>
            <div className="w-full h-12 bg-gray-200 rounded-md"></div>
          </>
        )}
      </div>
      
      <Link href={`/profile/${creator.id}`}>
        <Button className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded-lg transition-colors">
          View Profile
        </Button>
      </Link>
    </div>
  );
}
