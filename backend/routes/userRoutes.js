const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Middleware to validate wallet address
const validateWalletAddress = (req, res, next) => {
  const { walletAddress } = req.body;
  
  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }
  
  // Basic Solana address validation (44 characters, base58)
  if (walletAddress.length !== 44 || !/^[1-9A-HJ-NP-Za-km-z]+$/.test(walletAddress)) {
    return res.status(400).json({ error: 'Invalid Solana wallet address format' });
  }
  
  next();
};

// Middleware to validate username
const validateUsername = (req, res, next) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
  }
  
  next();
};

// @route   GET /api/users/isUser
// @desc    Check if user exists by wallet address
// @access  Public
router.get('/isUser', async (req, res) => {
  try {
    const { walletAddress } = req.query;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    const exists = await User.isUser(walletAddress);
    
    res.json({
      exists,
      walletAddress
    });
  } catch (error) {
    console.error('Error checking if user exists:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/users/createUser
// @desc    Create a new user
// @access  Public
router.post('/createUser', [validateUsername, validateWalletAddress], async (req, res) => {
  try {
    const { username, walletAddress, displayName, referralCode } = req.body;
    
    // Check if username is already taken
    const isUsernameUnique = await User.isUsernameUnique(username);
    if (!isUsernameUnique) {
      return res.status(400).json({ error: 'Username is already taken' });
    }
    
    // Check if wallet address is already registered
    const existingUser = await User.findByWalletAddress(walletAddress);
    if (existingUser) {
      return res.status(400).json({ error: 'Wallet address is already registered' });
    }
    
    // Create user data
    const userData = {
      username: username.toLowerCase(),
      walletAddress,
      displayName: displayName || username
    };
    
    // Handle referral if provided
    if (referralCode) {
      const referrer = await User.findByReferralCode(referralCode);
      if (referrer) {
        userData.referredBy = referrer._id;
        // Update referrer's referral count
        referrer.referralCount += 1;
        await referrer.save();
      } else {
        // Invalid referral code - return error
        return res.status(400).json({ 
          error: 'Invalid referral code. Please check and try again.' 
        });
      }
    }
    
    // Create new user
    const user = new User(userData);
    await user.save();
    
    // Update last login
    await user.updateLastLogin();
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        walletAddress: user.walletAddress,
        referralCode: user.referralCode,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        error: `${field === 'username' ? 'Username' : 'Wallet address'} is already taken` 
      });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/isUniqueUserName
// @desc    Check if username is unique
// @access  Public
router.get('/isUniqueUserName', async (req, res) => {
  try {
    const { username } = req.query;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    const isUnique = await User.isUsernameUnique(username);
    
    res.json({
      isUnique,
      username
    });
  } catch (error) {
    console.error('Error checking username uniqueness:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/profile/:walletAddress
// @desc    Get user profile by wallet address
// @access  Public
router.get('/profile/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const user = await User.findByWalletAddress(walletAddress);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update last login
    await user.updateLastLogin();
    
    res.json({
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        walletAddress: user.walletAddress,
        referralCode: user.referralCode,
        referralCount: user.referralCount,
        totalVolume: user.totalVolume,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/users/profile/:walletAddress
// @desc    Update user profile
// @access  Public (for now, can add auth later)
router.put('/profile/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { displayName, avatar } = req.body;
    
    const user = await User.findByWalletAddress(walletAddress);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update fields
    if (displayName) user.displayName = displayName;
    if (avatar) user.avatar = avatar;
    
    await user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        walletAddress: user.walletAddress,
        avatar: user.avatar,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/referrals/:walletAddress
// @desc    Get user's referral information
// @access  Public
router.get('/referrals/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const user = await User.findByWalletAddress(walletAddress);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get referred users
    const referredUsers = await User.find({ referredBy: user._id })
      .select('username displayName createdAt totalVolume')
      .sort({ createdAt: -1 });
    
    // Calculate total volume traded by referees
    const refereesTotalVolume = referredUsers.reduce((total, referredUser) => {
      return total + (referredUser.totalVolume || 0);
    }, 0);
    
    res.json({
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      totalVolume: refereesTotalVolume, // Volume traded by referees, not user's own volume
      referredUsers: referredUsers.map(user => ({
        username: user.username,
        displayName: user.displayName,
        createdAt: user.createdAt,
        totalVolume: user.totalVolume || 0
      }))
    });
  } catch (error) {
    console.error('Error getting referral info:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 