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

  // Auto-create a debug user when in debug mode and wallet is connected
  useEffect(() => {
    const createDebugUser = async () => {
      // Check if we're in debug mode with a connected wallet but no user
      if (isDebugMode && isConnected && walletAddress && !user && !isLoading) {
        console.log("Creating debug user for wallet:", walletAddress);
        try {
          // Check if user exists first by directly fetching
          const userCheckResponse = await fetch(`/api/users/wallet/${walletAddress}`);
          
          // Only create a new user if one doesn't exist
          if (!userCheckResponse.ok && userCheckResponse.status === 404) {
            // Auto-create a debug user
            await login("DebugUser", walletAddress);
            // Refetch to update the context with the newly created user
            setTimeout(() => refetch(), 500);
          } else if (userCheckResponse.ok) {
            // User exists, no need to create
            const userData = await userCheckResponse.json();
            console.log("Found existing user for debug wallet:", userData);
          } else {
            // If there was no 404, something else might be wrong
            console.error("Unexpected response when checking for debug user:", userCheckResponse.status);
          }
        } catch (err) {
          console.error("Error creating debug user:", err);
        }
      }
    };
    
    createDebugUser();
  }, [isDebugMode, isConnected, walletAddress, user, isLoading, refetch, login]);

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
