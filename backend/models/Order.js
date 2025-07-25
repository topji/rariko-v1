const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  tokenAddress: {
    type: String,
    required: true,
    trim: true
  },
  symbol: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  userAddress: {
    type: String,
    required: true,
    trim: true
  },
  amountInUsd: {
    type: Number,
    required: true,
    min: 0
  },
  tokenAmount: {
    type: Number,
    required: true,
    min: 0
  },
  amountInSol: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true
  },
  txHash: {
    type: String,
    required: true,
    trim: true
  },
  feeInUsd: {
    type: Number,
    required: true,
    min: 0
  },
  tokenPrice: {
    type: Number,
    required: true,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  realizedPNL: {
    type: Number,
    default: null
  }
});

// Indexes for better query performance
orderSchema.index({ userAddress: 1, timestamp: -1 });
orderSchema.index({ type: 1 });
orderSchema.index({ symbol: 1 });
orderSchema.index({ txHash: 1 });
orderSchema.index({ timestamp: -1 });

// Static method to get user orders
orderSchema.statics.getUserOrders = async function(userAddress, options = {}) {
  const {
    type,
    symbol,
    limit = 50,
    skip = 0,
    sortBy = 'timestamp',
    sortOrder = 'desc'
  } = options;

  const query = { userAddress };
  
  if (type) query.type = type;
  if (symbol) query.symbol = symbol;

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return await this.find(query)
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

// Static method to get user volume
orderSchema.statics.getUserVolume = async function(userAddress, options = {}) {
  const {
    startDate,
    endDate,
    type,
    symbol
  } = options;

  const query = { userAddress };
  
  if (startDate) query.timestamp = { $gte: new Date(startDate) };
  if (endDate) {
    if (query.timestamp) {
      query.timestamp.$lte = new Date(endDate);
    } else {
      query.timestamp = { $lte: new Date(endDate) };
    }
  }
  if (type) query.type = type;
  if (symbol) query.symbol = symbol;

  const orders = await this.find(query);
  
  const volume = orders.reduce((total, order) => {
    return total + order.amountInUsd;
  }, 0);

  return {
    totalVolume: volume,
    orderCount: orders.length,
    orders: orders
  };
};

// Static method to get total volume by token
orderSchema.statics.getTokenVolume = async function(symbol, options = {}) {
  const {
    startDate,
    endDate,
    type
  } = options;

  const query = { symbol };
  
  if (startDate) query.timestamp = { $gte: new Date(startDate) };
  if (endDate) {
    if (query.timestamp) {
      query.timestamp.$lte = new Date(endDate);
    } else {
      query.timestamp = { $lte: new Date(endDate) };
    }
  }
  if (type) query.type = type;

  const orders = await this.find(query);
  
  const volume = orders.reduce((total, order) => {
    return total + order.amountInUsd;
  }, 0);

  return {
    symbol,
    totalVolume: volume,
    orderCount: orders.length,
    buyVolume: orders.filter(o => o.type === 'BUY').reduce((sum, o) => sum + o.amountInUsd, 0),
    sellVolume: orders.filter(o => o.type === 'SELL').reduce((sum, o) => sum + o.amountInUsd, 0)
  };
};

module.exports = mongoose.model('Order', orderSchema); 