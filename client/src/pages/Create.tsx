import { useState, useRef, useContext } from "react";
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
import { AuthContext } from "@/contexts/AuthContext";
import { useVeChain } from "@/contexts/VeChainContext";
import TransactionConfirmDialog, { TransactionDetails } from "@/components/TransactionConfirmDialog";
import BlockchainConnectionError from "@/components/BlockchainConnectionError";
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
import { Slider } from "@/components/ui/slider";

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
  royaltyPercentage: z.number().min(0).max(70).default(0),
  royaltyCollabPercentage: z.number().min(0).max(100).default(0),
  collabPercentage: z.number().min(0).max(100).default(0),
  collabWalletAddress: z.string().optional(),
});

type CreateNftFormValues = z.infer<typeof createNftSchema>;

export default function Create() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { walletAddress, isConnected, connectWallet } = useWallet();
  const { error: blockchainError, isInitializing } = useVeChain();
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'details' | 'pricing' | 'review'>('details');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Transaction confirmation dialog state
  const [showTxConfirm, setShowTxConfirm] = useState(false);
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  
  // Access the AuthContext for login functionality
  const authContext = useContext(AuthContext);
  const login = authContext ? authContext.login : null;

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
      royaltyPercentage: 0,
      royaltyCollabPercentage: 0,
      collabPercentage: 0,
      collabWalletAddress: "",
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

      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewUrl(base64String);
      };
      reader.readAsDataURL(files[0]);
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
      // Open wallet connection prompt
      handleConnectWallet();
      return;
    }

    if (!walletAddress) {
      toast({
        title: "Wallet address not found",
        description: "Please reconnect your wallet to create an NFT",
        variant: "destructive",
      });
      // Open wallet connection prompt
      handleConnectWallet();
      return;
    }

    try {
      // Step 1: Ensure user exists, create if not exists
      let currentUser = user;
      if (!currentUser) {
        try {
          console.log("Attempting to create or fetch user account with wallet:", walletAddress);
          
          // Show toast for user account creation
          toast({
            title: "Creating Account",
            description: "Setting up user account for your wallet...",
            duration: 3000,
          });
          
          // Generate username based on wallet address for better identification
          const username = `user_${walletAddress.slice(-6)}`;
          
          if (authContext && authContext.login) {
            await authContext.login(username, walletAddress);
            console.log("User login successful");
          } else {
            throw new Error("Authentication service is not available");
          }
          
          // Refetch the user data after login with proper error handling
          try {
            const userResponse = await apiRequest("GET", `/api/users/wallet/${walletAddress}`);
            if (!userResponse.ok) {
              throw new Error(`Failed to fetch user: ${userResponse.statusText}`);
            }
            currentUser = await userResponse.json();
            console.log("User account created/fetched successfully:", currentUser);
          } catch (fetchError) {
            console.error("Error fetching user after creation:", fetchError);
            throw new Error("Failed to retrieve user data after account creation");
          }
        } catch (error: any) {
          console.error("Error creating/fetching user account:", error);
          toast({
            title: "Account Creation Failed",
            description: error.message || "Could not create or fetch user account. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      if (!currentUser) {
        toast({
          title: "User not authenticated",
          description: "Please log in to create an NFT",
          variant: "destructive",
        });
        return;
      }

      // Step 2: Handle image file
      const files = form.getValues("file") as unknown as FileList;
      
      if (!files || files.length === 0) {
        throw new Error("Image file is required");
      }
      
      // Step 3: Prepare NFT data - use the base64 image from preview
      if (!previewUrl) {
        throw new Error("Image preview not available. Please try uploading again.");
      }
      
      const nftData = {
        ...values,
        imageUrl: previewUrl, // Use the base64 string instead of a blob URL
        creatorId: currentUser.id,
        ownerId: currentUser.id,
        // Convert numeric values to strings as required by schema
        royaltyPercentage: values.royaltyPercentage?.toString() || "0",
        royaltyCollabPercentage: values.royaltyCollabPercentage?.toString() || "0",
        collabPercentage: values.collabPercentage?.toString() || "0",
        metadata: {
          category: values.category,
          createdAt: new Date().toISOString(),
        },
      };
      
      // Step 4: Generate metadata URI for the NFT
      console.log("Generating metadata for NFT:", values.name);
      const tokenURI = generateMetadataURI(nftData);
      
      // Step 5: Show transaction confirmation dialog
      const txDetails: TransactionDetails = {
        type: 'mint',
        title: "Create NFT",
        description: "You are about to mint a new NFT on the VeChain TestNet blockchain.",
        metadata: {
          nftName: values.name,
          nftImage: previewUrl,
          price: values.isForSale ? values.price : undefined,
          currency: "VET",
          contractAddress: "0x89e658faa1e1861b7923f35f62c96fb8e07c80b2", // VeCollabNFT contract
          methodName: "mint",
          gasEstimate: "0.0001 VTHO",
        },
        onConfirm: async () => {
          try {
            // Perform the actual minting
            setIsSubmitting(true);
            const result = await mintNFT(tokenURI, walletAddress);
            
            if (!result || !result.txid) {
              throw new Error("Minting transaction failed or returned invalid result");
            }
            
            console.log("NFT minted with transaction ID:", result.txid);
            return { txid: result.txid, success: true };
          } catch (error: any) {
            console.error("Minting error:", error);
            return { txid: "", success: false };
          }
        },
        onSuccess: async (txid) => {
          try {
            // Update NFT data with blockchain information
            const blockchainNftData = {
              ...nftData,
              tokenId: txid,
              blockchainTxId: txid,
            };

            // Create NFT on server
            console.log("Saving NFT to database:", blockchainNftData);
            let response;
            try {
              response = await apiRequest("POST", "/api/nfts", blockchainNftData);
              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Server error: ${errorData.error || response.statusText || "Unknown error"}`);
              }
              
              const createdNft = await response.json();
              console.log("NFT created successfully on server:", createdNft);
              
              // Invalidate NFT queries
              queryClient.invalidateQueries({ queryKey: ['/api/nfts'] });
              
              // Navigate to the NFT detail page
              setTimeout(() => {
                setLocation(`/nft/${createdNft.id}`);
              }, 1000);
              
            } catch (serverError: any) {
              console.error("Server error creating NFT:", serverError);
              toast({
                title: "Server Error",
                description: `NFT was minted on the blockchain but couldn't be saved to our database: ${serverError.message}`,
                variant: "destructive",
              });
            }
          } finally {
            setIsSubmitting(false);
          }
        },
        onCancel: () => {
          toast({
            title: "Creation Cancelled",
            description: "NFT creation was cancelled",
          });
          setIsSubmitting(false);
        }
      };
      
      // Open the transaction confirmation dialog
      setTransaction(txDetails);
      setShowTxConfirm(true);
      
    } catch (error: any) {
      console.error("Error creating NFT:", error);
      toast({
        title: "Error Creating NFT",
        description: error.message || "Failed to create your NFT. Please try again.",
        variant: "destructive",
      });
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
      {/* Transaction Confirmation Dialog */}
      {transaction && (
        <TransactionConfirmDialog
          isOpen={showTxConfirm}
          onClose={() => setShowTxConfirm(false)}
          transaction={transaction}
        />
      )}
      
      {/* Show blockchain connection error if there's an issue with Connex */}
      {blockchainError && !isInitializing && (
        <div className="container mx-auto px-4 mb-8">
          <BlockchainConnectionError onRetry={() => window.location.reload()} />
        </div>
      )}
      
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
                {blockchainError ? (
                  <div className="text-center py-6">
                    <h3 className="text-lg font-bold text-secondary dark:text-white mb-2">
                      Blockchain Connection Issue
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Please check the error message at the top of the page
                    </p>
                  </div>
                ) : !isConnected ? (
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
                                <FormLabel htmlFor="nft-name">NFT Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    id="nft-name"
                                    placeholder="Enter the name of your NFT" 
                                    autoComplete="off"
                                    {...field} 
                                  />
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
                                <FormLabel htmlFor="nft-description">Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    id="nft-description"
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
                                <FormLabel htmlFor="nft-category">Category</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger id="nft-category">
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
                                  <FormLabel htmlFor="nft-for-sale" className="text-base">Put on sale</FormLabel>
                                  <FormDescription>
                                    List your NFT for sale on the marketplace
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    id="nft-for-sale"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    aria-label="Put NFT for sale"
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
                                    <FormLabel htmlFor="nft-price">Price (VET)</FormLabel>
                                    <FormControl>
                                      <Input
                                        id="nft-price"
                                        type="number"
                                        placeholder="Enter price in VET"
                                        min="0"
                                        step="0.01"
                                        autoComplete="off"
                                        inputMode="decimal"
                                        aria-label="NFT price in VET"
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
                                      <FormLabel htmlFor="nft-biddable" className="text-base">Allow bids</FormLabel>
                                      <FormDescription>
                                        Allow users to place bids on your NFT
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        id="nft-biddable"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        aria-label="Allow bids on NFT"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />

                              {/* NFT Revenue Settings Section */}
                              <div className="mt-6 pt-6 border-t dark:border-gray-700">
                                <h3 className="text-base font-semibold mb-4 dark:text-white">Revenue Settings</h3>
                                
                                {/* Initial Sale Split Section */}
                                <div className="mb-8">
                                  <h4 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">Initial Sale Split</h4>
                                  
                                  {/* Collab Percentage Slider */}
                                  <FormField
                                    control={form.control}
                                    name="collabPercentage"
                                    render={({ field }) => (
                                      <FormItem className="space-y-4 mb-4">
                                        <div>
                                          <FormLabel>
                                            Collaborator Percentage: {field.value}%
                                          </FormLabel>
                                          <FormDescription>
                                            Set how much of the initial sale proceeds go to a collaborator
                                          </FormDescription>
                                        </div>
                                        <FormControl>
                                          <div className="pt-2">
                                            <Slider
                                              min={0}
                                              max={100}
                                              step={1}
                                              defaultValue={[field.value]}
                                              onValueChange={(vals) => {
                                                field.onChange(vals[0]);
                                              }}
                                              aria-label="Collaborator Percentage"
                                            />
                                            <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                                              <span>0%</span>
                                              <span>50%</span>
                                              <span>100%</span>
                                            </div>
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  {/* Your/Collaborator Split Preview */}
                                  <div className="flex justify-between items-center mb-4 px-2">
                                    <div className="text-sm">
                                      <span className="text-gray-600 dark:text-gray-400">You receive: </span>
                                      <span className="font-medium dark:text-white">{100 - form.watch("collabPercentage")}%</span>
                                    </div>
                                    <div className="text-sm">
                                      <span className="text-gray-600 dark:text-gray-400">Collaborator receives: </span>
                                      <span className="font-medium dark:text-white">{form.watch("collabPercentage")}%</span>
                                    </div>
                                  </div>

                                  {/* Collaborator Wallet Address */}
                                  {form.watch("collabPercentage") > 0 && (
                                    <FormField
                                      control={form.control}
                                      name="collabWalletAddress"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Collaborator Wallet Address</FormLabel>
                                          <FormDescription>
                                            Enter the wallet address of your collaborator
                                          </FormDescription>
                                          <FormControl>
                                            <Input
                                              placeholder="0x..."
                                              {...field}
                                              className="font-mono text-sm"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  )}
                                </div>
                                
                                {/* Secondary Sales Royalties Section */}
                                <div>
                                  <h4 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">Secondary Sales Royalties</h4>
                                  
                                  {/* Royalty Percentage Slider */}
                                  <FormField
                                    control={form.control}
                                    name="royaltyPercentage"
                                    render={({ field }) => (
                                      <FormItem className="space-y-4">
                                        <div>
                                          <FormLabel>
                                            Royalty Percentage: {field.value}%
                                          </FormLabel>
                                          <FormDescription>
                                            Set the percentage (0-70%) that will apply as royalties on all future secondary sales
                                          </FormDescription>
                                        </div>
                                        <FormControl>
                                          <div className="pt-2">
                                            <Slider
                                              min={0}
                                              max={70}
                                              step={1}
                                              defaultValue={[field.value]}
                                              onValueChange={(vals) => {
                                                field.onChange(vals[0]);
                                              }}
                                              aria-label="Royalty Percentage"
                                              className="active:bg-primary/90"
                                            />
                                            <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                                              <span>0%</span>
                                              <span>15%</span>
                                              <span>30%</span>
                                              <span>45%</span>
                                              <span>60%</span>
                                              <span>70%</span>
                                            </div>
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  {/* Royalty Collaborator Split */}
                                  {form.watch("royaltyPercentage") > 0 && (
                                    <FormField
                                      control={form.control}
                                      name="royaltyCollabPercentage"
                                      render={({ field }) => (
                                        <FormItem className="space-y-4 mt-6 border-t pt-6 border-dashed border-gray-200 dark:border-gray-700">
                                          <div>
                                            <FormLabel>
                                              Royalty Split with Collaborator: {field.value}%
                                            </FormLabel>
                                            <FormDescription>
                                              Set the percentage of royalties that goes to your collaborator (the rest goes to you)
                                            </FormDescription>
                                          </div>
                                          <FormControl>
                                            <div className="pt-2">
                                              <Slider
                                                min={0}
                                                max={100}
                                                step={5}
                                                defaultValue={[field.value]}
                                                onValueChange={(vals) => {
                                                  field.onChange(vals[0]);
                                                }}
                                                aria-label="Royalty Collaborator Percentage"
                                                className="active:bg-primary/90"
                                              />
                                              <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                <span>0%</span>
                                                <span>25%</span>
                                                <span>50%</span>
                                                <span>75%</span>
                                                <span>100%</span>
                                              </div>
                                            </div>
                                          </FormControl>
                                          
                                          {/* Split visualization */}
                                          <div className="flex flex-col space-y-2 my-4">
                                            <div className="flex justify-between items-center">
                                              <span className="text-sm text-gray-600 dark:text-gray-300">You</span>
                                              <span className="text-sm font-medium text-gray-900 dark:text-white">{100 - field.value}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                              <div 
                                                className="bg-primary h-2.5 rounded-full" 
                                                style={{ width: `${100 - field.value}%` }}
                                              ></div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                              <span className="text-sm text-gray-600 dark:text-gray-300">Collaborator</span>
                                              <span className="text-sm font-medium text-gray-900 dark:text-white">{field.value}%</span>
                                            </div>
                                          </div>
                                          
                                          {field.value > 0 && (
                                            <FormField
                                              control={form.control}
                                              name="collabWalletAddress"
                                              render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel>Collaborator Wallet Address</FormLabel>
                                                  <FormDescription>
                                                    Enter the VeChain wallet address of your collaborator
                                                  </FormDescription>
                                                  <FormControl>
                                                    <Input
                                                      {...field}
                                                      placeholder="0x..."
                                                      className="font-mono"
                                                    />
                                                  </FormControl>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />
                                          )}
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  )}
                                  
                                  {/* Royalty Info Text */}
                                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      Royalties of up to {form.watch("royaltyPercentage")}% will be automatically distributed on secondary sales. 
                                      {form.watch("royaltyCollabPercentage") > 0 
                                        ? ` ${form.watch("royaltyCollabPercentage")}% of these royalties will go to your collaborator.` 
                                        : ""}
                                      The remaining {100 - form.watch("royaltyPercentage")}% of each sale goes to the seller.
                                    </p>
                                  </div>
                                </div>
                              </div>
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
                                  <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Secondary Sale Royalty</p>
                                    <p className="font-medium dark:text-white">{form.getValues("royaltyPercentage")}%</p>
                                  </div>
                                  
                                  {form.getValues("royaltyPercentage") > 0 && form.getValues("royaltyCollabPercentage") > 0 && (
                                    <div className="md:col-span-2 mt-2 border border-gray-100 dark:border-gray-800 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Royalty Split Distribution:</p>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">Creator (You)</p>
                                          <p className="font-medium dark:text-white">{100 - form.getValues("royaltyCollabPercentage")}%</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">Collaborator</p>
                                          <p className="font-medium dark:text-white">{form.getValues("royaltyCollabPercentage")}%</p>
                                        </div>
                                        <div className="col-span-2 mt-1">
                                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                            <div 
                                              className="bg-primary h-1.5 rounded-full" 
                                              style={{ width: `${100 - form.getValues("royaltyCollabPercentage")}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {form.getValues("collabPercentage") > 0 && (
                                    <>
                                      <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Initial Sale Collaboration Split</p>
                                        <p className="font-medium dark:text-white">{form.getValues("collabPercentage")}%</p>
                                      </div>
                                      <div className="md:col-span-2">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Collaborator Wallet</p>
                                        <p className="font-medium dark:text-white font-mono text-sm truncate">
                                          {form.getValues("collabWalletAddress") || "Not specified"}
                                        </p>
                                      </div>
                                    </>
                                  )}
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