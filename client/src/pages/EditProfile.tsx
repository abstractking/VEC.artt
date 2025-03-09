import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  CheckCircle2,
  Image,
  Loader2,
  User,
  Link as LinkIcon,
  Twitter,
  Instagram,
  Globe,
  Award,
} from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { FileUpload } from "@/components/ui/file-upload";

// Form validation schema
const profileFormSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  bio: z.string().max(500).optional(),
  profileImage: z.string().optional().or(z.literal("")), // Allow both URLs and base64
  coverImage: z.string().optional().or(z.literal("")), // Allow both URLs and base64
  website: z.string().url().optional().or(z.literal("")),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function EditProfile() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerificationSubmitting, setIsVerificationSubmitting] = useState(false);
  
  // Create form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      email: "",
      bio: "",
      profileImage: "",
      coverImage: "",
      website: "",
      twitter: "",
      instagram: "",
    },
  });

  // Load user data into form when available
  useEffect(() => {
    if (user) {
      const socialLinks = user.socialLinks as { 
        website?: string;
        twitter?: string;
        instagram?: string;
      } || {};

      form.reset({
        username: user.username,
        email: user.email,
        bio: user.bio || "",
        profileImage: user.profileImage || "",
        coverImage: user.coverImage || "",
        website: socialLinks.website || "",
        twitter: socialLinks.twitter || "",
        instagram: socialLinks.instagram || "",
      });
    }
  }, [user, form]);

  // Handle profile update submission
  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Extract social links into the correct format
      const socialLinks = {
        website: values.website || "",
        twitter: values.twitter || "",
        instagram: values.instagram || "",
      };
      
      // Remove social links from the values to be sent to API
      const { website, twitter, instagram, ...updatedProfile } = values;
      
      // Update the profile
      await updateProfile({
        ...updatedProfile,
        socialLinks,
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      // Navigate back to profile
      setLocation("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle verification request
  const requestVerification = async () => {
    if (!user) return;
    
    setIsVerificationSubmitting(true);
    
    try {
      await apiRequest(`/api/users/${user.id}`, "PATCH", {
        verificationRequestDate: new Date().toISOString(),
      });
      
      toast({
        title: "Verification Requested",
        description: "Your verification request has been submitted for review.",
      });
      
      setIsVerificationOpen(false);
    } catch (error) {
      console.error("Error requesting verification:", error);
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: "There was an error submitting your verification request. Please try again.",
      });
    } finally {
      setIsVerificationSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        <Button 
          variant="outline" 
          onClick={() => setLocation("/profile")}
        >
          Cancel
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Profile Preview */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <div className="relative w-24 h-24 mb-4">
                <Avatar className="w-24 h-24 border-4 border-background">
                  <AvatarImage src={form.watch("profileImage")} />
                  <AvatarFallback className="text-xl">
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                {user.isVerified && (
                  <Badge className="absolute -bottom-2 -right-2 bg-blue-500 hover:bg-blue-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                  </Badge>
                )}
              </div>
              
              <h3 className="text-xl font-bold">{form.watch("username")}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-3 max-w-[200px] line-clamp-3">
                {form.watch("bio") || "No bio provided."}
              </p>
              
              <div className="flex flex-col gap-2 w-full mt-4">
                {form.watch("website") && (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Globe className="h-4 w-4" />
                    <span className="truncate max-w-[160px]">{form.watch("website")}</span>
                  </div>
                )}
                {form.watch("twitter") && (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Twitter className="h-4 w-4" />
                    <span className="truncate max-w-[160px]">@{form.watch("twitter")}</span>
                  </div>
                )}
                {form.watch("instagram") && (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Instagram className="h-4 w-4" />
                    <span className="truncate max-w-[160px]">@{form.watch("instagram")}</span>
                  </div>
                )}
              </div>
              
              {!user.isVerified && !user.verificationRequestDate && (
                <Button 
                  variant="secondary" 
                  className="mt-6"
                  onClick={() => setIsVerificationOpen(true)}
                >
                  <Award className="h-4 w-4 mr-2" /> Request Verification
                </Button>
              )}
              
              {!user.isVerified && user.verificationRequestDate && (
                <Badge variant="outline" className="mt-6 py-2">
                  Verification Pending
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Edit Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Your username" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is your public display name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your email address for notifications.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell the world about yourself"
                            className="resize-none min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Your public bio. Maximum 500 characters.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="profileImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Image</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <FileUpload 
                              onChange={field.onChange}
                              value={field.value}
                              type="profile"
                              label="Upload profile image"
                            />
                            <div className="flex items-center">
                              <span className="text-sm text-muted-foreground mr-2">or</span>
                              <div className="flex-1">
                                <Input 
                                  placeholder="https://example.com/your-image.jpg" 
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </div>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload or provide a URL for your profile picture.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <FileUpload 
                              onChange={field.onChange}
                              value={field.value}
                              type="cover"
                              label="Upload cover image"
                            />
                            <div className="flex items-center">
                              <span className="text-sm text-muted-foreground mr-2">or</span>
                              <div className="flex-1">
                                <Input 
                                  placeholder="https://example.com/your-cover.jpg" 
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </div>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload or provide a URL for your profile banner image.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4">Social Links</h3>
                    
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                                <Input placeholder="https://your-website.com" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <Twitter className="h-4 w-4 mr-2 text-muted-foreground" />
                                <Input placeholder="username (without @)" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <Instagram className="h-4 w-4 mr-2 text-muted-foreground" />
                                <Input placeholder="username (without @)" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2 flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full md:w-auto"
                    >
                      {isSubmitting ? (
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
        </div>
      </div>
      
      {/* Verification Request Sheet */}
      <Sheet open={isVerificationOpen} onOpenChange={setIsVerificationOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Request Verification</SheetTitle>
            <SheetDescription>
              Get verified to show that you're an authentic creator on VeCollab.
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6">
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Establish Authenticity</h4>
                  <p className="text-sm text-muted-foreground">
                    Verification helps collectors know they're supporting the real artist.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Enhanced Visibility</h4>
                  <p className="text-sm text-muted-foreground">
                    Verified artists appear more prominently in marketplace searches.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <LinkIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Access to Collaborations</h4>
                  <p className="text-sm text-muted-foreground">
                    Verification is required to participate in official marketplace events.
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              Our team will review your profile and verify your identity. This process typically takes 2-3 business days.
            </p>
          </div>
          
          <SheetFooter>
            <Button 
              variant="secondary" 
              onClick={() => setIsVerificationOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={requestVerification}
              disabled={isVerificationSubmitting}
            >
              {isVerificationSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : "Submit Request"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}