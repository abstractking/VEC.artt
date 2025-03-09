import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Info, Tag, Image, AlertTriangle } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Form validation schema
const editNftSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  imageUrl: z.string().url({
    message: "Please enter a valid URL for the image.",
  }),
  price: z.string().optional(),
  isForSale: z.boolean().default(false),
  isBiddable: z.boolean().default(false),
  tags: z.string().optional(),
});

type EditNftFormValues = z.infer<typeof editNftSchema>;

export default function EditNFT() {
  const { id } = useParams();
  const nftId = parseInt(id);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Fetch NFT data
  const {
    data: nft,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['/api/nfts', nftId],
    enabled: !isNaN(nftId),
  });

  // Update NFT mutation
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/nfts/${nftId}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nfts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/nfts', nftId] });
      
      toast({
        title: "NFT Updated",
        description: "Your NFT has been successfully updated.",
      });
      
      setLocation(`/nft/${nftId}`);
    },
    onError: (error) => {
      console.error("Error updating NFT:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error updating your NFT. Please try again.",
      });
    },
  });

  // Create form
  const form = useForm<EditNftFormValues>({
    resolver: zodResolver(editNftSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      price: "",
      isForSale: false,
      isBiddable: false,
      tags: "",
    },
  });

  // Update form with NFT data when available
  useEffect(() => {
    if (nft) {
      form.reset({
        name: nft.name,
        description: nft.description || "",
        imageUrl: nft.imageUrl,
        price: nft.price || "",
        isForSale: nft.isForSale,
        isBiddable: nft.isBiddable,
        tags: "", // We'll handle tags separately
      });
      
      // Load tags if available
      if (nft.tags && Array.isArray(nft.tags)) {
        setTags(nft.tags as string[]);
      }
    }
  }, [nft, form]);

  // Check if user has permission to edit
  const canEdit = user && nft && (
    user.id === nft.creatorId || user.id === nft.ownerId
  );

  // Handle tag input
  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle form submission
  const onSubmit = async (values: EditNftFormValues) => {
    if (!canEdit) return;
    
    // Mark the NFT as edited
    const updatedNFT = {
      ...values,
      tags,
      isEdited: true,
      lastEditedAt: new Date().toISOString(),
    };
    
    mutation.mutate(updatedNFT);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load NFT details. Please try again later.
            {error instanceof Error && <p className="mt-2">{error.message}</p>}
          </AlertDescription>
        </Alert>
        <Button 
          variant="secondary" 
          onClick={() => setLocation("/explore")}
          className="mt-6"
        >
          Return to Explore
        </Button>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="container py-10">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to edit this NFT. Only the creator or current owner can make changes.
          </AlertDescription>
        </Alert>
        <Button 
          variant="secondary" 
          onClick={() => setLocation(`/nft/${nftId}`)}
          className="mt-6"
        >
          Return to NFT Details
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit NFT</h1>
        <Button 
          variant="outline" 
          onClick={() => setLocation(`/nft/${nftId}`)}
        >
          Cancel
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Listing</CardTitle>
          <CardDescription>
            Update your NFT details and settings. Changes will be recorded on the blockchain.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* NFT Preview */}
              <div className="flex flex-col sm:flex-row gap-6 pb-6 border-b">
                <div className="sm:w-1/3">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {form.watch("imageUrl") ? (
                      <img
                        src={form.watch("imageUrl")}
                        alt="NFT Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="sm:w-2/3">
                  <h2 className="text-xl font-bold mb-2">{form.watch("name") || "Untitled NFT"}</h2>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {form.watch("description") || "No description provided."}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {tags.length === 0 && (
                      <span className="text-xs text-muted-foreground">No tags</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {form.watch("isForSale") && (
                      <Badge variant="outline" className="text-xs font-medium">
                        For Sale: {form.watch("price") || "0"} VET
                      </Badge>
                    )}
                    {form.watch("isBiddable") && (
                      <Badge variant="outline" className="text-xs font-medium">
                        Accepts Bids
                      </Badge>
                    )}
                    {nft.isEdited && (
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 text-xs">
                        Edited
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Basic Details */}
              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter NFT name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your NFT..."
                          className="resize-none min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/your-image.jpg" {...field} />
                      </FormControl>
                      <FormDescription>
                        Direct link to your NFT image.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Tags input */}
                <div>
                  <FormLabel>Tags</FormLabel>
                  <div className="flex gap-2 mt-1.5">
                    <div className="flex-1">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a tag"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                    </div>
                    <Button type="button" onClick={addTag} variant="secondary">
                      Add
                    </Button>
                  </div>
                  <FormDescription className="mt-1.5">
                    Press Enter or click Add to add a tag.
                  </FormDescription>
                  
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="px-2 py-1">
                          {tag}
                          <button 
                            type="button" 
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-muted-foreground hover:text-foreground"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Sale Settings */}
              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Sale Settings</h3>
                
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="isForSale"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">List for Sale</FormLabel>
                          <FormDescription>
                            Make this NFT available for purchase.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("isForSale") && (
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (VET)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Set your asking price in VeChain (VET) tokens.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="isBiddable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Accept Bids</FormLabel>
                          <FormDescription>
                            Allow others to place bids on this NFT.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Warning about royalties */}
              <Alert variant="default" className="bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-100">
                <Info className="h-4 w-4" />
                <AlertTitle>Important Information</AlertTitle>
                <AlertDescription>
                  <p>Royalty settings and collaborators cannot be changed after initial creation.</p>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="link" className="p-0 h-auto text-amber-700 dark:text-amber-300">
                        Why can't I change these?
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium">Royalty Immutability</h4>
                        <p className="text-sm">
                          Royalties and collaborator shares are permanently written to the blockchain during minting to 
                          ensure fairness to all parties involved in the NFT's creation.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </AlertDescription>
              </Alert>
              
              <div className="pt-4 flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAlertOpen(true)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Any unsaved changes will be lost. Are you sure you want to cancel?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={() => setLocation(`/nft/${nftId}`)}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}