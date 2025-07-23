import { useState, useCallback } from 'react';
import { userApi } from '../lib/api';

interface UserData {
  id: string;
  username: string;
  displayName: string;
  walletAddress: string;
  referralCode: string;
  referralCount: number;
  totalVolume: number;
  lastLogin: string;
  createdAt: string;
}

interface ReferralData {
  referralCode: string;
  referralCount: number;
  totalVolume: number;
  referredUsers: Array<{
    username: string;
    displayName: string;
    createdAt: string;
  }>;
}

export function useUserApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);

  // Check if user exists
  const checkUser = useCallback(async (walletAddress: string): Promise<boolean> => {
    if (!walletAddress) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await userApi.isUser(walletAddress);
      return result.exists;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new user
  const createUser = useCallback(async (userData: any): Promise<UserData> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await userApi.createUser(userData);
      setUser(result.user);
      return result.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check username uniqueness
  const checkUsername = useCallback(async (username: string): Promise<boolean> => {
    if (!username) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await userApi.isUniqueUsername(username);
      return result.isUnique;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user profile
  const getProfile = useCallback(async (walletAddress: string): Promise<UserData | null> => {
    if (!walletAddress) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await userApi.getProfile(walletAddress);
      setUser(result.user);
      return result.user;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (walletAddress: string, profileData: any): Promise<UserData | null> => {
    if (!walletAddress) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await userApi.updateProfile(walletAddress, profileData);
      setUser(result.user);
      return result.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user referrals
  const getReferrals = useCallback(async (walletAddress: string): Promise<ReferralData | null> => {
    if (!walletAddress) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await userApi.getReferrals(walletAddress);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear user
  const clearUser = useCallback(() => {
    setUser(null);
  }, []);

  return {
    user,
    loading,
    error,
    checkUser,
    createUser,
    checkUsername,
    getProfile,
    updateProfile,
    getReferrals,
    clearError,
    clearUser,
  };
} 