import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useVechain';
import TransactionConfirmDialog from './TransactionConfirmDialog';
import { TransactionDetails } from './TransactionConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TransactionTest() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [transactionType, setTransactionType] = React.useState<'mint' | 'buy' | 'sell' | 'bid' | 'transfer'>('mint');
  const { toast } = useToast();
  const { user } = useAuth();
  const { walletAddress, useRealWallet } = useWallet();

  // Mock transaction data for testing
  const getTransactionDetails = (): TransactionDetails => {
    let title = '';
    let description = '';
    
    switch(transactionType) {
      case 'mint':
        title = 'Mint Test NFT';
        description = 'Test minting a new NFT on VeChain';
        break;
      case 'buy':
        title = 'Buy Test NFT';
        description = 'Test buying an NFT from the marketplace';
        break;
      case 'sell':
        title = 'List Test NFT';
        description = 'Test listing an NFT for sale';
        break;
      case 'bid':
        title = 'Place Test Bid';
        description = 'Test placing a bid on an NFT';
        break;
      case 'transfer':
        title = 'Transfer Test NFT';
        description = 'Test transferring an NFT to another wallet';
        break;
    }
    
    return {
      type: transactionType,
      title,
      description,
      metadata: {
        nftName: 'Test NFT',
        nftImage: 'https://placehold.co/400x400/5F5FFF/white?text=TestNFT',
        price: '10',
        currency: 'VET',
        recipient: '0x1234567890abcdef1234567890abcdef12345678',
        contractAddress: '0x89e658faa1e1861b7923f35f62c96fb8e07c80b2',
        gasEstimate: '0.01 VET'
      },
      onConfirm: async () => {
        // Simulate successful transaction
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { 
          success: true, 
          txid: `0x${Math.random().toString(16).substring(2)}` 
        };
      },
      onSuccess: (txid) => {
        toast({
          title: 'Transaction Completed',
          description: `Transaction ID: ${txid.substring(0, 10)}...`,
        });
      },
      onCancel: () => {
        toast({
          title: 'Transaction Cancelled',
          description: 'You cancelled the transaction',
          variant: 'destructive'
        });
      }
    };
  };

  const handleOpenDialog = () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to test notifications',
        variant: 'destructive'
      });
      return;
    }
    
    if (!walletAddress) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet first',
        variant: 'destructive'
      });
      return;
    }
    
    setIsOpen(true);
  };
  
  // Function to directly send a test notification without transaction dialog
  const sendTestNotification = async (type: 'like' | 'follow' | 'view') => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to test notifications',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      let message = '';
      switch(type) {
        case 'like':
          message = 'Someone liked your NFT "Test NFT"';
          break;
        case 'follow':
          message = 'A new user is following your profile';
          break;
        case 'view':
          message = 'Someone viewed your NFT "Test NFT"';
          break;
      }
      
      const notificationData = {
        userId: user.id,
        type,
        notificationType: type,
        message,
        timestamp: new Date().toISOString(),
        metadata: {
          nftName: 'Test NFT',
          nftImage: 'https://placehold.co/400x400/5F5FFF/white?text=TestNFT'
        }
      };
      
      const response = await apiRequest('POST', '/api/notifications', notificationData);
      
      toast({
        title: 'Test Notification Sent',
        description: `Sent a test ${type} notification`
      });
    } catch (err) {
      console.error('Failed to send test notification:', err);
      toast({
        title: 'Notification Failed',
        description: 'Could not send test notification',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction & Notification Test</CardTitle>
        <CardDescription>
          Test the WebSocket notification system with transaction simulations and direct notifications.
          {useRealWallet ? 
            ' Using real wallet mode.' :
            ' Using mock wallet mode (no actual blockchain transactions).'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transaction">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transaction">Transaction Tests</TabsTrigger>
            <TabsTrigger value="notification">Direct Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transaction" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 my-4">
              <Button 
                onClick={() => setTransactionType('mint')}
                variant={transactionType === 'mint' ? 'default' : 'outline'}
                className="w-full"
              >
                Mint
              </Button>
              <Button 
                onClick={() => setTransactionType('buy')}
                variant={transactionType === 'buy' ? 'default' : 'outline'}
                className="w-full"
              >
                Buy
              </Button>
              <Button 
                onClick={() => setTransactionType('sell')}
                variant={transactionType === 'sell' ? 'default' : 'outline'}
                className="w-full"
              >
                Sell
              </Button>
              <Button 
                onClick={() => setTransactionType('bid')}
                variant={transactionType === 'bid' ? 'default' : 'outline'}
                className="w-full"
              >
                Bid
              </Button>
              <Button 
                onClick={() => setTransactionType('transfer')}
                variant={transactionType === 'transfer' ? 'default' : 'outline'}
                className="w-full"
              >
                Transfer
              </Button>
            </div>
            
            <Button 
              onClick={handleOpenDialog} 
              size="lg"
              className="w-full"
            >
              Test {transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} Transaction
            </Button>
          </TabsContent>
          
          <TabsContent value="notification" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Send notifications directly without going through the transaction process.
              These will appear in the notification center in the top right.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button 
                onClick={() => sendTestNotification('like')}
                variant="outline"
                className="w-full"
              >
                Like Notification
              </Button>
              <Button 
                onClick={() => sendTestNotification('follow')}
                variant="outline"
                className="w-full"
              >
                Follow Notification
              </Button>
              <Button 
                onClick={() => sendTestNotification('view')}
                variant="outline"
                className="w-full"
              >
                View Notification
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <TransactionConfirmDialog 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        transaction={getTransactionDetails()}
      />
    </Card>
  );
}