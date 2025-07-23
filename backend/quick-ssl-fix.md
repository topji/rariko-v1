# 🔒 Quick SSL Fix for Mixed Content Error

## Problem
Your Amplify frontend (HTTPS) is trying to connect to your EC2 backend (HTTP), causing "mixed content" errors.

## Solution 1: Quick Fix (Immediate)
Update your Amplify environment variable to use HTTP:

```bash
NEXT_PUBLIC_API_URL=http://your-ec2-ip/api
```

**Steps:**
1. Go to AWS Amplify Console
2. Navigate to your app → Environment variables
3. Update `NEXT_PUBLIC_API_URL` to use `http://` instead of `https://`
4. Redeploy your app

## Solution 2: Proper SSL Setup (Recommended)

### Option A: Use Let's Encrypt (Free SSL)

SSH into your EC2 instance and run:

```bash
# Install certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Get your EC2 IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# Get SSL certificate
sudo certbot --nginx -d $EC2_IP --non-interactive --agree-tos --email your-email@example.com

# Set up auto-renewal
sudo crontab -e
# Add this line: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Option B: Use AWS Certificate Manager (ACM)

1. Request a certificate in ACM for your domain
2. Attach it to a load balancer
3. Point your domain to the load balancer

## Solution 3: Use a Domain Name

1. Buy a domain (e.g., from Route 53, Namecheap, etc.)
2. Point it to your EC2 IP
3. Use Let's Encrypt with the domain name

## After SSL Setup

Update your Amplify environment variable:

```bash
NEXT_PUBLIC_API_URL=https://your-ec2-ip-or-domain/api
```

## Test Your Setup

```bash
# Test HTTP
curl http://your-ec2-ip/health

# Test HTTPS (after SSL setup)
curl https://your-ec2-ip/health

# Test API
curl https://your-ec2-ip/api/users/isUser?walletAddress=test
```

## Troubleshooting

### If Let's Encrypt fails:
- Make sure port 80 and 443 are open in your security group
- Ensure nginx is running
- Check that your domain points to the EC2 IP

### If you still get mixed content:
- Clear browser cache
- Check browser console for specific errors
- Verify the environment variable is updated in Amplify 