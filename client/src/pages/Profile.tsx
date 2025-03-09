import { useState, useEffect } from "react";
import { useParams, useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useVechain";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { NFT, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Copy, ExternalLink, Users } from "lucide-react";
import NFTCard from "@/components/NFTCard";
import CollectionCard from "@/components/CollectionCard";

export default function Profile() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [isProfile] = useRoute("/profile/:id?");
  const { user: loggedInUser } = useAuth();
  const { walletAddress, isConnected, connectWallet } = useWallet();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("created");

  // If no ID is provided and user is logged in, show logged in user's profile
  const userId = params.id || (loggedInUser ? loggedInUser.id : null);
  const isOwnProfile = loggedInUser && userId && parseInt(userId as string) === loggedInUser.id;

  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  // Fetch created NFTs
  const { data: createdNFTs, isLoading: createdLoading } = useQuery({
    queryKey: [`/api/nfts/creator/${userId}`],
    enabled: !!userId,
  });

  // Fetch owned NFTs
  const { data: ownedNFTs, isLoading: ownedLoading } = useQuery({
    queryKey: [`/api/nfts/owner/${userId}`],
    enabled: !!userId,
  });

  // Fetch collections
  const { data: collections, isLoading: collectionsLoading } = useQuery({
    queryKey: [`/api/collections/creator/${userId}`],
    enabled: !!userId,
  });

  // Redirect if profile not found (but only after loading completes)
  useEffect(() => {
    if (!userLoading && !user && userId) {
      toast({
        title: "Profile not found",
        description: "The profile you're looking for doesn't exist.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, userLoading, userId, setLocation, toast]);

  // Handle connect wallet if needed
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      toast({
        title: "Failed to connect wallet",
        description: "There was an error connecting to your wallet.",
        variant: "destructive",
      });
    }
  };

  // Copy wallet address to clipboard
  const copyWalletAddress = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-16">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
            <Skeleton className="w-full h-48" />
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-end -mt-16 mb-4">
                <Skeleton className="w-32 h-32 rounded-full border-4 border-card" />
                <div className="mt-4 sm:mt-0 sm:ml-4 flex-grow">
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              <Skeleton className="h-16 w-full mt-4" />
            </div>
          </div>
          
          <div className="mt-8">
            <Skeleton className="h-12 w-64 mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user && !userLoading) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">The profile you're looking for doesn't exist.</p>
          <Button
            onClick={() => setLocation("/")}
          >
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  // If we need to connect wallet or redirect to login
  if (!isConnected && isProfile && !userId) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-16 flex items-center justify-center">
        <div className="bg-card rounded-xl shadow-sm p-8 max-w-md w-full text-center border border-border">
          <Users className="h-16 w-16 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-4">Profile Access</h1>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to view your profile or create an account.
          </p>
          <Button
            onClick={handleConnectWallet}
            className="w-full"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 pb-16">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
          <div
            className="w-full h-48 bg-gradient-to-r from-primary/20 to-primary/10"
            style={{
              backgroundImage: user?.coverImage ? `url(${user.coverImage})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-end -mt-16 mb-4">
              <div
                className="w-32 h-32 rounded-full bg-card border-4 border-card shadow-md overflow-hidden"
                style={{
                  backgroundImage: user?.profileImage ? `url(${user.profileImage})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {!user?.profileImage && (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-2xl font-bold">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-4 flex-grow">
                <h1 className="text-2xl font-bold text-foreground">{user?.username}</h1>
                <div className="flex items-center mt-2">
                  <div className="text-muted-foreground text-sm flex items-center">
                    <span className="mr-1 truncate max-w-[120px] sm:max-w-[200px]">
                      {user?.walletAddress
                        ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                        : ""}
                    </span>
                    <button onClick={copyWalletAddress}>
                      <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                  <a
                    href={`https://explore-testnet.vechain.org/accounts/${user?.walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 text-primary hover:text-primary/80 flex items-center text-sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View on Explorer
                  </a>
                </div>
              </div>
              {isOwnProfile && (
                <div className="mt-4 sm:mt-0">
                  <Button
                    variant="outline"
                    className="text-foreground"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
            <p className="text-muted-foreground mt-4">{user?.bio || "No bio provided."}</p>
          </div>
        </div>

        {/* Tabs for Profile Content */}
        <div className="mt-8">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="created">Created</TabsTrigger>
              <TabsTrigger value="collected">Collected</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
            </TabsList>
            
            <TabsContent value="created">
              {createdLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-80 w-full rounded-xl" />
                  ))}
                </div>
              ) : createdNFTs && createdNFTs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {createdNFTs.map((nft: NFT) => (
                    <NFTCard key={nft.id} nft={nft} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-card rounded-xl border border-border">
                  <h3 className="text-xl font-bold text-foreground mb-2">No Created NFTs</h3>
                  <p className="text-muted-foreground mb-6">
                    {isOwnProfile
                      ? "You haven't created any NFTs yet."
                      : "This user hasn't created any NFTs yet."}
                  </p>
                  {isOwnProfile && (
                    <Button
                      onClick={() => setLocation("/create")}
                    >
                      Create Your First NFT
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="collected">
              {ownedLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-80 w-full rounded-xl" />
                  ))}
                </div>
              ) : ownedNFTs && ownedNFTs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {ownedNFTs.map((nft: NFT) => (
                    <NFTCard key={nft.id} nft={nft} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-card rounded-xl border border-border">
                  <h3 className="text-xl font-bold text-foreground mb-2">No Collected NFTs</h3>
                  <p className="text-muted-foreground mb-6">
                    {isOwnProfile
                      ? "You haven't collected any NFTs yet."
                      : "This user hasn't collected any NFTs yet."}
                  </p>
                  {isOwnProfile && (
                    <Button
                      onClick={() => setLocation("/explore")}
                    >
                      Browse NFTs
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="collections">
              {collectionsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-80 w-full rounded-xl" />
                  ))}
                </div>
              ) : collections && collections.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {collections.map((collection) => (
                    <CollectionCard key={collection.id} collection={collection} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-card rounded-xl border border-border">
                  <h3 className="text-xl font-bold text-foreground mb-2">No Collections</h3>
                  <p className="text-muted-foreground mb-6">
                    {isOwnProfile
                      ? "You haven't created any collections yet."
                      : "This user hasn't created any collections yet."}
                  </p>
                  {isOwnProfile && (
                    <Button
                      onClick={() => setLocation("/create")}
                    >
                      Create a Collection
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
