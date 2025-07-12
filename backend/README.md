# RariKo Backend API

A Node.js backend server for the RariKo tokenized stock trading platform.

## Features

- User management with wallet-based authentication
- Order management (buy/sell orders)
- Trading volume tracking
- Referral system
- Comprehensive API endpoints

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication (ready for future implementation)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp config.env .env
# Edit .env with your configuration
```

3. Start MongoDB (local or use MongoDB Atlas)

4. Run the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

Create a `.env` file based on `config.env`:

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `FRONTEND_URL` - Frontend URL for CORS
- `JWT_SECRET` - JWT secret key

## API Endpoints

### User Management

#### Check if user exists
```
GET /api/users/isUser?walletAddress=<address>
```

#### Create new user
```
POST /api/users/createUser
{
  "username": "string",
  "walletAddress": "string",
  "displayName": "string (optional)",
  "referralCode": "string (optional)"
}
```

#### Check username uniqueness
```
GET /api/users/isUniqueUserName?username=<username>
```

#### Get user profile
```
GET /api/users/profile/:walletAddress
```

#### Update user profile
```
PUT /api/users/profile/:walletAddress
{
  "displayName": "string (optional)",
  "avatar": "string (optional)"
}
```

#### Get user referrals
```
GET /api/users/referrals/:walletAddress
```

### Order Management

#### Create buy order
```
POST /api/orders/createBuyOrder
{
  "walletAddress": "string",
  "tokenSymbol": "string",
  "tokenAddress": "string",
  "amount": "number",
  "price": "number",
  "totalValue": "number",
  "metadata": "object (optional)"
}
```

#### Create sell order
```
POST /api/orders/createSellOrder
{
  "walletAddress": "string",
  "tokenSymbol": "string",
  "tokenAddress": "string",
  "amount": "number",
  "price": "number",
  "totalValue": "number",
  "metadata": "object (optional)"
}
```

#### Get user orders
```
GET /api/orders/getUserOrders?walletAddress=<address>&orderType=<BUY|SELL>&status=<PENDING|COMPLETED|FAILED|CANCELLED>&tokenSymbol=<symbol>&limit=<number>&skip=<number>&sortBy=<field>&sortOrder=<asc|desc>
```

#### Get user volume
```
GET /api/orders/getUserVolume?walletAddress=<address>&startDate=<date>&endDate=<date>&orderType=<BUY|SELL>&tokenSymbol=<symbol>
```

#### Mark order as completed
```
PUT /api/orders/:orderId/complete
{
  "transactionHash": "string",
  "blockNumber": "number (optional)",
  "gasUsed": "number (optional)",
  "gasPrice": "number (optional)"
}
```

#### Mark order as failed
```
PUT /api/orders/:orderId/fail
{
  "error": {
    "message": "string",
    "code": "string (optional)"
  }
}
```

#### Get token volume
```
GET /api/orders/tokenVolume/:tokenSymbol?startDate=<date>&endDate=<date>&orderType=<BUY|SELL>
```

#### Get trading statistics
```
GET /api/orders/stats?startDate=<date>&endDate=<date>
```

### Health Check

```
GET /health
```

## Database Models

### User Model
- `username` - Unique username
- `walletAddress` - Solana wallet address
- `displayName` - Display name
- `avatar` - Avatar URL
- `referralCode` - Auto-generated referral code
- `referredBy` - Referrer user ID
- `referralCount` - Number of referrals
- `totalVolume` - Total trading volume
- `lastLogin` - Last login timestamp
- `createdAt` - Account creation date

### Order Model
- `user` - User reference
- `orderType` - BUY or SELL
- `tokenSymbol` - Token symbol
- `tokenAddress` - Token contract address
- `amount` - Token amount
- `price` - Price per token
- `totalValue` - Total order value
- `status` - PENDING, COMPLETED, FAILED, CANCELLED
- `transactionHash` - Blockchain transaction hash
- `metadata` - Additional order metadata
- `error` - Error information if failed

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional details (optional)"
}
```

## Security Features

- Input validation for all endpoints
- CORS configuration
- Helmet.js for security headers
- Request logging with Morgan
- Error handling middleware

## Development

### Running in Development
```bash
npm run dev
```

### Database Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Update `MONGODB_URI` in your `.env` file
3. The database and collections will be created automatically

### Testing Endpoints
Use tools like Postman, Insomnia, or curl to test the API endpoints.

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Set up proper CORS origins
4. Use environment variables for sensitive data
5. Set up monitoring and logging

## Future Enhancements

- JWT authentication
- Rate limiting
- API documentation with Swagger
- WebSocket support for real-time updates
- Advanced analytics and reporting
- Admin dashboard endpoints 