import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function CreatorSpotlight() {
  // Fetch creators (users)
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/users'],
  });
  
  // Display up to 4 creators
  const topCreators = users?.slice(0, 4) || [];

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-8 w-32" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-6 flex flex-col items-center">
                <Skeleton className="w-20 h-20 rounded-full mb-4" />
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-5 w-40 mb-4" />
                <div className="grid grid-cols-3 gap-2 w-full mb-4">
                  <Skeleton className="h-12 w-full rounded-md" />
                  <Skeleton className="h-12 w-full rounded-md" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold font-poppins text-foreground">Top Creators</h2>
          <Link href="/artists">
            <Button variant="link" className="text-primary hover:text-primary/80 font-medium transition-colors">
              View all <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topCreators.length > 0 ? (
            topCreators.map((creator: User) => (
              <div key={creator.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full border-4 border-card shadow-md overflow-hidden bg-muted">
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
                    <i className="fas fa-check text-primary-foreground text-xs"></i>
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1 text-foreground">{creator.username}</h3>
                <p className="text-muted-foreground text-sm mb-3">@{creator.username.toLowerCase()}</p>
                <div className="mb-4">
                  <span className="text-primary font-semibold">285K VET</span>
                  <span className="text-muted-foreground text-sm"> volume</span>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full mb-4">
                  {/* NFT thumbnails would go here in a real app */}
                  <div className="w-full h-12 bg-muted rounded-md"></div>
                  <div className="w-full h-12 bg-muted rounded-md"></div>
                  <div className="w-full h-12 bg-muted rounded-md"></div>
                </div>
                <Link href={`/profile/${creator.id}`}>
                  <Button variant="outline" className="w-full text-primary">
                    View Profile
                  </Button>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">No creators available yet.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
