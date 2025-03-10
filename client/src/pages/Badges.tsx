import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import BadgesDisplay from '@/components/BadgesDisplay';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BadgeCategory, Badge as BadgeType, getBadgesByCategory, getUserBadges } from '@/lib/badgeSystem';
import { Trophy, Award, UserCheck, CheckCircle, ShieldCheck, BadgeCheck } from 'lucide-react';
import Badge from '@/components/Badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

export default function Badges() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect to home if not logged in
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your badges",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, setLocation, toast]);

  // Get latest user data to ensure we have up-to-date badges
  const { data: latestUser, isLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}`],
    enabled: !!user?.id,
  });

  const currentUser = latestUser || user;

  // Get user's badges organized by category
  const userBadges = currentUser ? getUserBadges(currentUser) : [];
  
  const creatorBadges = userBadges.filter(badge => badge.category === BadgeCategory.CREATOR);
  const collectorBadges = userBadges.filter(badge => badge.category === BadgeCategory.COLLECTOR);
  const traderBadges = userBadges.filter(badge => badge.category === BadgeCategory.TRADER);
  const communityBadges = userBadges.filter(badge => badge.category === BadgeCategory.COMMUNITY);
  const achievementBadges = userBadges.filter(badge => badge.category === BadgeCategory.ACHIEVEMENT);
  
  // Latest badge earned (for highlight)
  const latestBadge = userBadges.length > 0 
    ? [...userBadges].sort((a, b) => {
        const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
        const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
        return dateB - dateA;
      })[0]
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <Trophy className="h-12 w-12 animate-pulse text-gray-300" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-16">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-center md:text-left">Achievement Badges</h1>
          <p className="text-gray-500 text-center md:text-left">
            Collect badges by participating in VeCollab marketplace activities
          </p>
        </div>

        {userBadges.length > 0 ? (
          <>
            {latestBadge && (
              <div className="mb-10 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <Badge badge={latestBadge} size="lg" showTooltip={false} />
                  </div>
                  
                  <div className="flex-grow text-center md:text-left">
                    <BadgeComponent className="mb-2 bg-primary/20 text-primary border-primary/20">Latest Achievement</BadgeComponent>
                    <h2 className="text-2xl font-bold mb-2">{latestBadge.name}</h2>
                    <p className="text-gray-600 mb-4">{latestBadge.description}</p>
                    
                    <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>
                        Unlocked {latestBadge.unlockedAt 
                          ? new Date(latestBadge.unlockedAt).toLocaleDateString('en-US', {
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric'
                            }) 
                          : 'recently'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Your Badge Collection ({userBadges.length})</h2>
              </div>

              <Tabs defaultValue="all">
                <div className="overflow-x-auto pb-2">
                  <TabsList 
                    className="mb-6 w-full flex-nowrap overflow-x-auto whitespace-nowrap" 
                    style={{ 
                      msOverflowStyle: 'none', 
                      scrollbarWidth: 'none' 
                    }}
                  >
                    <style jsx>{`
                      .overflow-x-auto::-webkit-scrollbar {
                        display: none;
                      }
                    `}</style>
                    <TabsTrigger value="all">All Badges</TabsTrigger>
                    <TabsTrigger value="creator">Creator</TabsTrigger>
                    <TabsTrigger value="collector">Collector</TabsTrigger>
                    <TabsTrigger value="trader">Trader</TabsTrigger>
                    <TabsTrigger value="community">Community</TabsTrigger>
                    <TabsTrigger value="achievement">Achievements</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="all">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {userBadges.map(badge => (
                      <div key={badge.id} className="flex flex-col items-center">
                        <Badge badge={badge} size="md" showLabel={true} />
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="creator">
                  {creatorBadges.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {creatorBadges.map(badge => (
                        <div key={badge.id} className="flex flex-col items-center">
                          <Badge badge={badge} size="md" showLabel={true} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Award className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Creator Badges Yet</h3>
                      <p className="text-gray-500 max-w-md mx-auto mb-6">
                        Start creating NFTs to earn badges in this category.
                      </p>
                      <Button onClick={() => setLocation("/create")}>
                        Create an NFT
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="collector">
                  {collectorBadges.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {collectorBadges.map(badge => (
                        <div key={badge.id} className="flex flex-col items-center">
                          <Badge badge={badge} size="md" showLabel={true} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Award className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Collector Badges Yet</h3>
                      <p className="text-gray-500 max-w-md mx-auto mb-6">
                        Purchase NFTs to start earning collector badges.
                      </p>
                      <Button onClick={() => setLocation("/explore")}>
                        Explore NFTs
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="trader">
                  {traderBadges.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {traderBadges.map(badge => (
                        <div key={badge.id} className="flex flex-col items-center">
                          <Badge badge={badge} size="md" showLabel={true} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Award className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Trader Badges Yet</h3>
                      <p className="text-gray-500 max-w-md mx-auto mb-6">
                        List your NFTs for sale and complete transactions to earn trader badges.
                      </p>
                      <Button onClick={() => setLocation("/profile")}>
                        View My NFTs
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="community">
                  {communityBadges.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {communityBadges.map(badge => (
                        <div key={badge.id} className="flex flex-col items-center">
                          <Badge badge={badge} size="md" showLabel={true} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <UserCheck className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Community Badges Yet</h3>
                      <p className="text-gray-500 max-w-md mx-auto mb-6">
                        Connect your social accounts or get verified to earn community badges.
                      </p>
                      <Button onClick={() => setLocation("/profile/edit")}>
                        Edit Profile
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="achievement">
                  {achievementBadges.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {achievementBadges.map(badge => (
                        <div key={badge.id} className="flex flex-col items-center">
                          <Badge badge={badge} size="md" showLabel={true} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Award className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Achievement Badges Yet</h3>
                      <p className="text-gray-500 max-w-md mx-auto mb-6">
                        Continue using the marketplace to unlock special achievement badges.
                      </p>
                      <Button onClick={() => setLocation("/explore")}>
                        Explore NFTs
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border">
            <Trophy className="h-16 w-16 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold mb-3">No Badges Yet</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Earn badges by creating, buying, selling NFTs and participating in the VeCollab marketplace.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={() => setLocation("/create")}>
                Create an NFT
              </Button>
              <Button variant="outline" onClick={() => setLocation("/explore")}>
                Explore Marketplace
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}