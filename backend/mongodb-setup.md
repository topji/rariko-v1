# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account
1. Go to https://mongodb.com/atlas
2. Click "Try Free" or "Sign Up"
3. Create your account

## Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region close to your users
5. Click "Create"

## Step 3: Set Up Database Access
1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

## Step 4: Set Up Network Access
1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. For Railway deployment, click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

## Step 5: Get Your Connection String
1. In the left sidebar, click "Database"
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `rizz`

## Example Connection String:
```
mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/rizz?retryWrites=true&w=majority
```

## Step 6: Test Connection
You can test the connection using the MongoDB Compass application or by running the backend locally with the connection string.

## Security Notes:
- Use a strong password
- In production, consider using IP whitelisting instead of allowing all IPs
- Regularly rotate your database password
- Monitor your database usage (free tier has limits) 