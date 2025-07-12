import { useState, useCallback } from 'react';
import { orderApi } from '../lib/api';

export function useOrderApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [volume, setVolume] = useState(null);

  // Create buy order
  const createBuyOrder = useCallback(async (orderData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await orderApi.createBuyOrder(orderData);
      return result.order;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create sell order
  const createSellOrder = useCallback(async (orderData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await orderApi.createSellOrder(orderData);
      return result.order;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user orders
  const getUserOrders = useCallback(async (walletAddress, options = {}) => {
    if (!walletAddress) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await orderApi.getUserOrders(walletAddress, options);
      setOrders(result.orders);
      return result.orders;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user volume
  const getUserVolume = useCallback(async (walletAddress, options = {}) => {
    if (!walletAddress) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await orderApi.getUserVolume(walletAddress, options);
      setVolume(result.volume);
      return result.volume;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark order as completed
  const completeOrder = useCallback(async (orderId, transactionData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await orderApi.completeOrder(orderId, transactionData);
      // Update the order in the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'COMPLETED', ...result.order }
            : order
        )
      );
      return result.order;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark order as failed
  const failOrder = useCallback(async (orderId, errorData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await orderApi.failOrder(orderId, errorData);
      // Update the order in the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'FAILED', ...result.order }
            : order
        )
      );
      return result.order;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get token volume
  const getTokenVolume = useCallback(async (tokenSymbol, options = {}) => {
    if (!tokenSymbol) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await orderApi.getTokenVolume(tokenSymbol, options);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get trading stats
  const getStats = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await orderApi.getStats(options);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add order to local state
  const addOrder = useCallback((order) => {
    setOrders(prevOrders => [order, ...prevOrders]);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear orders
  const clearOrders = useCallback(() => {
    setOrders([]);
  }, []);

  // Clear volume
  const clearVolume = useCallback(() => {
    setVolume(null);
  }, []);

  return {
    orders,
    volume,
    loading,
    error,
    createBuyOrder,
    createSellOrder,
    getUserOrders,
    getUserVolume,
    completeOrder,
    failOrder,
    getTokenVolume,
    getStats,
    addOrder,
    clearError,
    clearOrders,
    clearVolume,
  };
} 