import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { insertNftSchema } from "@shared/schema";
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
import { UploadCloud, Loader2, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
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
    try {
      setIsSubmitting(true);
      
      // Check if user is authenticated
      if (!user) {
        toast({
          title: "User not authenticated",
          description: "Please log in to create an NFT",
          variant: "destructive",
        });
        return;
      }

      // Validate image file
      const files = form.getValues("file") as unknown as FileList;
      if (!files || files.length === 0) {
        throw new Error("Image file is required");
      }
      
      // Validate preview
      if (!previewUrl) {
        throw new Error("Image preview not available. Please try uploading again.");
      }
      
      // Prepare NFT data
      const nftData = {
        ...values,
        imageUrl: previewUrl,
        creatorId: user.id,
        ownerId: user.id,
        tokenId: Date.now().toString(16), // Simple tokenId generation
        // Convert numeric values to strings as required by schema
        royaltyPercentage: values.royaltyPercentage?.toString() || "0",
        royaltyCollabPercentage: values.royaltyCollabPercentage?.toString() || "0",
        collabPercentage: values.collabPercentage?.toString() || "0",
        metadata: {
          category: values.category,
          createdAt: new Date().toISOString(),
        },
      };
      
      // Create NFT on server (without blockchain)
      console.log("Saving NFT to database:", nftData);
      const response = await apiRequest("POST", "/api/nfts", nftData);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Server error: ${errorData.error || response.statusText || "Unknown error"}`);
      }
      
      const createdNft = await response.json();
      console.log("NFT created successfully:", createdNft);
      
      // Invalidate NFT queries
      queryClient.invalidateQueries({ queryKey: ['/api/nfts'] });
      
      toast({
        title: "NFT Created",
        description: "Your NFT has been created successfully!",
      });
      
      // Navigate to the NFT detail page
      setTimeout(() => {
        setLocation(`/nft/${createdNft.id}`);
      }, 1500);
    } catch (error: any) {
      console.error("Error creating NFT:", error);
      toast({
        title: "Error Creating NFT",
        description: error.message || "Failed to create your NFT. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
            Create your unique NFT and list it on the marketplace
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
                <CardDescription>Fill in the details to create your new NFT</CardDescription>
              </CardHeader>
              <CardContent>
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
                                
                                {/* Royalty Percentage Slider */}
                                <FormField
                                  control={form.control}
                                  name="royaltyPercentage"
                                  render={({ field }) => (
                                    <FormItem className="space-y-4">
                                      <div>
                                        <FormLabel>
                                          Creator Royalty: {field.value}%
                                        </FormLabel>
                                        <FormDescription>
                                          Set royalty percentage that you'll receive on future sales
                                        </FormDescription>
                                      </div>
                                      <FormControl>
                                        <div className="pt-2">
                                          <Slider
                                            defaultValue={[field.value]}
                                            max={70}
                                            step={1}
                                            onValueChange={(values) => {
                                              field.onChange(values[0]);
                                            }}
                                          />
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {/* Collaborator Settings Section */}
                              <div className="mt-6">
                                <h4 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">Collaboration Settings</h4>
                                
                                {/* Collaborator Percentage Slider */}
                                <FormField
                                  control={form.control}
                                  name="collabPercentage"
                                  render={({ field }) => (
                                    <FormItem className="space-y-4">
                                      <div>
                                        <FormLabel>
                                          Collaborator Percentage: {field.value}%
                                        </FormLabel>
                                        <FormDescription>
                                          Percentage of sales that will go to your collaborator
                                        </FormDescription>
                                      </div>
                                      <FormControl>
                                        <div className="pt-2">
                                          <Slider
                                            defaultValue={[field.value]}
                                            max={100}
                                            step={1}
                                            onValueChange={(values) => {
                                              field.onChange(values[0]);
                                            }}
                                          />
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {form.watch("collabPercentage") > 0 && (
                                  <FormField
                                    control={form.control}
                                    name="collabWalletAddress"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Collaborator Address</FormLabel>
                                        <FormControl>
                                          <Input 
                                            placeholder="e.g. 0x123..." 
                                            autoComplete="off"
                                            {...field} 
                                          />
                                        </FormControl>
                                        <FormDescription>
                                          Enter the wallet address of your collaborator
                                        </FormDescription>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {/* Step 3: Review */}
                    {currentStep === 'review' && (
                      <div className="space-y-6">
                        <div className="rounded-lg border dark:border-gray-700 overflow-hidden">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                            <h3 className="text-lg font-semibold dark:text-white">Review Your NFT Details</h3>
                          </div>
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</h4>
                                <p className="font-medium dark:text-white">{form.getValues('name')}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h4>
                                <p className="font-medium dark:text-white capitalize">{form.getValues('category')}</p>
                              </div>
                              <div className="md:col-span-2">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h4>
                                <p className="font-medium dark:text-white">{form.getValues('description')}</p>
                              </div>
                              
                              {form.getValues('isForSale') && (
                                <>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Price</h4>
                                    <p className="font-medium dark:text-white">{form.getValues('price')} VET</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sale Type</h4>
                                    <p className="font-medium dark:text-white">{form.getValues('isBiddable') ? 'Auction' : 'Fixed Price'}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Royalty</h4>
                                    <p className="font-medium dark:text-white">{form.getValues('royaltyPercentage')}%</p>
                                  </div>
                                  {form.getValues('collabPercentage') > 0 && (
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Collaborator Split</h4>
                                      <p className="font-medium dark:text-white">{form.getValues('collabPercentage')}%</p>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
              
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
                        Creating NFT...
                      </>
                    ) : (
                      <>
                        Create NFT
                        <CheckCircle2 className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}