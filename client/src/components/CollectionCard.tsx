import { Link } from "wouter";
import { Collection } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface CollectionCardProps {
  collection: Collection;
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  // Fetch creator info
  const { data: creator } = useQuery({
    queryKey: [`/api/users/${collection.creatorId}`],
    enabled: !!collection.creatorId,
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      <Link href={`/collection/${collection.id}`}>
        <div className="relative">
          <div className="w-full h-48 bg-gray-200 object-cover transition-transform group-hover:scale-105">
            {collection.coverImage ? (
              <img 
                src={collection.coverImage} 
                alt={collection.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            )}
          </div>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white p-1 rounded-full border border-gray-200">
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
              {creator?.profileImage ? (
                <img 
                  src={creator.profileImage} 
                  alt={creator.username} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-sm font-bold">
                  {creator?.username?.charAt(0).toUpperCase() || "C"}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
      <div className="p-6 pt-10">
        <Link href={`/collection/${collection.id}`}>
          <h3 className="text-lg font-bold text-center mb-2 text-secondary hover:text-primary transition-colors">
            {collection.name}
          </h3>
        </Link>
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-gray-500">Floor</p>
            <p className="font-semibold">{collection.floorPrice || "0"} VET</p>
          </div>
          <div>
            <p className="text-gray-500">Volume</p>
            <p className="font-semibold">{collection.volumeTraded || "0"} VET</p>
          </div>
          <div>
            <p className="text-gray-500">Items</p>
            <p className="font-semibold">{collection.itemCount || 0}</p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <Link href={`/collection/${collection.id}`}>
            <Button className="w-full bg-primary hover:bg-primary-dark text-white">
              View Collection
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
