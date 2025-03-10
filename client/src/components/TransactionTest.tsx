import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useVechain';
import TransactionConfirmDialog from './TransactionConfirmDialog';
import { TransactionDetails } from './TransactionConfirmDialog';
import { useToast } from '@/hooks/use-toast';

export default function TransactionTest() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { walletAddress, useRealWallet } = useWallet();

  // Mock transaction data for testing
  const mockTransaction: TransactionDetails = {
    type: 'mint',
    title: 'Mint Test NFT',
    description: 'This is a test transaction to verify notification functionality',
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

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h3 className="font-semibold text-lg mb-2">Transaction & Notification Test</h3>
      <p className="text-muted-foreground mb-4">
        Test WebSocket notifications by simulating a transaction.
        {useRealWallet ? 
          ' Using real wallet mode.' :
          ' Using mock wallet mode (no actual blockchain transactions).'
        }
      </p>
      
      <Button onClick={handleOpenDialog}>
        Test Transaction Notification
      </Button>
      
      <TransactionConfirmDialog 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        transaction={mockTransaction}
      />
    </div>
  );
}