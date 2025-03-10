import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { NFT } from "@shared/schema";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, addHours, addDays, isBefore } from "date-fns";

interface EditListingDialogProps {
  nft: NFT;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditListingDialog({
  nft,
  isOpen,
  onClose,
  onSuccess
}: EditListingDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isForSale, setIsForSale] = useState(nft?.isForSale || false);
  const [isBiddable, setIsBiddable] = useState(nft?.isBiddable || false);
  const [price, setPrice] = useState(nft?.price || "");
  const [currency, setCurrency] = useState(nft?.currency || "VET");
  
  // Auction settings
  const [auctionEndDate, setAuctionEndDate] = useState<Date | undefined>(undefined);
  const [auctionDuration, setAuctionDuration] = useState<string>("1d");
  const [auctionEndDateOpen, setAuctionEndDateOpen] = useState(false);

  // Update form values when NFT changes
  useEffect(() => {
    if (nft) {
      setIsForSale(nft.isForSale || false);
      setIsBiddable(nft.isBiddable || false);
      setPrice(nft.price || "");
      setCurrency(nft.currency || "VET");
    }
  }, [nft]);

  // Calculate auction end date based on duration selection
  useEffect(() => {
    if (isBiddable) {
      const now = new Date();
      let endDate: Date;

      switch (auctionDuration) {
        case "1h":
          endDate = addHours(now, 1);
          break;
        case "6h":
          endDate = addHours(now, 6);
          break;
        case "12h":
          endDate = addHours(now, 12);
          break;
        case "1d":
          endDate = addDays(now, 1);
          break;
        case "3d":
          endDate = addDays(now, 3);
          break;
        case "7d":
          endDate = addDays(now, 7);
          break;
        default:
          endDate = addDays(now, 1);
      }

      setAuctionEndDate(endDate);
    }
  }, [isBiddable, auctionDuration]);

  // Set sale or auction values
  const handleSwitchSaleChange = (checked: boolean) => {
    setIsForSale(checked);
    if (!checked) {
      setIsBiddable(false);
    }
  };

  const handleSwitchAuctionChange = (checked: boolean) => {
    setIsBiddable(checked);
  };

  const validateForm = () => {
    if (isForSale) {
      if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        toast({
          title: "Invalid price",
          description: "Please enter a valid price.",
          variant: "destructive",
        });
        return false;
      }

      if (!currency) {
        toast({
          title: "Missing currency",
          description: "Please select a currency.",
          variant: "destructive",
        });
        return false;
      }

      if (isBiddable && !auctionEndDate) {
        toast({
          title: "Missing auction end date",
          description: "Please set an auction end date.",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Prepare data for NFT update
      const updateData: Partial<NFT> = {
        isForSale,
        isBiddable,
        price: isForSale ? price : undefined,
        currency: isForSale ? currency : undefined,
      };

      // Add auction end date if auction
      if (isForSale && isBiddable && auctionEndDate) {
        updateData.metadata = {
          ...nft.metadata,
          auctionEndDate: auctionEndDate.toISOString(),
          auctionStartDate: new Date().toISOString()
        };
      }

      // Make API request to update NFT
      const response = await apiRequest("PATCH", `/api/nfts/${nft.id}`, updateData);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update listing");
      }

      // Invalidate queries to refresh NFT data
      queryClient.invalidateQueries({ queryKey: ['/api/nfts'] });
      queryClient.invalidateQueries({ queryKey: [`/api/nfts/${nft.id}`] });

      toast({
        title: "Listing updated",
        description: isForSale 
          ? (isBiddable ? "Auction started successfully" : "NFT listed for sale") 
          : "NFT removed from listings",
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Close dialog
      onClose();
    } catch (error: any) {
      toast({
        title: "Error updating listing",
        description: error.message || "Failed to update NFT listing",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Listing</DialogTitle>
          <DialogDescription>
            Update the listing settings for your NFT
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isForSale" className="font-medium">List for Sale</Label>
              <p className="text-sm text-muted-foreground">
                Make this NFT available for purchase
              </p>
            </div>
            <Switch
              id="isForSale"
              checked={isForSale}
              onCheckedChange={handleSwitchSaleChange}
            />
          </div>

          {isForSale && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VET">VET</SelectItem>
                      <SelectItem value="VTHO">VTHO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <Label htmlFor="isBiddable" className="font-medium">Enable Auction</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to place bids on this NFT
                  </p>
                </div>
                <Switch
                  id="isBiddable"
                  checked={isBiddable}
                  onCheckedChange={handleSwitchAuctionChange}
                />
              </div>

              {isBiddable && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="auctionDuration">Auction Duration</Label>
                  <Select value={auctionDuration} onValueChange={setAuctionDuration}>
                    <SelectTrigger id="auctionDuration">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="6h">6 hours</SelectItem>
                      <SelectItem value="12h">12 hours</SelectItem>
                      <SelectItem value="1d">1 day</SelectItem>
                      <SelectItem value="3d">3 days</SelectItem>
                      <SelectItem value="7d">7 days</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="mt-4">
                    <Label htmlFor="auctionEndDate">Auction Ends</Label>
                    <Popover open={auctionEndDateOpen} onOpenChange={setAuctionEndDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-1"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {auctionEndDate ? format(auctionEndDate, 'PPP HH:mm') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={auctionEndDate}
                          onSelect={(date) => {
                            if (date) {
                              setAuctionEndDate(date);
                              setAuctionEndDateOpen(false);
                            }
                          }}
                          disabled={(date) => isBefore(date, new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Listing"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}