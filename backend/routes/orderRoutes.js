const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const router = express.Router();

// Middleware to validate order data
const validateOrderData = (req, res, next) => {
  const { userAddress, symbol, tokenAddress, amountInUsd, tokenAmount, amountInSol, type, txHash, feeInUsd, tokenPrice } = req.body;
  
  if (!userAddress) {
    return res.status(400).json({ error: 'User address is required' });
  }
  
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol is required' });
  }
  
  if (!tokenAddress) {
    return res.status(400).json({ error: 'Token address is required' });
  }
  
  if (!amountInUsd || amountInUsd <= 0) {
    return res.status(400).json({ error: 'Valid amount in USD is required' });
  }
  
  if (!tokenAmount || tokenAmount <= 0) {
    return res.status(400).json({ error: 'Valid token amount is required' });
  }
  
  if (!amountInSol || amountInSol <= 0) {
    return res.status(400).json({ error: 'Valid amount in SOL is required' });
  }
  
  if (!type || !['BUY', 'SELL'].includes(type)) {
    return res.status(400).json({ error: 'Valid type (BUY/SELL) is required' });
  }
  
  if (!txHash) {
    return res.status(400).json({ error: 'Transaction hash is required' });
  }
  
  if (!feeInUsd || feeInUsd < 0) {
    return res.status(400).json({ error: 'Valid fee in USD is required' });
  }
  
  if (!tokenPrice || tokenPrice <= 0) {
    return res.status(400).json({ error: 'Valid token price is required' });
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
// @desc    Create a buy order
// @access  Public
router.post('/createBuyOrder', validateOrderData, async (req, res) => {
  try {
    const { 
      userAddress, 
      symbol, 
      tokenAddress, 
      amountInUsd, 
      tokenAmount, 
      amountInSol, 
      txHash, 
      feeInUsd, 
      tokenPrice,
      realizedPNL
    } = req.body;
    
    console.log('req.body is valid');
    // Create buy order
    const order = new Order({
      tokenAddress,
      symbol: symbol.toUpperCase(),
      userAddress,
      amountInUsd,
      tokenAmount,
      amountInSol,
      type: 'BUY',
      txHash,
      feeInUsd,
      tokenPrice,
      timestamp: new Date(),
      realizedPNL: null // No PNL for buy orders
    });
    console.log('order is being created');
    await order.save();

    console.log('order is created');
    
    // Update user's total volume
    const user = await getUserByWalletAddress(userAddress);
    console.log('user is being updated');
    await user.updateVolume(amountInUsd);
    console.log('user is updated');
    
    res.status(201).json({
      message: 'Buy order created successfully',
      order: {
        id: order._id,
        type: order.type,
        symbol: order.symbol,
        amountInUsd: order.amountInUsd,
        tokenAmount: order.tokenAmount,
        amountInSol: order.amountInSol,
        txHash: order.txHash,
        feeInUsd: order.feeInUsd,
        tokenPrice: order.tokenPrice,
        timestamp: order.timestamp
      }
    });
  } catch (error) {
    console.error('Error creating buy order:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/orders/createSellOrder
// @desc    Create a sell order
// @access  Public
router.post('/createSellOrder', validateOrderData, async (req, res) => {
  try {
    const { 
      userAddress, 
      symbol, 
      tokenAddress, 
      amountInUsd, 
      tokenAmount, 
      amountInSol, 
      txHash, 
      feeInUsd, 
      tokenPrice,
      realizedPNL
    } = req.body;
    console.log('req.body is valid');
    // Create sell order
    const order = new Order({
      tokenAddress,
      symbol: symbol.toUpperCase(),
      userAddress,
      amountInUsd,
      tokenAmount,
      amountInSol,
      type: 'SELL',
      txHash,
      feeInUsd,
      tokenPrice,
      timestamp: new Date(),
      realizedPNL: realizedPNL || null
    });
    console.log('order is being created');
    await order.save();
    console.log('order is created');
    // Update user's total volume
    const user = await getUserByWalletAddress(userAddress);
    console.log('user is being updated');
    await user.updateVolume(amountInUsd);
    console.log('user is updated');
    res.status(201).json({
      message: 'Sell order created successfully',
      order: {
        id: order._id,
        type: order.type,
        symbol: order.symbol,
        amountInUsd: order.amountInUsd,
        tokenAmount: order.tokenAmount,
        amountInSol: order.amountInSol,
        txHash: order.txHash,
        feeInUsd: order.feeInUsd,
        tokenPrice: order.tokenPrice,
        timestamp: order.timestamp,
        realizedPNL: order.realizedPNL
      }
    });
  } catch (error) {
    console.error('Error creating sell order:', error.message);
    
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/orders/getUserOrders
// @desc    Get user orders with filtering and pagination
// @access  Public
router.get('/getUserOrders', async (req, res) => {
  try {
    const { 
      userAddress, 
      type, 
      symbol, 
      limit = 50, 
      skip = 0,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;
    
    if (!userAddress) {
      return res.status(400).json({ error: 'User address is required' });
    }
    
    // Get orders with options
    const options = {
      type,
      symbol,
      limit: parseInt(limit),
      skip: parseInt(skip),
      sortBy,
      sortOrder
    };
    
    const orders = await Order.getUserOrders(userAddress, options);
    
    res.json({
      orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Error getting user orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/orders/getUserVolume
// @desc    Get user trading volume with filtering
// @access  Public
router.get('/getUserVolume', async (req, res) => {
  try {
    const { 
      userAddress, 
      startDate, 
      endDate, 
      type, 
      symbol 
    } = req.query;
    
    if (!userAddress) {
      return res.status(400).json({ error: 'User address is required' });
    }
    
    // Get volume with options
    const options = {
      startDate,
      endDate,
      type,
      symbol
    };
    
    const volumeData = await Order.getUserVolume(userAddress, options);
    
    // Get user info
    const user = await getUserByWalletAddress(userAddress);
    
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

// @route   GET /api/orders/tokenVolume/:symbol
// @desc    Get total volume for a specific token
// @access  Public
router.get('/tokenVolume/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { startDate, endDate, type } = req.query;
    
    const options = {
      startDate,
      endDate,
      type
    };
    
    const volumeData = await Order.getTokenVolume(symbol.toUpperCase(), options);
    
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
    
    const query = {};
    
    if (startDate) query.timestamp = { $gte: new Date(startDate) };
    if (endDate) {
      if (query.timestamp) {
        query.timestamp.$lte = new Date(endDate);
      } else {
        query.timestamp = { $lte: new Date(endDate) };
      }
    }
    
    const orders = await Order.find(query);
    
    const stats = {
      totalOrders: orders.length,
      totalVolume: orders.reduce((sum, order) => sum + order.amountInUsd, 0),
      buyOrders: orders.filter(o => o.type === 'BUY').length,
      sellOrders: orders.filter(o => o.type === 'SELL').length,
      buyVolume: orders.filter(o => o.type === 'BUY').reduce((sum, o) => sum + o.amountInUsd, 0),
      sellVolume: orders.filter(o => o.type === 'SELL').reduce((sum, o) => sum + o.amountInUsd, 0),
      uniqueUsers: new Set(orders.map(o => o.userAddress)).size,
      uniqueTokens: new Set(orders.map(o => o.symbol)).size
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting trading stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/orders/getUserRealizedPnL
// @desc    Get user's total realized PnL from sell orders
// @access  Public
router.get('/getUserRealizedPnL', async (req, res) => {
  try {
    const { userAddress } = req.query;
    
    if (!userAddress) {
      return res.status(400).json({ error: 'User address is required' });
    }
    
    // Get all sell orders with realized PnL
    const sellOrders = await Order.find({ 
      userAddress, 
      type: 'SELL',
      realizedPNL: { $ne: null }
    });
    
    const totalRealizedPnL = sellOrders.reduce((total, order) => {
      return total + (order.realizedPNL || 0);
    }, 0);
    
    res.json({
      totalRealizedPnL,
      sellOrdersCount: sellOrders.length,
      orders: sellOrders.map(order => ({
        id: order._id,
        symbol: order.symbol,
        tokenAmount: order.tokenAmount,
        amountInUsd: order.amountInUsd,
        realizedPNL: order.realizedPNL,
        timestamp: order.timestamp
      }))
    });
  } catch (error) {
    console.error('Error getting user realized PnL:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/orders/getAllOrders
// @desc    Get all orders with user information for dashboard
// @access  Public
router.get('/getAllOrders', async (req, res) => {
  try {
    const { userAddress, limit = 50, page = 1 } = req.query;
    
    // Build query
    let query = {};
    if (userAddress) {
      query.userAddress = userAddress;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get orders with pagination
    const orders = await Order.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get unique user addresses from orders
    const userAddresses = [...new Set(orders.map(order => order.userAddress))];
    
    // Fetch user information for all addresses
    const users = await User.find({ walletAddress: { $in: userAddresses } }).lean();
    const userMap = {};
    users.forEach(user => {
      userMap[user.walletAddress] = user;
    });
    
    // Format orders with user information
    const formattedOrders = orders.map(order => {
      const user = userMap[order.userAddress];
      return {
        id: order._id,
        userAddress: order.userAddress,
        username: user?.username || 'Unknown',
        symbol: order.symbol,
        tokenAmount: order.tokenAmount,
        amountInUsd: order.amountInUsd,
        amountInSol: order.amountInSol,
        type: order.type,
        txHash: order.txHash,
        feeInUsd: order.feeInUsd,
        tokenPrice: order.tokenPrice,
        realizedPNL: order.realizedPNL,
        timestamp: order.timestamp
      };
    });
    
    // Get total count for pagination
    const totalOrders = await Order.countDocuments(query);
    
    res.json({
      orders: formattedOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / parseInt(limit)),
        totalOrders,
        hasNextPage: skip + orders.length < totalOrders,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error getting all orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/orders/getUserHoldings
// @desc    Get user's current token holdings with unrealized PnL
// @access  Public
router.get('/getUserHoldings', async (req, res) => {
  try {
    const { userAddress } = req.query;
    
    if (!userAddress) {
      return res.status(400).json({ error: 'User address is required' });
    }
    
    // Get all orders for the user
    const orders = await Order.find({ userAddress }).sort({ timestamp: 1 });
    
    // Calculate holdings for each token
    const holdings = {};
    
    orders.forEach(order => {
      const symbol = order.symbol;
      
      if (!holdings[symbol]) {
        holdings[symbol] = {
          symbol,
          tokenAddress: order.tokenAddress,
          totalBought: 0,
          totalBoughtValue: 0,
          totalSold: 0,
          totalSoldValue: 0,
          averageBuyPrice: 0,
          currentHoldings: 0,
          totalRealizedPnL: 0
        };
      }
      
      if (order.type === 'BUY') {
        holdings[symbol].totalBought += order.tokenAmount;
        holdings[symbol].totalBoughtValue += order.amountInUsd;
      } else if (order.type === 'SELL') {
        holdings[symbol].totalSold += order.tokenAmount;
        holdings[symbol].totalSoldValue += order.amountInUsd;
        if (order.realizedPNL) {
          holdings[symbol].totalRealizedPnL += order.realizedPNL;
        }
      }
    });
    
    // Calculate current holdings and average buy price
    Object.keys(holdings).forEach(symbol => {
      const holding = holdings[symbol];
      holding.currentHoldings = holding.totalBought - holding.totalSold;
      
      if (holding.totalBought > 0) {
        holding.averageBuyPrice = holding.totalBoughtValue / holding.totalBought;
      }
      
      // Remove tokens with zero holdings
      if (holding.currentHoldings <= 0) {
        delete holdings[symbol];
      }
    });
    
    res.json({
      holdings: Object.values(holdings),
      totalHoldings: Object.keys(holdings).length
    });
  } catch (error) {
    console.error('Error getting user holdings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 