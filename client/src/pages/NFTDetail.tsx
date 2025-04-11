import { useState, useEffect } from "react";
import { useParams, useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "../context/WalletContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { NFT, User, Bid } from "@shared/schema";
import EditListingDialog from "@/components/EditListingDialog";
import BuyNFTDialog from "@/components/BuyNFTDialog";
import SocialShareButtons from "@/components/SocialShareButtons";
import { 
  Clock, 
  Tag, 
  Share, 
  Heart, 
  ExternalLink, 
  ArrowLeft,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function NFTDetail() {
  const params = useParams();
  const [location, setLocation] = useLocation();
  console.log("NFTDetail - Location object:", location); // Debug log to check location structure
  
  const { user } = useAuth();
  console.log("NFTDetail - User object:", user); // Debug log to check user structure
  
  const { walletInfo, connectWallet } = useWallet();
  const account = walletInfo.address;
  console.log("NFTDetail - Wallet info:", { account }); // Debug wallet info
  
  const { toast } = useToast();
  const [isBidModalOpen, setBidModalOpen] = useState(false);
  const [isPurchasing, setPurchasing] = useState(false);
  const [isBidding, setBidding] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState<boolean>(false);
  const [isEditListingOpen, setEditListingOpen] = useState(false);
  const [isBuyDialogOpen, setBuyDialogOpen] = useState(false);
  const [isShareDialogOpen, setShareDialogOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Fetch NFT details
  const { data: nft, isLoading: nftLoading } = useQuery({
    queryKey: [`/api/nfts/${params.id}`],
    enabled: !!params.id,
  });

  // Fetch creator details
  const { data: creator, isLoading: creatorLoading } = useQuery({
    queryKey: [`/api/users/${nft?.creatorId}`],
    enabled: !!nft?.creatorId,
  });

  // Fetch owner details
  const { data: owner, isLoading: ownerLoading } = useQuery({
    queryKey: [`/api/users/${nft?.ownerId}`],
    enabled: !!nft?.ownerId,
  });

  // Fetch bids
  const { data: bids, isLoading: bidsLoading } = useQuery({
    queryKey: [`/api/bids/nft/${params.id}`],
    enabled: !!params.id,
  });

  // Fetch transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: [`/api/transactions/nft/${params.id}`],
    enabled: !!params.id,
  });

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // If NFT not found, show error
  useEffect(() => {
    if (!nftLoading && !nft && params.id) {
      toast({
        title: "NFT not found",
        description: "The NFT you're looking for doesn't exist.",
        variant: "destructive",
      });
      setLocation("/explore");
    }
  }, [nft, nftLoading, params.id, setLocation, toast]);
  
  // Check if NFT is in user's favorites when user changes
  useEffect(() => {
    if (user && nft) {
      // Check if this NFT is in user's favorites
      const favorites = user.favorites || [];
      setIsFavorite(favorites.includes(nft.id));
    }
  }, [user, nft]);

  // Calculate auction time remaining
  useEffect(() => {
    if (!nft?.isBiddable || !nft?.metadata?.auctionEndDate) return;
    
    // Function to update the time remaining display
    const updateTimeRemaining = () => {
      const endDate = new Date(nft.metadata.auctionEndDate);
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft("Auction ended");
        return;
      }
      
      // Calculate time components
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      // Format time remaining
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };
    
    // Initial update
    updateTimeRemaining();
    
    // Update every second
    const interval = setInterval(updateTimeRemaining, 1000);
    
    // Clean up
    return () => clearInterval(interval);
  }, [nft]);

  // Handle connect wallet
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      console.log("Wallet connected successfully.");
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast({
        title: "Wallet Connection Failed",
        description: "Failed to connect to your wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle buy now
  const handleBuyNow = async () => {
    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a purchase",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to make a purchase",
        variant: "destructive",
      });
      return;
    }

    setPurchasing(true);

    try {
      // In a real app, we would interact with the blockchain here
      // For now, we'll just update the NFT owner in our database
      
      // Create a transaction record
      await apiRequest("POST", "/api/transactions", {
        nftId: nft.id,
        sellerId: nft.ownerId,
        buyerId: user.id,
        price: nft.price,
        currency: nft.currency,
        txHash: `mock_tx_${Date.now()}`, // Mock transaction hash
        status: "completed"
      });
      
      // Update NFT ownership
      await apiRequest("PATCH", `/api/nfts/${nft.id}`, {
        ownerId: user.id,
        isForSale: false
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/nfts/${params.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/nfts'] });
      queryClient.invalidateQueries({ queryKey: [`/api/nfts/owner/${user.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/transactions/nft/${params.id}`] });
      
      toast({
        title: "Purchase Successful",
        description: `You are now the owner of ${nft.name}`,
      });
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase Failed",
        description: "There was an error completing your purchase",
        variant: "destructive",
      });
    } finally {
      setPurchasing(false);
    }
  };

  // Handle place bid
  const handlePlaceBid = async () => {
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast({
        title: "Invalid Bid",
        description: "Please enter a valid bid amount",
        variant: "destructive",
      });
      return;
    }

    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to place a bid",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to place a bid",
        variant: "destructive",
      });
      return;
    }

    // Check if bid is higher than current price/highest bid
    const currentPrice = parseFloat(nft.price);
    const highestBid = bids && bids.length > 0
      ? Math.max(...bids.map((bid: Bid) => parseFloat(bid.amount)))
      : 0;
    
    if (parseFloat(bidAmount) <= highestBid) {
      toast({
        title: "Bid too low",
        description: "Your bid must be higher than the current highest bid",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(bidAmount) < currentPrice) {
      toast({
        title: "Bid too low",
        description: "Your bid must be at least the asking price",
        variant: "destructive",
      });
      return;
    }

    setBidding(true);

    try {
      // Create a new bid
      await apiRequest("POST", "/api/bids", {
        nftId: nft.id,
        bidderId: user.id,
        amount: bidAmount,
        currency: nft.currency,
        status: "active",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/bids/nft/${params.id}`] });
      
      toast({
        title: "Bid Placed",
        description: `Your bid of ${bidAmount} ${nft.currency} has been placed`,
      });
      
      // Close the bid modal
      setBidModalOpen(false);
      setBidAmount("");
    } catch (error) {
      console.error("Bid error:", error);
      toast({
        title: "Bid Failed",
        description: "There was an error placing your bid",
        variant: "destructive",
      });
    } finally {
      setBidding(false);
    }
  };

  if (nftLoading || creatorLoading || ownerLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-16">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            className="mb-8"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Skeleton className="w-full aspect-square rounded-xl" />
            </div>
            
            <div>
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-6" />
              
              <div className="flex items-center mb-6">
                <Skeleton className="h-12 w-12 rounded-full mr-4" />
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
              
              <Skeleton className="h-24 w-full mb-6" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-secondary mb-4">NFT Not Found</h1>
          <p className="text-gray-600 mb-6">The NFT you're looking for doesn't exist.</p>
          <Button
            onClick={() => setLocation("/explore")}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            Explore NFTs
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user && nft.ownerId === user.id;
  const highestBid = bids && bids.length > 0
    ? Math.max(...bids.map((bid: Bid) => parseFloat(bid.amount)))
    : 0;

  // Handle toggle favorite
  const handleToggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to favorite NFTs",
        variant: "destructive",
      });
      return;
    }

    setIsTogglingFavorite(true);

    try {
      const favorites = [...(user.favorites || [])];
      const updatedFavorites = isFavorite
        ? favorites.filter(id => id !== nft.id)
        : [...favorites, nft.id];

      // Update user
      await apiRequest("PATCH", `/api/users/${user.id}`, {
        favorites: updatedFavorites
      });

      // Update local state
      setIsFavorite(!isFavorite);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}`] });
      
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite ? `${nft.name} removed from your favorites` : `${nft.name} added to your favorites`,
      });
    } catch (error) {
      console.error("Toggle favorite error:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-16">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          className="mb-8"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* NFT Image */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <img
              src={nft.imageUrl}
              alt={nft.name}
              className="w-full rounded-lg object-contain max-h-[70vh]"
              onError={(e) => {
                // Detailed error logging
                const imgElement = e.target as HTMLImageElement;
                console.error(`NFTDetail: Image load error for NFT ID: ${nft.id}`, { 
                  url: nft.imageUrl, 
                  error: e 
                });
                // Set a more visually appealing placeholder with the NFT name
                imgElement.src = `https://placehold.co/800x600/3a4852/ffffff?text=${encodeURIComponent(nft.name || 'NFT')}`;
                // Add a class to style the placeholder
                imgElement.classList.add('placeholder-img');
              }}
            />
          </div>
          
          {/* NFT Details */}
          <div>
            <h1 className="text-3xl font-bold text-secondary mb-2">
              {nft.name}
            </h1>
            
            <div className="flex items-center mb-6">
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">Owned by</span>
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={owner?.profileImage} />
                  <AvatarFallback>{owner?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span 
                  className="text-primary hover:text-primary-dark cursor-pointer"
                  onClick={() => setLocation(`/profile/${owner?.id}`)}
                >
                  {owner?.username}
                </span>
              </div>
              
              <div className="ml-4 flex items-center">
                <span className="text-gray-500 mr-2">Created by</span>
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={creator?.profileImage} />
                  <AvatarFallback>{creator?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span 
                  className="text-primary hover:text-primary-dark cursor-pointer"
                  onClick={() => setLocation(`/profile/${creator?.id}`)}
                >
                  {creator?.username}
                </span>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
              {nft.isForSale ? (
                <>
                  <div className="flex items-center mb-4">
                    <Tag className="text-primary mr-2" />
                    <span className="text-gray-600">
                      {nft.isBiddable ? "Current price" : "Price"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-secondary">
                        {nft.price} {nft.currency}
                      </h2>
                      {highestBid > 0 && (
                        <p className="text-gray-500 mt-1">
                          Highest bid: {highestBid} {nft.currency}
                        </p>
                      )}
                    </div>
                    {nft.isBiddable && (
                      <div className="flex items-center">
                        <Clock className="text-gray-500 mr-2" />
                        <span className={`text-gray-500 ${timeLeft === "Auction ended" ? "text-red-500 font-semibold" : ""}`}>
                          {timeLeft ? (timeLeft === "Auction ended" ? "Auction ended" : `Ends in ${timeLeft}`) : "Loading auction time..."}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {!isOwner ? (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        className="bg-primary hover:bg-primary-dark text-white flex-grow"
                        onClick={() => setBuyDialogOpen(true)}
                        disabled={isPurchasing || (timeLeft === "Auction ended" && nft.isBiddable)}
                      >
                        {isPurchasing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          `Buy for ${nft.price} ${nft.currency}`
                        )}
                      </Button>
                      
                      {nft.isBiddable && (
                        <Button
                          variant="outline"
                          className="text-primary border-primary hover:bg-primary/10 flex-grow"
                          onClick={() => setBidModalOpen(true)}
                        >
                          Place Bid
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="text-primary border-primary hover:bg-primary/10 w-full"
                      onClick={() => setEditListingOpen(true)}
                    >
                      Edit Listing
                    </Button>
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  <h2 className="text-2xl font-bold text-secondary mb-2">
                    Not for sale
                  </h2>
                  <p className="text-gray-500">
                    This NFT is currently not listed for sale
                  </p>
                  {isOwner && (
                    <Button
                      className="bg-primary hover:bg-primary-dark text-white mt-4"
                      onClick={() => setEditListingOpen(true)}
                    >
                      List for Sale
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 md:gap-4 mb-6">
              <Button 
                variant={isFavorite ? "default" : "outline"}
                className={`flex items-center ${isFavorite ? "bg-primary text-white" : ""}`}
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite}
                size="sm"
              >
                {isTogglingFavorite ? (
                  <Loader2 className="h-4 w-4 mr-1" />
                ) : (
                  <Heart className={`h-4 w-4 mr-1 ${isFavorite ? "fill-current" : ""}`} />
                )}
                {isFavorite ? "Favorited" : "Favorite"}
              </Button>
              <Button variant="outline" className="flex items-center" size="sm">
                <Share className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button
                variant="outline"
                className="flex items-center text-xs"
                size="sm"
                onClick={() => window.open(`https://explore.vechain.org/tokens/${nft.tokenId}`, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View on Explorer
              </Button>
            </div>
            
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="bids">Bids</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-secondary dark:text-white mb-4">Description</h3>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line mb-6">
                  {nft.description || "No description provided."}
                </p>
                
                <h3 className="font-bold text-secondary dark:text-white mb-4">Properties</h3>
                {nft.metadata && Object.keys(nft.metadata).length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.entries(nft.metadata).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{key}</p>
                        <p className="font-semibold text-secondary dark:text-gray-200">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No properties</p>
                )}
              </TabsContent>
              
              <TabsContent value="bids" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                {bidsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-4 border-b">
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-full mr-3" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))
                ) : bids && bids.length > 0 ? (
                  <div>
                    {bids.map((bid: Bid) => (
                      <div key={bid.id} className="flex justify-between items-center py-4 border-b">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">User #{bid.bidderId}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(bid.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-primary">
                          {bid.amount} {bid.currency}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No bids yet</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="history" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                {transactionsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-4 border-b">
                      <div>
                        <Skeleton className="h-5 w-24 mb-1" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))
                ) : transactions && transactions.length > 0 ? (
                  <div>
                    {transactions.map((tx: any) => (
                      <div key={tx.id} className="flex justify-between items-center py-4 border-b">
                        <div>
                          <p className="font-medium">
                            Transfer from User #{tx.sellerId} to User #{tx.buyerId}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-bold text-primary">
                          {tx.price} {tx.currency}
                        </p>
                      </div>
                    ))}
                    <div className="flex justify-between items-center py-4 border-b">
                      <div>
                        <p className="font-medium">Minted</p>
                        <p className="text-xs text-gray-500">
                          {new Date(nft.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-medium text-secondary">
                        by {creator?.username || `User #${nft.creatorId}`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No transaction history yet</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Bid Modal */}
      <Dialog open={isBidModalOpen} onOpenChange={setBidModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place a Bid</DialogTitle>
            <DialogDescription>
              Enter your bid amount for {nft.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Current Price</p>
              <p className="font-bold text-lg">
                {nft.price} {nft.currency}
              </p>
            </div>
            {highestBid > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Highest Bid</p>
                <p className="font-semibold">
                  {highestBid} {nft.currency}
                </p>
              </div>
            )}
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Your Bid</p>
              <div className="flex items-center">
                <Input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Enter bid amount"
                  min={nft.price}
                  step="0.1"
                />
                <span className="ml-2 font-medium">{nft.currency}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter an amount higher than {Math.max(parseFloat(nft.price), highestBid)} {nft.currency}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBidModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary-dark text-white"
              onClick={handlePlaceBid}
              disabled={isBidding}
            >
              {isBidding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Place Bid"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Listing Dialog */}
      {nft && (
        <EditListingDialog
          nft={nft}
          isOpen={isEditListingOpen}
          onClose={() => setEditListingOpen(false)}
          onSuccess={() => {
            // Force refresh NFT data after updating listing
            queryClient.invalidateQueries({ queryKey: [`/api/nfts/${params.id}`] });
            queryClient.invalidateQueries({ queryKey: ['/api/nfts'] });
            toast({
              title: "Listing updated",
              description: "Your NFT listing has been updated successfully",
            });
          }}
        />
      )}

      {/* Buy NFT Dialog */}
      {nft && (
        <BuyNFTDialog
          nft={nft}
          isOpen={isBuyDialogOpen}
          onClose={() => setBuyDialogOpen(false)}
          onSuccess={() => {
            // Force refresh NFT data after purchase
            queryClient.invalidateQueries({ queryKey: [`/api/nfts/${params.id}`] });
            queryClient.invalidateQueries({ queryKey: ['/api/nfts'] });
            queryClient.invalidateQueries({ queryKey: [`/api/nfts/owner/${user?.id}`] });
            toast({
              title: "Purchase successful",
              description: `You are now the owner of ${nft.name}`,
            });
          }}
        />
      )}
    </div>
  );
}
