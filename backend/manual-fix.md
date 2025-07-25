# Manual Database Fix for Order Indexes

If the automated fix script doesn't work, you can manually fix the database indexes using these MongoDB commands.

## Connect to MongoDB

```bash
# Connect to your MongoDB instance
mongosh "your-mongodb-connection-string"
```

## Check Current Indexes

```javascript
// Switch to your database
use test

// List all indexes on the orders collection
db.orders.getIndexes()
```

## Drop Problematic Indexes

```javascript
// Drop the problematic buyTxHash index
db.orders.dropIndex("buyTxHash_1")

// Drop other old indexes if they exist
db.orders.dropIndex("user_1_createdAt_-1")
db.orders.dropIndex("orderType_1_status_1")
db.orders.dropIndex("tokenSymbol_1")
db.orders.dropIndex("transactionHash_1")
db.orders.dropIndex("createdAt_-1")
```

## Create New Indexes

```javascript
// Create new indexes for the simplified Order model
db.orders.createIndex({ userAddress: 1, timestamp: -1 })
db.orders.createIndex({ type: 1 })
db.orders.createIndex({ symbol: 1 })
db.orders.createIndex({ txHash: 1 })
db.orders.createIndex({ timestamp: -1 })
```

## Verify Indexes

```javascript
// Check final indexes
db.orders.getIndexes()
```

## Expected Output

After running these commands, you should see:

```javascript
[
  { "v" : 2, "key" : { "_id" : 1 }, "name" : "_id_" },
  { "v" : 2, "key" : { "userAddress" : 1, "timestamp" : -1 }, "name" : "userAddress_1_timestamp_-1" },
  { "v" : 2, "key" : { "type" : 1 }, "name" : "type_1" },
  { "v" : 2, "key" : { "symbol" : 1 }, "name" : "symbol_1" },
  { "v" : 2, "key" : { "txHash" : 1 }, "name" : "txHash_1" },
  { "v" : 2, "key" : { "timestamp" : -1 }, "name" : "timestamp_-1" }
]
```

## Alternative: Drop All Indexes and Recreate

If the above doesn't work, you can drop all indexes except _id and recreate them:

```javascript
// Drop all indexes except _id
db.orders.dropIndexes()

// Recreate the indexes
db.orders.createIndex({ userAddress: 1, timestamp: -1 })
db.orders.createIndex({ type: 1 })
db.orders.createIndex({ symbol: 1 })
db.orders.createIndex({ txHash: 1 })
db.orders.createIndex({ timestamp: -1 })
```

## After Fix

1. Restart your backend:
```bash
pm2 restart rizz-backend
```

2. Test order creation again 