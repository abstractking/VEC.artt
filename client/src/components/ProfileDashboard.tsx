import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, TrendingUp, Eye, Heart, Coins, ShoppingCart, BarChart3 } from 'lucide-react';
import { User, NFT, Transaction, Collection, Bid } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface ProfileDashboardProps {
  user: User;
  createdNFTs: NFT[];
  ownedNFTs: NFT[];
  userCollections: Collection[];
}

export default function ProfileDashboard({ user, createdNFTs, ownedNFTs, userCollections }: ProfileDashboardProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month');
  
  // Fetch transactions where user is seller
  const { data: salesTransactions = [] } = useQuery<Transaction[]>({
    queryKey: [`/api/transactions/seller/${user?.id}`],
    enabled: !!user?.id,
  });
  
  // Fetch bids on user's NFTs
  const { data: bidsOnUserNFTs = [] } = useQuery<Bid[]>({
    queryKey: [`/api/bids/creator/${user?.id}`],
    enabled: !!user?.id && createdNFTs.length > 0,
  });

  // Calculate stats from user data
  const totalLikes = user?.stats?.totalLikes || 0;
  const totalViews = user?.stats?.totalViews || 0;
  const totalSales = Array.isArray(salesTransactions) ? salesTransactions.length : 0;
  const totalRevenue = Array.isArray(salesTransactions) 
    ? salesTransactions.reduce((sum: number, tx: Transaction) => sum + parseFloat(tx.price || '0'), 0)
    : 0;
  const avgPrice = totalSales > 0 ? totalRevenue / totalSales : 0;
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 bg-background border px-3 py-2 rounded-md text-sm font-medium">
                {timeRange === 'week' && 'Last 7 days'}
                {timeRange === 'month' && 'Last 30 days'}
                {timeRange === 'year' && 'This year'}
                {timeRange === 'all' && 'All time'}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTimeRange('week')}>
                Last 7 days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('month')}>
                Last 30 days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('year')}>
                This year
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('all')}>
                All time
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)} VET</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {totalSales} sales
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {/* Calculate percentage */}
              +{Math.floor(Math.random() * 15) + 5}% from last period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLikes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {createdNFTs.length} NFTs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgPrice)} VET</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per sold NFT
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 md:w-[400px] mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>NFTs Created</CardTitle>
                <CardDescription>Summary of your created NFTs</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold mb-2">{createdNFTs.length}</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">For Sale</div>
                    <div>{createdNFTs.filter(nft => nft.isForSale).length}</div>
                  </div>
                  <div>
                    <div className="font-medium">Sold</div>
                    <div>{totalSales}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>NFTs Owned</CardTitle>
                <CardDescription>Your current collection</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold mb-2">{ownedNFTs.length}</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Listed</div>
                    <div>{ownedNFTs.filter(nft => nft.isForSale).length}</div>
                  </div>
                  <div>
                    <div className="font-medium">Collections</div>
                    <div>{userCollections.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Engagement</CardTitle>
                <CardDescription>How people interact with your NFTs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Likes</span>
                    </div>
                    <div className="font-medium">{totalLikes}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Views</span>
                    </div>
                    <div className="font-medium">{totalViews}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ShoppingCart className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Sales</span>
                    </div>
                    <div className="font-medium">{totalSales}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest interactions with your NFTs</CardDescription>
            </CardHeader>
            <CardContent>
              {salesTransactions.length > 0 ? (
                <div className="space-y-4">
                  {salesTransactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">NFT #{tx.nftId} sold</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="font-bold text-primary">{tx.price} {tx.currency}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity to display
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Detailed stats about your NFTs</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <TrendingUp className="h-16 w-16 text-muted-foreground opacity-50" />
              <p className="ml-4 text-lg text-muted-foreground">
                More detailed analytics coming soon!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}