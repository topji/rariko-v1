# EC2 Deployment Guide for rizz Backend

## Prerequisites
- AWS Account
- MongoDB Atlas account (or MongoDB installed on EC2)
- Domain name (optional, for SSL)

## Step 1: Launch EC2 Instance

### 1.1 Create EC2 Instance
1. Go to AWS Console → EC2
2. Click "Launch Instance"
3. Choose "Amazon Linux 2023" (free tier eligible)
4. Select "t2.micro" (free tier) or "t3.small" for better performance
5. Configure Security Group:
   - SSH (Port 22) - Your IP
   - HTTP (Port 80) - 0.0.0.0/0
   - HTTPS (Port 443) - 0.0.0.0/0
   - Custom TCP (Port 5000) - 0.0.0.0/0 (for Node.js app)
6. Create or select a key pair
7. Launch instance

### 1.2 Connect to EC2
```bash
# Replace with your key file and instance IP
ssh -i "your-key.pem" ec2-user@your-ec2-ip
```

## Step 2: Install Dependencies

### 2.1 Update System
```bash
sudo yum update -y
```

### 2.2 Install Node.js 18
```bash
# Install NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# Install Node.js
sudo yum install -y nodejs

# Verify installation
node --version
npm --version
```

### 2.3 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 2.4 Install Git
```bash
sudo yum install -y git
```

### 2.5 Install Nginx (for reverse proxy)
```bash
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 3: Deploy Application

### 3.1 Clone Repository
```bash
cd /home/ec2-user
git clone https://github.com/topji/rizz-v1.git
cd rizz-v1/backend
```

### 3.2 Install Dependencies
```bash
npm install
```

### 3.3 Create Environment File
```bash
sudo nano .env
```

Add your environment variables:
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rizz?retryWrites=true&w=majority
FRONTEND_URL=https://your-amplify-app.amplifyapp.com
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
```

### 3.4 Test Application
```bash
npm start
```

Visit: `http://your-ec2-ip:5000/health`

## Step 4: Configure PM2

### 4.1 Create PM2 Ecosystem File
```bash
nano ecosystem.config.js
```

Add this content:
```javascript
module.exports = {
  apps: [{
    name: 'rizz-backend',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

### 4.2 Start with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 5: Configure Nginx

### 5.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/conf.d/rizz-backend.conf
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-ec2-ip;  # Replace with your domain if you have one

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5.2 Test and Reload Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Step 6: Configure Firewall

### 6.1 Configure Security Group
In AWS Console:
1. Go to EC2 → Security Groups
2. Select your instance's security group
3. Add rules:
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0 (if using SSL)
   - Custom TCP (5000) - 0.0.0.0/0

## Step 7: SSL Certificate (Optional)

### 7.1 Install Certbot
```bash
sudo yum install -y certbot python3-certbot-nginx
```

### 7.2 Get SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com
```

## Step 8: Update Frontend

### 8.1 Update Amplify Environment Variables
In AWS Amplify Console:
1. Go to your app
2. Environment variables
3. Add:
```
NEXT_PUBLIC_API_URL=http://your-ec2-ip/api
# or with domain:
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

## Step 9: Monitoring and Maintenance

### 9.1 PM2 Commands
```bash
# View logs
pm2 logs rizz-backend

# Monitor processes
pm2 monit

# Restart application
pm2 restart rizz-backend

# Stop application
pm2 stop rizz-backend
```

### 9.2 Nginx Commands
```bash
# Check status
sudo systemctl status nginx

# Restart nginx
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Step 10: Auto-deployment Script

### 10.1 Create Deployment Script
```bash
nano deploy.sh
```

Add this content:
```bash
#!/bin/bash
cd /home/ec2-user/rizz-v1/backend
git pull origin main
npm install
pm2 restart rizz-backend
echo "Deployment completed!"
```

### 10.2 Make Script Executable
```bash
chmod +x deploy.sh
```

## Troubleshooting

### Common Issues:
1. **Port 5000 not accessible**: Check security group rules
2. **MongoDB connection fails**: Verify connection string and network access
3. **PM2 not starting**: Check logs with `pm2 logs`
4. **Nginx not working**: Check configuration with `sudo nginx -t`

### Useful Commands:
```bash
# Check if Node.js is running
ps aux | grep node

# Check if port 5000 is listening
netstat -tlnp | grep 5000

# Check nginx configuration
sudo nginx -t

# View system logs
sudo journalctl -u nginx
```

## Cost Estimation
- **EC2 t2.micro**: Free tier (750 hours/month)
- **EC2 t3.small**: ~$8-12/month
- **Data transfer**: ~$0.09/GB
- **Total**: ~$10-15/month for small app 