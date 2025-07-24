const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderType: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true
  },
  tokenSymbol: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  tokenAddress: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  totalValue: {
    type: Number,
    required: true,
    min: 0
  },
  transactionHash: {
    type: String,
    trim: true,
    required: true
  },
  // Simplified metadata
  metadata: {
    tokenAmount: Number,
    feeInUSD: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  // Single timestamp
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderType: 1 });
orderSchema.index({ tokenSymbol: 1 });
orderSchema.index({ transactionHash: 1 });
orderSchema.index({ createdAt: -1 });

// Static method to get user orders
orderSchema.statics.getUserOrders = async function(userId, options = {}) {
  const {
    orderType,
    tokenSymbol,
    limit = 50,
    skip = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const query = { user: userId };
  
  if (orderType) query.orderType = orderType;
  if (tokenSymbol) query.tokenSymbol = tokenSymbol;

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return await this.find(query)
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('user', 'username displayName walletAddress');
};

// Static method to get user volume
orderSchema.statics.getUserVolume = async function(userId, options = {}) {
  const {
    startDate,
    endDate,
    orderType,
    tokenSymbol
  } = options;

  const query = { user: userId };
  
  if (startDate) query.createdAt = { $gte: new Date(startDate) };
  if (endDate) {
    if (query.createdAt) {
      query.createdAt.$lte = new Date(endDate);
    } else {
      query.createdAt = { $lte: new Date(endDate) };
    }
  }
  if (orderType) query.orderType = orderType;
  if (tokenSymbol) query.tokenSymbol = tokenSymbol;

  const orders = await this.find(query);
  
  const volume = orders.reduce((total, order) => {
    return total + order.totalValue;
  }, 0);

  return {
    totalVolume: volume,
    orderCount: orders.length,
    orders: orders
  };
};

// Static method to get total volume by token
orderSchema.statics.getTokenVolume = async function(tokenSymbol, options = {}) {
  const {
    startDate,
    endDate,
    orderType
  } = options;

  const query = { tokenSymbol };
  
  if (startDate) query.createdAt = { $gte: new Date(startDate) };
  if (endDate) {
    if (query.createdAt) {
      query.createdAt.$lte = new Date(endDate);
    } else {
      query.createdAt = { $lte: new Date(endDate) };
    }
  }
  if (orderType) query.orderType = orderType;

  const orders = await this.find(query);
  
  const volume = orders.reduce((total, order) => {
    return total + order.totalValue;
  }, 0);

  return {
    tokenSymbol,
    totalVolume: volume,
    orderCount: orders.length,
    buyVolume: orders.filter(o => o.orderType === 'BUY').reduce((sum, o) => sum + o.totalValue, 0),
    sellVolume: orders.filter(o => o.orderType === 'SELL').reduce((sum, o) => sum + o.totalValue, 0)
  };
};

module.exports = mongoose.model('Order', orderSchema); 