# Railway Deployment Guide for RariKo Backend

## Prerequisites
1. Railway account (https://railway.app)
2. MongoDB Atlas account (https://mongodb.com/atlas)
3. Git repository with backend code

## Step 1: Set up MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster (M0 Free tier is fine for development)
3. Create a database user with read/write permissions
4. Get your connection string

## Step 2: Deploy to Railway
1. Go to https://railway.app
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Set the root directory to `/backend`
6. Click "Deploy"

## Step 3: Configure Environment Variables
In Railway dashboard, go to your project → Variables tab and add:

### Required Variables:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rariko?retryWrites=true&w=majority
FRONTEND_URL=https://your-frontend-domain.com
JWT_SECRET=your-super-secret-jwt-key-here
```

### Optional Variables:
```
PORT=5000
```

## Step 4: Get Your Backend URL
After deployment, Railway will provide a URL like:
`https://your-app-name.railway.app`

## Step 5: Update Frontend
Update your frontend environment variables:
```
NEXT_PUBLIC_API_URL=https://your-app-name.railway.app/api
```

## Step 6: Test the API
Visit: `https://your-app-name.railway.app/health`
Should return: `{"status":"OK","message":"RariKo Backend is running"}`

## Troubleshooting
- Check Railway logs for errors
- Ensure MongoDB connection string is correct
- Verify all environment variables are set
- Check that the backend directory is correctly set in Railway 