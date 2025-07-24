#!/bin/bash

# SSL Setup Script for rizz.money Backend
# This script sets up SSL certificate using Let's Encrypt

set -e

echo "🔒 Setting up SSL for rizz.money Backend..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Get EC2 public IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "📍 EC2 Public IP: $EC2_IP"

# Install certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Create a temporary nginx config for certbot
echo "⚙️ Creating temporary nginx config..."
cat > /etc/nginx/sites-available/rizz.money-backend-temp << EOF
server {
    listen 80;
    server_name $EC2_IP;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the temporary site
ln -sf /etc/nginx/sites-available/rizz.money-backend-temp /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx

# Get SSL certificate
echo "🔐 Getting SSL certificate from Let's Encrypt..."
certbot --nginx -d $EC2_IP --non-interactive --agree-tos --email your-email@example.com

# Update nginx config with SSL
echo "📝 Updating nginx config with SSL..."
cat > /etc/nginx/sites-available/rizz.money-backend << EOF
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name $EC2_IP;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name $EC2_IP;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$EC2_IP/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$EC2_IP/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }

    # API endpoints
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Logging
    access_log /var/log/nginx/rizz.money-backend-access.log;
    error_log /var/log/nginx/rizz.money-backend-error.log;
}
EOF

# Enable the SSL site
ln -sf /etc/nginx/sites-available/rizz.money-backend /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/rizz.money-backend-temp

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx

# Set up auto-renewal
echo "🔄 Setting up auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "✅ SSL setup complete!"
echo "🔗 Your backend is now available at: https://$EC2_IP"
echo "📝 Update your Amplify environment variable to: NEXT_PUBLIC_API_URL=https://$EC2_IP/api" 