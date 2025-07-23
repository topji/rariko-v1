#!/bin/bash

echo "🚀 Starting RariKo Backend Deployment..."

# Navigate to backend directory
cd /home/ec2-user/rariko-v1/backend

# Pull latest changes
echo "📥 Pulling latest changes from Git..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create logs directory if it doesn't exist
mkdir -p logs

# Restart the application
echo "🔄 Restarting application..."
pm2 restart rariko-backend

# Check if restart was successful
if [ $? -eq 0 ]; then
    echo "✅ Deployment completed successfully!"
    echo "📊 Application status:"
    pm2 status
else
    echo "❌ Deployment failed!"
    echo "📋 Recent logs:"
    pm2 logs rariko-backend --lines 20
fi 