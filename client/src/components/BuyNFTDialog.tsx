import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useVechain";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { NFT } from "@shared/schema";
import { callContractMethod, executeContractMethod } from "@/lib/vechain";
import { VeCollabNFTABI, VeCollabNFTAddress } from "@/lib/contracts/VeCollabNFT";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BuyNFTDialogProps {
  nft: NFT;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Transaction states
type TransactionStatus = "idle" | "confirming" | "processing" | "completed" | "failed";

export default function BuyNFTDialog({
  nft,
  isOpen,
  onClose,
  onSuccess
}: BuyNFTDialogProps) {
  const { toast } = useToast();
  const { walletAddress, isConnected, connectWallet } = useWallet();
  
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>("idle");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Function to handle connecting wallet
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error: any) {
      setErrorMessage("Failed to connect wallet. Please try again.");
      console.error("Wallet connection error:", error);
    }
  };

  // Function to execute the NFT purchase
  const handleBuyNFT = async () => {
    if (!isConnected || !walletAddress) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to buy this NFT",
        variant: "destructive",
      });
      return;
    }

    if (!nft || !nft.isForSale) {
      toast({
        title: "NFT not for sale",
        description: "This NFT is not available for purchase",
        variant: "destructive",
      });
      return;
    }

    try {
      setTransactionStatus("confirming");
      setErrorMessage(null);

      // Calculate price in wei (VET has 18 decimals)
      const priceInWei = (parseFloat(nft.price) * 10**18).toString();
      
      // Call the buy method on the NFT contract
      const result = await executeContractMethod(
        VeCollabNFTAddress,
        VeCollabNFTABI,
        "buyNFT",
        [nft.tokenId],
        priceInWei // Value in wei
      );

      if (!result || !result.txid) {
        throw new Error("Transaction failed or returned invalid result");
      }

      // Set transaction hash and update status
      setTransactionHash(result.txid);
      setTransactionStatus("processing");

      // Record the transaction in our database
      const transactionData = {
        nftId: nft.id,
        sellerId: nft.ownerId,
        buyerId: walletAddress, // We might need to get the user ID based on wallet address
        price: nft.price,
        currency: nft.currency,
        transactionHash: result.txid,
      };

      const response = await apiRequest("POST", "/api/transactions", transactionData);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Transaction record error:", errorData);
        // We continue the process since the blockchain transaction was successful
      }

      // Update NFT ownership in the database
      const nftUpdateResponse = await apiRequest("PATCH", `/api/nfts/${nft.id}`, {
        ownerId: walletAddress, // This would need to be resolved to user ID
        isForSale: false,
        isBiddable: false,
        lastSoldPrice: nft.price,
        lastSoldAt: new Date().toISOString(),
      });

      if (!nftUpdateResponse.ok) {
        console.error("Failed to update NFT ownership");
      }

      // Update queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/nfts'] });
      queryClient.invalidateQueries({ queryKey: [`/api/nfts/${nft.id}`] });
      
      setTransactionStatus("completed");
      
      toast({
        title: "Purchase successful!",
        description: `You are now the owner of ${nft.name}`,
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      setTransactionStatus("failed");
      setErrorMessage(error.message || "Transaction failed. Please try again.");
      
      toast({
        title: "Purchase failed",
        description: error.message || "Failed to complete the purchase",
        variant: "destructive",
      });
    }
  };

  const renderTransactionStatus = () => {
    switch (transactionStatus) {
      case "confirming":
        return (
          <Alert className="mb-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <AlertTitle>Confirming Transaction</AlertTitle>
            <AlertDescription>
              Please confirm the transaction in your wallet...
            </AlertDescription>
          </Alert>
        );
      case "processing":
        return (
          <Alert className="mb-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <AlertTitle>Processing Transaction</AlertTitle>
            <AlertDescription>
              Your transaction is being processed on the blockchain...
              {transactionHash && (
                <div className="mt-2 text-xs overflow-hidden text-ellipsis">
                  Transaction hash: {transactionHash}
                </div>
              )}
            </AlertDescription>
          </Alert>
        );
      case "completed":
        return (
          <Alert className="mb-4 bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-500">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            <AlertTitle>Transaction Successful!</AlertTitle>
            <AlertDescription>
              Congratulations! You now own this NFT.
              {transactionHash && (
                <div className="mt-2 text-xs overflow-hidden text-ellipsis">
                  Transaction hash: {transactionHash}
                </div>
              )}
            </AlertDescription>
          </Alert>
        );
      case "failed":
        return (
          <Alert className="mb-4 bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-500">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <AlertTitle>Transaction Failed</AlertTitle>
            <AlertDescription>
              {errorMessage || "An error occurred while processing your transaction."}
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buy NFT</DialogTitle>
          <DialogDescription>
            Confirm your purchase of this NFT
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {renderTransactionStatus()}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">NFT Name:</span>
              <span>{nft.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Price:</span>
              <span className="text-lg font-bold text-primary">{nft.price} {nft.currency}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Seller:</span>
              <span>Creator #{nft.creatorId}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center">
          {!isConnected ? (
            <>
              <Button variant="outline" onClick={onClose} className="mr-2">
                Cancel
              </Button>
              <Button onClick={handleConnectWallet}>
                Connect Wallet
              </Button>
            </>
          ) : transactionStatus === "completed" ? (
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={onClose} 
                disabled={transactionStatus === "confirming" || transactionStatus === "processing"} 
                className="mr-2"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleBuyNFT}
                disabled={
                  transactionStatus === "confirming" || 
                  transactionStatus === "processing" || 
                  transactionStatus === "completed"
                }
              >
                {transactionStatus === "confirming" || transactionStatus === "processing" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : "Confirm Purchase"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}