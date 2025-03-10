import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { useWallet } from "@/hooks/useVechain";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export interface TransactionDetails {
  type: 'mint' | 'buy' | 'sell' | 'bid' | 'transfer';
  title: string;
  description: string;
  metadata?: {
    nftName?: string;
    nftImage?: string;
    price?: string;
    currency?: string;
    recipient?: string;
    contractAddress?: string;
    methodName?: string;
    gasEstimate?: string;
  };
  onConfirm: () => Promise<{ txid: string; success: boolean }>;
  onSuccess?: (txid: string) => void;
  onCancel?: () => void;
}

interface TransactionConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionDetails;
}

type TxStatus = 'idle' | 'confirming' | 'processing' | 'completed' | 'failed';

export default function TransactionConfirmDialog({
  isOpen,
  onClose,
  transaction
}: TransactionConfirmDialogProps) {
  const [status, setStatus] = useState<TxStatus>('idle');
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { walletAddress, useRealWallet } = useWallet();
  const { user } = useAuth();

  // Function to send notification to backend for WebSocket distribution
  const sendTransactionNotification = async (
    txStatus: 'initiated' | 'completed' | 'failed',
    txId: string | null = null
  ) => {
    if (!user) return; // Only send notifications for authenticated users
    
    try {
      const notificationData = {
        userId: user.id,
        type: transaction.type,
        status: txStatus,
        txId: txId,
        metadata: {
          ...transaction.metadata,
          walletMode: useRealWallet ? 'real' : 'mock'
        },
        timestamp: new Date().toISOString()
      };
      
      // Send notification data to server
      await apiRequest(
        'POST',
        '/api/notifications',
        notificationData
      );
      
      console.log(`Transaction notification sent: ${txStatus}`);
    } catch (err) {
      console.error('Failed to send transaction notification:', err);
      // Non-critical error, don't show to user
    }
  };

  const formatAddress = (address: string | null | undefined) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleConfirm = async () => {
    setStatus('confirming');
    setError(null);
    
    // Send transaction initiated notification
    await sendTransactionNotification('initiated');
    
    try {
      // Call the onConfirm function provided in the transaction details
      const result = await transaction.onConfirm();
      
      if (result.success) {
        setTxId(result.txid);
        setStatus('processing');
        
        // Simulate blockchain confirmation
        setTimeout(async () => {
          setStatus('completed');
          
          // Send transaction completed notification
          await sendTransactionNotification('completed', result.txid);
          
          if (transaction.onSuccess) {
            transaction.onSuccess(result.txid);
          }
        }, 2000);
      } else {
        setError('Transaction rejected or failed');
        setStatus('failed');
        
        // Send transaction failed notification
        await sendTransactionNotification('failed');
      }
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      setStatus('failed');
      
      // Send transaction failed notification
      await sendTransactionNotification('failed');
    }
  };

  const handleClose = () => {
    if (status === 'idle' || status === 'failed') {
      if (transaction.onCancel) {
        transaction.onCancel();
      }
      onClose();
      // Reset state after closing
      setTimeout(() => {
        setStatus('idle');
        setTxId(null);
        setError(null);
      }, 300);
    } else if (status === 'completed') {
      onClose();
      // Reset state after closing
      setTimeout(() => {
        setStatus('idle');
        setTxId(null);
        setError(null);
      }, 300);
    }
  };
  
  const renderContent = () => {
    switch (status) {
      case 'idle':
        return (
          <>
            <DialogDescription className="text-muted-foreground">
              {transaction.description}
            </DialogDescription>
            
            <div className="my-6 space-y-4">
              {transaction.metadata?.nftImage && (
                <div className="w-full flex justify-center my-3">
                  <div className="w-32 h-32 rounded-lg overflow-hidden border border-border">
                    <img 
                      src={transaction.metadata.nftImage} 
                      alt={transaction.metadata.nftName || "NFT"} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              {transaction.metadata?.nftName && (
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Item</span>
                  <span className="font-medium">{transaction.metadata.nftName}</span>
                </div>
              )}
              
              {transaction.metadata?.price && (
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">
                    {transaction.metadata.price} {transaction.metadata.currency || 'VET'}
                  </span>
                </div>
              )}
              
              {walletAddress && (
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">From</span>
                  <span className="font-medium">{formatAddress(walletAddress)}</span>
                </div>
              )}
              
              {transaction.metadata?.recipient && (
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-medium">{formatAddress(transaction.metadata.recipient)}</span>
                </div>
              )}
              
              {transaction.metadata?.contractAddress && (
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Contract</span>
                  <span className="font-medium">{formatAddress(transaction.metadata.contractAddress)}</span>
                </div>
              )}
              
              {transaction.metadata?.gasEstimate && (
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Estimated Gas</span>
                  <span className="font-medium">{transaction.metadata.gasEstimate}</span>
                </div>
              )}
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-amber-800 dark:text-amber-200 text-sm flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                You're about to sign a transaction on the VeChain Testnet. Please verify all details before proceeding.
              </div>
            </div>
          </>
        );
        
      case 'confirming':
        return (
          <div className="py-8 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <DialogDescription className="text-lg font-medium">
              Waiting for wallet confirmation...
            </DialogDescription>
            <p className="text-muted-foreground">
              Please confirm this transaction in your wallet
            </p>
          </div>
        );
        
      case 'processing':
        return (
          <div className="py-8 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <DialogDescription className="text-lg font-medium">
              Processing transaction...
            </DialogDescription>
            <p className="text-muted-foreground">
              Please wait while your transaction is being processed on the blockchain
            </p>
            {txId && (
              <div className="mt-4 p-3 bg-muted rounded-lg text-sm flex items-center justify-center">
                <span className="text-muted-foreground mr-2">Transaction ID:</span>
                <span className="font-mono">{txId.substring(0, 10)}...{txId.substring(txId.length - 10)}</span>
              </div>
            )}
          </div>
        );
        
      case 'completed':
        return (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
            <DialogDescription className="text-lg font-medium">
              Transaction completed!
            </DialogDescription>
            <p className="text-muted-foreground">
              Your transaction has been successfully processed
            </p>
            {txId && (
              <a 
                href={`https://testnet.vechainstats.com/tx/${txId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 p-3 bg-muted rounded-lg text-sm flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <span className="font-mono mr-2">{txId.substring(0, 10)}...{txId.substring(txId.length - 10)}</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        );
        
      case 'failed':
        return (
          <div className="py-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <DialogDescription className="text-lg font-medium">
              Transaction failed
            </DialogDescription>
            <p className="text-muted-foreground">
              {error || "There was an error processing your transaction"}
            </p>
          </div>
        );
        
      default:
        return null;
    }
  };

  const renderFooter = () => {
    switch (status) {
      case 'idle':
        return (
          <>
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="px-8"
            >
              Confirm
            </Button>
          </>
        );
        
      case 'confirming':
      case 'processing':
        return (
          <Button
            variant="outline"
            disabled
          >
            Please wait...
          </Button>
        );
        
      case 'completed':
        return (
          <Button
            onClick={handleClose}
            className="px-8"
          >
            Close
          </Button>
        );
        
      case 'failed':
        return (
          <>
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="px-8"
            >
              Try Again
            </Button>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{transaction.title}</DialogTitle>
        </DialogHeader>
        
        <div className="my-2 overflow-y-auto">
          {renderContent()}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:space-x-2 mt-4 pt-2 border-t">
          {renderFooter()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}