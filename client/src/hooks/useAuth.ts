import { useState, useEffect } from 'react';
import { useVeChainWallet } from '../context/VeChainWalletProvider';

export interface User {
  id: number;
  username: string;
  email?: string;
  walletAddress?: string;
  profileImage?: string;
  favorites?: number[];
}

// Basic authentication hook that uses wallet address for identification
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const { walletInfo } = useVeChainWallet();
  const account = walletInfo.address;

  useEffect(() => {
    // If wallet is connected, create a basic user profile
    if (account) {
      // In a real app, we would fetch user data from the server
      // For now, we'll create a mock user based on wallet address
      setUser({
        id: 1, // Mock ID
        username: `user_${account.slice(-6)}`,
        walletAddress: account,
        favorites: [], // Initialize empty favorites array
      });
    } else {
      setUser(null);
    }
  }, [account]);

  // Basic authentication methods
  const login = async (username: string, password: string) => {
    // In a real app, we would verify credentials
    // For now, just set a mock user
    setUser({
      id: 1,
      username,
      email: `${username}@example.com`,
    });
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };
}