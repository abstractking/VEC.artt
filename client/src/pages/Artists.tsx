import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, Users } from "lucide-react";
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
import CreatorCard from "@/components/CreatorCard";
import { User } from "@shared/schema";

export default function Artists() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  // Fetch all users (creators)
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/users'],
  });

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter users based on search term
  const filteredUsers = users ? users.filter((user: User) => {
    return searchTerm === "" || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.bio && user.bio.toLowerCase().includes(searchTerm.toLowerCase()));
  }) : [];
  
  // Sort users based on selected criteria
  // In a real app, you would sort by actual metrics like volume, followers, etc.
  const sortedUsers = [...(filteredUsers || [])].sort((a: User, b: User) => {
    if (sortBy === "popular") {
      // For demo, just sort by ID (which could represent popularity)
      return b.id - a.id;
    }
    if (sortBy === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "alphabetical") {
      return a.username.localeCompare(b.username);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col mb-10">
          <h1 className="text-3xl font-bold font-poppins text-secondary mb-2">
            Top Creators
          </h1>
          <p className="text-gray-600">
            Discover talented artists and creators on the VeCollab marketplace
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Input
                placeholder="Search creators by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-6 rounded-full"
              />
              <Search className="absolute left-3 top-3 text-gray-400" />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="recent">Recently Joined</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Creators Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-xl" />
            ))}
          </div>
        ) : sortedUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedUsers.map((user: User) => (
              <CreatorCard key={user.id} creator={user} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-secondary mb-2">No Creators Found</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              We couldn't find any creators matching your search. Try adjusting your search term.
            </p>
            <Button 
              onClick={() => setSearchTerm("")}
              className="bg-primary hover:bg-primary-dark text-white font-medium"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
