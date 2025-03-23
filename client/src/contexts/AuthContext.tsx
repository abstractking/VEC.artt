import React, { createContext, useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useWallet } from "@/hooks/useVechain";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, walletAddress: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { walletAddress, isConnected } = useWallet();
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isDebugMode = import.meta.env.DEV || window.location.hostname.includes('replit');
  
  // Query for user based on wallet address
  const { 
    data: user, 
    isLoading,
    refetch
  } = useQuery<User>({
    queryKey: [`/api/users/wallet/${walletAddress}`],
    enabled: isConnected && !!walletAddress,
    staleTime: 300000, // 5 minutes,
  });

  // Create a login function as a callback to avoid re-creation
  const login = useCallback(async (username: string, walletAddressParam: string) => {
    try {
      setError(null);
      const response = await apiRequest("POST", "/api/users", {
        username,
        walletAddress: walletAddressParam,
        email: `${username}@example.com`, // In a real app, this would be a real email
      });
      
      const newUser = await response.json();
      queryClient.setQueryData([`/api/users/wallet/${walletAddressParam}`], newUser);
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      
      toast({
        title: "Account created",
        description: `Welcome to VeCollab, ${username}!`,
      });
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to create account");
      
      toast({
        title: "Login Failed",
        description: err.message || "Failed to create account",
        variant: "destructive",
      });
      throw err;
    }
  }, [queryClient, toast]);

  // Debug user auto-creation is disabled for all deployments
  useEffect(() => {
    // Check if wallet is connected but user doesn't exist
    if (isConnected && walletAddress && !user && !isLoading) {
      console.log("Wallet connected but no user exists. Manual sign up required.");
      // No debug user creation - user must sign up manually
    }
  }, [isConnected, walletAddress, user, isLoading]);

  // When wallet connects, try to fetch user
  useEffect(() => {
    if (isConnected && walletAddress) {
      refetch();
    }
  }, [isConnected, walletAddress, refetch]);

  // Logout function
  const logout = useCallback(() => {
    if (walletAddress) {
      queryClient.setQueryData([`/api/users/wallet/${walletAddress}`], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    }
  }, [queryClient, toast, walletAddress]);

  // Update profile function
  const updateProfile = useCallback(async (userData: Partial<User>) => {
    if (!user) {
      setError("You must be logged in to update your profile");
      return;
    }
    
    try {
      const response = await apiRequest("PATCH", `/api/users/${user.id}`, userData);
      const updatedUser = await response.json();
      
      // Update queries with new user data
      if (walletAddress) {
        queryClient.setQueryData([`/api/users/wallet/${walletAddress}`], updatedUser);
      }
      queryClient.setQueryData([`/api/users/${user.id}`], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (err: any) {
      console.error("Profile update error:", err);
      setError(err.message || "Failed to update profile");
      
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update profile",
        variant: "destructive",
      });
      throw err;
    }
  }, [user, queryClient, toast, walletAddress]);

  const contextValue: AuthContextType = {
    user: user || null,
    isLoading,
    error,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
