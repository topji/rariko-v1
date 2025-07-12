const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/
  },
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 32,
    maxlength: 44
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Referral system fields
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referralCount: {
    type: Number,
    default: 0
  },
  totalVolume: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userSchema.index({ username: 1 });
userSchema.index({ walletAddress: 1 });
userSchema.index({ referralCode: 1 });

// Generate referral code before saving
userSchema.pre('save', function(next) {
  if (!this.referralCode) {
    this.referralCode = this.generateReferralCode();
  }
  this.updatedAt = Date.now();
  next();
});

// Method to generate unique referral code
userSchema.methods.generateReferralCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = Date.now();
  return this.save();
};

// Method to update total volume
userSchema.methods.updateVolume = function(amount) {
  this.totalVolume += amount;
  return this.save();
};

// Static method to check if username is unique
userSchema.statics.isUsernameUnique = async function(username) {
  const user = await this.findOne({ username: username.toLowerCase() });
  return !user;
};

// Static method to check if wallet address exists
userSchema.statics.findByWalletAddress = async function(walletAddress) {
  return await this.findOne({ walletAddress });
};

// Static method to check if user exists
userSchema.statics.isUser = async function(walletAddress) {
  const user = await this.findOne({ walletAddress });
  return !!user;
};

module.exports = mongoose.model('User', userSchema); 