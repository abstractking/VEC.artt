import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useWallet } from "@/hooks/useVechain";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { insertNftSchema } from "@shared/schema";
import { mintNFT, generateMetadataURI } from "@/lib/nftUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { UploadCloud, Info, Loader2, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

// Extend the schema for NFT creation form
const createNftSchema = insertNftSchema.extend({
  file: z.instanceof(FileList).refine(
    (files) => files.length > 0,
    { message: "Image is required" }
  ),
  price: z.string()
    .min(1, "Price is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      { message: "Price must be a positive number" }
    ),
  isForSale: z.boolean().default(false),
  isBiddable: z.boolean().default(false),
  category: z.string().min(1, "Category is required"),
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must not exceed 50 characters"),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must not exceed 1000 characters"),
});

type CreateNftFormValues = z.infer<typeof createNftSchema>;

export default function Create() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { walletAddress, isConnected, connectWallet } = useWallet();
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'details' | 'pricing' | 'review'>('details');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with default values
  const form = useForm<CreateNftFormValues>({
    resolver: zodResolver(createNftSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      tokenId: Date.now().toString(), // A placeholder token ID
      imageUrl: "",
      creatorId: user?.id || 0,
      ownerId: user?.id || 0,
      isForSale: false,
      isBiddable: false,
      category: "",
    },
  });

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Set file to form value
      form.setValue("file", files as unknown as FileList, {
        shouldValidate: true,
      });

      // Create preview URL
      const url = URL.createObjectURL(files[0]);
      setPreviewUrl(url);
    }
  };

  // Navigate to next step
  const goToNextStep = async () => {
    let fieldsToValidate: (keyof CreateNftFormValues)[] = [];
    
    if (currentStep === 'details') {
      fieldsToValidate = ['name', 'description', 'category', 'file'];
      const isValid = await form.trigger(fieldsToValidate);
      if (isValid) setCurrentStep('pricing');
    } else if (currentStep === 'pricing') {
      if (form.getValues('isForSale')) {
        fieldsToValidate = ['price'];
        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) setCurrentStep('review');
      } else {
        setCurrentStep('review');
      }
    }
  };

  // Navigate to previous step
  const goToPrevStep = () => {
    if (currentStep === 'pricing') {
      setCurrentStep('details');
    } else if (currentStep === 'review') {
      setCurrentStep('pricing');
    }
  };

  // Handle form submission
  const onSubmit = async (values: CreateNftFormValues) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create an NFT",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "User not authenticated",
        description: "Please log in to create an NFT",
        variant: "destructive",
      });
      return;
    }

    if (!walletAddress) {
      toast({
        title: "Wallet address not found",
        description: "Please reconnect your wallet to create an NFT",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Show minting status toast
      const mintingToast = toast({
        title: "Minting NFT",
        description: "Please confirm the transaction in your wallet...",
        duration: 10000,
      });

      // Upload file to IPFS/storage (mock for now)
      // In a real implementation, we would upload to IPFS or similar service
      const mockIpfsUrl = `https://ipfs.example.com/${Date.now()}`;
      
      // Prepare NFT data
      const nftData = {
        ...values,
        imageUrl: mockIpfsUrl,
        creatorId: user.id,
        ownerId: user.id,
        metadata: {
          category: values.category,
          createdAt: new Date().toISOString(),
        },
      };
      
      // Generate metadata URI for the NFT
      const tokenURI = generateMetadataURI(nftData);
      
      // Mint NFT on the blockchain
      const mintResult = await mintNFT(tokenURI, walletAddress);
      
      // Update NFT data with blockchain information
      const blockchainNftData = {
        ...nftData,
        tokenId: mintResult?.txid || Date.now().toString(), // Use transaction ID as token ID
        blockchainTxId: mintResult?.txid || "",
      };

      // Create NFT on server
      const response = await apiRequest("POST", "/api/nfts", blockchainNftData);
      const createdNft = await response.json();
      
      // Invalidate NFT queries
      queryClient.invalidateQueries({ queryKey: ['/api/nfts'] });
      
      // Show success toasts
      toast({
        title: "NFT Minted Successfully",
        description: "Your NFT has been minted on the VeChain blockchain",
        duration: 5000,
      });
      
      toast({
        title: "NFT Created Successfully",
        description: `Your NFT "${values.name}" has been created and minted`,
      });
      
      // Navigate to the NFT detail page
      setLocation(`/nft/${createdNft.id}`);
    } catch (error) {
      console.error("Error creating NFT:", error);
      toast({
        title: "Error Creating NFT",
        description: "Failed to create your NFT. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Connect wallet if not connected
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      toast({
        title: "Wallet Connection Failed",
        description: "Failed to connect to your wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col mb-10">
          <h1 className="text-3xl font-bold font-poppins text-secondary dark:text-white mb-2">
            Create a New NFT
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create your unique NFT on VeChain blockchain and sell it on the marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* NFT Preview Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>NFT Preview</CardTitle>
                <CardDescription>This is how your NFT will appear in the marketplace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="relative group h-64 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="NFT Preview" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="text-center p-6">
                        <UploadCloud className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          NFT preview will appear here
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center mb-3">
                      {user?.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt="Creator" 
                          className="w-8 h-8 rounded-full" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                      )}
                      <div className="ml-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Creator</p>
                        <p className="text-sm font-semibold dark:text-gray-200">
                          {user?.username || "Your username"}
                        </p>
                      </div>
                    </div>
                    <h3 className="font-bold text-secondary dark:text-white text-lg mb-2">
                      {form.watch("name") || "NFT Name"}
                    </h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {form.watch("isForSale") 
                            ? (form.watch("isBiddable") ? "Current Bid" : "Price") 
                            : "Not for sale"}
                        </p>
                        <p className="text-primary font-semibold">
                          {form.watch("isForSale") ? `${form.watch("price") || "0"} VET` : ""}
                        </p>
                      </div>
                      <Button size="sm" className="bg-primary hover:bg-primary-dark text-white">
                        {form.watch("isBiddable") ? "Place bid" : "Buy now"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* NFT Creation Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Create NFT</CardTitle>
                <CardDescription>Fill in the details to mint your new NFT</CardDescription>
              </CardHeader>
              <CardContent>
                {!isConnected ? (
                  <div className="text-center py-6">
                    <Info className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-secondary dark:text-white mb-2">
                      Connect your wallet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      You need to connect your VeChain wallet to create an NFT
                    </p>
                    <Button
                      onClick={handleConnectWallet}
                      className="bg-primary hover:bg-primary-dark text-white"
                    >
                      Connect Wallet
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <div className="mb-8">
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div 
                            className={`flex items-center cursor-pointer ${currentStep === 'details' ? 'text-primary font-semibold' : 'text-gray-500 dark:text-gray-400'}`}
                            onClick={() => setCurrentStep('details')}
                          >
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-2 ${currentStep === 'details' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                              1
                            </div>
                            <span>Details</span>
                          </div>
                          <div className="flex-1 h-0.5 mx-4 bg-gray-200 dark:bg-gray-700">
                            <div className={`h-full bg-primary transition-all ${currentStep === 'details' ? 'w-0' : currentStep === 'pricing' ? 'w-1/2' : 'w-full'}`}></div>
                          </div>
                          <div 
                            className={`flex items-center cursor-pointer ${currentStep === 'pricing' ? 'text-primary font-semibold' : 'text-gray-500 dark:text-gray-400'}`}
                            onClick={() => {
                              if (Object.keys(form.formState.errors).length === 0 || currentStep === 'pricing' || currentStep === 'review') {
                                setCurrentStep('pricing');
                              } else {
                                form.trigger(['name', 'description', 'category', 'file']);
                              }
                            }}
                          >
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-2 ${currentStep === 'pricing' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                              2
                            </div>
                            <span>Pricing</span>
                          </div>
                          <div className="flex-1 h-0.5 mx-4 bg-gray-200 dark:bg-gray-700">
                            <div className={`h-full bg-primary transition-all ${currentStep === 'review' ? 'w-full' : 'w-0'}`}></div>
                          </div>
                          <div 
                            className={`flex items-center cursor-pointer ${currentStep === 'review' ? 'text-primary font-semibold' : 'text-gray-500 dark:text-gray-400'}`}
                            onClick={() => {
                              if (Object.keys(form.formState.errors).length === 0 || currentStep === 'review') {
                                setCurrentStep('review');
                              } else {
                                form.trigger();
                              }
                            }}
                          >
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-2 ${currentStep === 'review' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                              3
                            </div>
                            <span>Review</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Step 1: Details */}
                      {currentStep === 'details' && (
                        <>
                          <FormField
                            control={form.control}
                            name="file"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>NFT Image</FormLabel>
                                <FormControl>
                                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                  >
                                    <input
                                      type="file"
                                      ref={fileInputRef}
                                      className="hidden"
                                      accept="image/*"
                                      onChange={handleFileChange}
                                    />
                                    {previewUrl ? (
                                      <div className="relative">
                                        <img 
                                          src={previewUrl} 
                                          alt="Preview" 
                                          className="max-h-48 rounded-lg" 
                                        />
                                        <Button
                                          type="button"
                                          variant="secondary"
                                          size="sm"
                                          className="mt-2"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewUrl("");
                                            form.setValue("file", undefined as any);
                                          }}
                                        >
                                          Change Image
                                        </Button>
                                      </div>
                                    ) : (
                                      <>
                                        <UploadCloud className="h-12 w-12 text-gray-400 mb-3" />
                                        <p className="text-gray-600 dark:text-gray-300 font-medium">Click to upload</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                          Supports JPG, PNG, GIF (Max 10MB)
                                        </p>
                                      </>
                                    )}
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>NFT Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter the name of your NFT" {...field} />
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
                                    className="resize-none" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="art">Art</SelectItem>
                                    <SelectItem value="collectibles">Collectibles</SelectItem>
                                    <SelectItem value="photography">Photography</SelectItem>
                                    <SelectItem value="music">Music</SelectItem>
                                    <SelectItem value="games">Games</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      {/* Step 2: Pricing */}
                      {currentStep === 'pricing' && (
                        <>
                          <FormField
                            control={form.control}
                            name="isForSale"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 dark:border-gray-700">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Put on sale</FormLabel>
                                  <FormDescription>
                                    List your NFT for sale on the marketplace
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
                            <>
                              <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Price (VET)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="Enter price in VET"
                                        min="0"
                                        step="0.01"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="isBiddable"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 dark:border-gray-700">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">Allow bids</FormLabel>
                                      <FormDescription>
                                        Allow users to place bids on your NFT
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
                            </>
                          )}
                        </>
                      )}

                      {/* Step 3: Review */}
                      {currentStep === 'review' && (
                        <div className="space-y-8">
                          <div className="border rounded-lg p-6 dark:border-gray-700">
                            <h3 className="text-lg font-semibold mb-4 dark:text-white">NFT Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                                <p className="font-medium dark:text-white">{form.getValues("name")}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                                <p className="font-medium dark:text-white">{form.getValues("category")}</p>
                              </div>
                              <div className="md:col-span-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                                <p className="font-medium dark:text-white">{form.getValues("description")}</p>
                              </div>
                            </div>
                          </div>

                          <div className="border rounded-lg p-6 dark:border-gray-700">
                            <h3 className="text-lg font-semibold mb-4 dark:text-white">Pricing</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">For Sale</p>
                                <p className="font-medium dark:text-white">{form.getValues("isForSale") ? "Yes" : "No"}</p>
                              </div>
                              {form.getValues("isForSale") && (
                                <>
                                  <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                                    <p className="font-medium dark:text-white">{form.getValues("price")} VET</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Allow Bids</p>
                                    <p className="font-medium dark:text-white">{form.getValues("isBiddable") ? "Yes" : "No"}</p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="border rounded-lg p-6 dark:border-gray-700">
                            <h3 className="text-lg font-semibold mb-4 dark:text-white">Technical Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Creator</p>
                                <p className="font-medium dark:text-white">{user?.username || "Unknown"}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Wallet Address</p>
                                <p className="font-medium truncate dark:text-white">{walletAddress || "Not connected"}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Network</p>
                                <p className="font-medium dark:text-white">VeChain</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </form>
                  </Form>
                )}
              </CardContent>
              
              {isConnected && (
                <CardFooter className="flex justify-between">
                  {currentStep !== 'details' && (
                    <Button 
                      variant="outline" 
                      onClick={goToPrevStep}
                      className="flex items-center"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                  )}
                  
                  {currentStep !== 'review' ? (
                    <Button
                      className="ml-auto bg-primary hover:bg-primary-dark text-white"
                      onClick={goToNextStep}
                    >
                      Next Step
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      className="ml-auto bg-primary hover:bg-primary-dark text-white"
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Minting on VeChain...
                        </>
                      ) : (
                        <>
                          Mint NFT on VeChain
                          <CheckCircle2 className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}