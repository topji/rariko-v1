#!/bin/bash

echo "🚀 Setting up rizz Backend on EC2..."

# Update system
echo "📦 Updating system packages..."
sudo yum update -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify Node.js installation
echo "✅ Node.js version: $(node --version)"
echo "✅ NPM version: $(npm --version)"

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Git
echo "📦 Installing Git..."
sudo yum install -y git

# Install Nginx
echo "📦 Installing Nginx..."
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Clone repository
echo "📥 Cloning repository..."
cd /home/ec2-user
if [ -d "rizz-v1" ]; then
    echo "📁 Repository already exists, pulling latest changes..."
    cd rizz-v1
    git pull origin main
else
    echo "📁 Cloning repository..."
    git clone https://github.com/topji/rizz-v1.git
    cd rizz-v1
fi

# Navigate to backend
cd backend

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Create logs directory
mkdir -p logs

# Make deploy script executable
chmod +x deploy.sh

# Create environment file template
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file template..."
    cat > .env << EOF
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rizz?retryWrites=true&w=majority
FRONTEND_URL=https://your-amplify-app.amplifyapp.com
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
EOF
    echo "⚠️  Please edit .env file with your actual values!"
fi

# Copy Nginx configuration
echo "📝 Setting up Nginx configuration..."
sudo cp nginx.conf /etc/nginx/conf.d/rizz-backend.conf

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

echo "✅ Setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your actual values:"
echo "   sudo nano /home/ec2-user/rizz-v1/backend/.env"
echo ""
echo "2. Start the application:"
echo "   cd /home/ec2-user/rizz-v1/backend"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "3. Test the application:"
echo "   curl http://localhost:5000/health"
echo ""
echo "4. Update your Amplify frontend with:"
echo "   NEXT_PUBLIC_API_URL=http://your-ec2-ip/api" 