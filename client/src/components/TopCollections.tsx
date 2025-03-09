import { useState } from "react";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { Collection } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface TopCollectionsProps {
  collections: Collection[];
  isLoading: boolean;
}

export default function TopCollections({ collections, isLoading }: TopCollectionsProps) {
  // Display up to 4 collections
  const displayedCollections = collections?.slice(0, 4) || [];

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
              <div key={index} className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-6 pt-10">
                  <Skeleton className="h-6 w-1/2 mx-auto mb-4" />
                  <div className="flex justify-between text-sm">
                    <div>
                      <Skeleton className="h-4 w-12 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-12 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-12 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
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
          <h2 className="text-3xl font-bold font-poppins text-foreground">Top Collections</h2>
          <Link href="/explore">
            <Button variant="link" className="text-primary hover:text-primary/80 font-medium transition-colors">
              View all <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedCollections.length > 0 ? (
            displayedCollections.map((collection) => (
              <div key={collection.id} className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                <div className="relative">
                  <div className="w-full h-48 bg-muted object-cover transition-transform group-hover:scale-105">
                    {collection.coverImage && (
                      <img 
                        src={collection.coverImage} 
                        alt={collection.name} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-card p-1 rounded-full border border-border">
                    <div className="w-12 h-12 bg-muted rounded-full">
                      {/* This would ideally be the creator's profile image */}
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-10">
                  <h3 className="text-lg font-bold text-center mb-2 text-foreground">{collection.name}</h3>
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-muted-foreground">Floor</p>
                      <p className="font-semibold text-foreground">{collection.floorPrice || "0"} VET</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Volume</p>
                      <p className="font-semibold text-foreground">{collection.volumeTraded || "0"} VET</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Items</p>
                      <p className="font-semibold text-foreground">{collection.itemCount || 0}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <span className="text-green-500 dark:text-green-400 text-sm">
                      <i className="fas fa-chart-line mr-1"></i> +24.5%
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">No collections available yet.</p>
              <Link href="/create">
                <Button className="mt-4">
                  Create a Collection
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
