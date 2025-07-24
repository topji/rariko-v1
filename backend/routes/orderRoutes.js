const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const router = express.Router();

// Middleware to validate order data
const validateOrderData = (req, res, next) => {
  const { walletAddress, tokenSymbol, tokenAddress, amount, price, totalValue } = req.body;
  
  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }
  
  if (!tokenSymbol) {
    return res.status(400).json({ error: 'Token symbol is required' });
  }
  
  if (!tokenAddress) {
    return res.status(400).json({ error: 'Token address is required' });
  }
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }
  
  if (!price || price <= 0) {
    return res.status(400).json({ error: 'Valid price is required' });
  }
  
  if (!totalValue || totalValue <= 0) {
    return res.status(400).json({ error: 'Valid total value is required' });
  }
  
  next();
};

// Helper function to get user by wallet address
const getUserByWalletAddress = async (walletAddress) => {
  const user = await User.findByWalletAddress(walletAddress);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

// @route   POST /api/orders/createBuyOrder
// @desc    Create a completed buy order
// @access  Public
router.post('/createBuyOrder', validateOrderData, async (req, res) => {
  try {
    const { 
      walletAddress, 
      tokenSymbol, 
      tokenAddress, 
      amount, 
      price, 
      totalValue,
      metadata,
      transactionHash,
      tokenAmount,
      feeInUSD
    } = req.body;
    
    // Get user
    const user = await getUserByWalletAddress(walletAddress);
    
    // Create completed buy order
    const order = new Order({
      user: user._id,
      orderType: 'BUY',
      tokenSymbol: tokenSymbol.toUpperCase(),
      tokenAddress,
      amount,
      price,
      totalValue,
      status: 'COMPLETED',
      transactionHash: transactionHash || null,
      metadata: {
        ...(metadata || {}),
        tokenAmount,
        feeInUSD,
        timestamp: new Date()
      },
      completedAt: new Date()
    });
    
    await order.save();
    
    // Update user's total volume
    await user.updateVolume(totalValue);
    
    res.status(201).json({
      message: 'Buy order created successfully',
      order: {
        id: order._id,
        orderType: order.orderType,
        tokenSymbol: order.tokenSymbol,
        amount: order.amount,
        price: order.price,
        totalValue: order.totalValue,
        status: order.status,
        transactionHash: order.transactionHash,
        createdAt: order.createdAt,
        completedAt: order.completedAt
      }
    });
  } catch (error) {
    console.error('Error creating buy order:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/orders/createSellOrder
// @desc    Create a completed sell order
// @access  Public
router.post('/createSellOrder', validateOrderData, async (req, res) => {
  try {
    const { 
      walletAddress, 
      tokenSymbol, 
      tokenAddress, 
      amount, 
      price, 
      totalValue,
      metadata,
      transactionHash,
      tokenAmount,
      feeInUSD
    } = req.body;
    
    // Get user
    const user = await getUserByWalletAddress(walletAddress);
    
    // Create completed sell order
    const order = new Order({
      user: user._id,
      orderType: 'SELL',
      tokenSymbol: tokenSymbol.toUpperCase(),
      tokenAddress,
      amount,
      price,
      totalValue,
      status: 'COMPLETED',
      transactionHash: transactionHash || null,
      metadata: {
        ...(metadata || {}),
        tokenAmount,
        feeInUSD,
        timestamp: new Date()
      },
      completedAt: new Date()
    });
    
    await order.save();
    
    // Update user's total volume
    await user.updateVolume(totalValue);
    
    res.status(201).json({
      message: 'Sell order created successfully',
      order: {
        id: order._id,
        orderType: order.orderType,
        tokenSymbol: order.tokenSymbol,
        amount: order.amount,
        price: order.price,
        totalValue: order.totalValue,
        status: order.status,
        transactionHash: order.transactionHash,
        createdAt: order.createdAt,
        completedAt: order.completedAt
      }
    });
  } catch (error) {
    console.error('Error creating sell order:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/orders/getUserOrders
// @desc    Get user orders with filtering and pagination
// @access  Public
router.get('/getUserOrders', async (req, res) => {
  try {
    const { 
      walletAddress, 
      orderType, 
      status, 
      tokenSymbol, 
      limit = 50, 
      skip = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    // Get user
    const user = await getUserByWalletAddress(walletAddress);
    
    // Get orders with options
    const options = {
      orderType,
      status,
      tokenSymbol,
      limit: parseInt(limit),
      skip: parseInt(skip),
      sortBy,
      sortOrder
    };
    
    const orders = await Order.getUserOrders(user._id, options);
    
    res.json({
      orders,
      count: orders.length,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName
      }
    });
  } catch (error) {
    console.error('Error getting user orders:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/orders/getUserVolume
// @desc    Get user trading volume with filtering
// @access  Public
router.get('/getUserVolume', async (req, res) => {
  try {
    const { 
      walletAddress, 
      startDate, 
      endDate, 
      orderType, 
      tokenSymbol 
    } = req.query;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    // Get user
    const user = await getUserByWalletAddress(walletAddress);
    
    // Get volume with options
    const options = {
      startDate,
      endDate,
      orderType,
      tokenSymbol
    };
    
    const volumeData = await Order.getUserVolume(user._id, options);
    
    // Update user's total volume if needed
    if (volumeData.totalVolume > user.totalVolume) {
      user.totalVolume = volumeData.totalVolume;
      await user.save();
    }
    
    res.json({
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        totalVolume: user.totalVolume
      },
      volume: volumeData
    });
  } catch (error) {
    console.error('Error getting user volume:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/orders/tokenVolume/:tokenSymbol
// @desc    Get total volume for a specific token
// @access  Public
router.get('/tokenVolume/:tokenSymbol', async (req, res) => {
  try {
    const { tokenSymbol } = req.params;
    const { startDate, endDate, orderType } = req.query;
    
    const options = {
      startDate,
      endDate,
      orderType
    };
    
    const volumeData = await Order.getTokenVolume(tokenSymbol.toUpperCase(), options);
    
    res.json(volumeData);
  } catch (error) {
    console.error('Error getting token volume:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/orders/stats
// @desc    Get overall trading statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { status: 'COMPLETED' };
    
    if (startDate) query.createdAt = { $gte: new Date(startDate) };
    if (endDate) {
      if (query.createdAt) {
        query.createdAt.$lte = new Date(endDate);
      } else {
        query.createdAt = { $lte: new Date(endDate) };
      }
    }
    
    const orders = await Order.find(query);
    
    const stats = {
      totalOrders: orders.length,
      totalVolume: orders.reduce((sum, order) => sum + order.totalValue, 0),
      buyOrders: orders.filter(o => o.orderType === 'BUY').length,
      sellOrders: orders.filter(o => o.orderType === 'SELL').length,
      buyVolume: orders.filter(o => o.orderType === 'BUY').reduce((sum, o) => sum + o.totalValue, 0),
      sellVolume: orders.filter(o => o.orderType === 'SELL').reduce((sum, o) => sum + o.totalValue, 0),
      uniqueUsers: new Set(orders.map(o => o.user.toString())).size,
      uniqueTokens: new Set(orders.map(o => o.tokenSymbol)).size
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting trading stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 