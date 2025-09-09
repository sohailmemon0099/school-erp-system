#!/bin/bash

# GitHub Deployment Script for School ERP
# This will deploy from GitHub repository

echo "🚀 Starting Fresh GitHub Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
EC2_IP="13.61.100.250"
KEY_PATH="/Users/sohailmemon/Desktop/School ERP/EC2 /key/school-erp-key.pem"
GITHUB_REPO="https://github.com/sohailmemon0099/school-erp-system.git"

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "EC2 IP: $EC2_IP"
echo "GitHub Repo: $GITHUB_REPO"
echo ""

# Step 1: Clean everything on EC2
echo -e "${YELLOW}🧹 Cleaning everything on EC2...${NC}"
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "
    sudo rm -rf /var/www/school-erp
    pm2 delete all 2>/dev/null || true
    pkill -f node 2>/dev/null || true
"

# Step 2: Clone from GitHub
echo -e "${YELLOW}📥 Cloning from GitHub...${NC}"
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "
    sudo mkdir -p /var/www/school-erp
    sudo chown ubuntu:ubuntu /var/www/school-erp
    cd /var/www/school-erp
    git clone $GITHUB_REPO .
"

# Step 3: Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "
    cd /var/www/school-erp
    npm install
"

# Step 4: Build frontend
echo -e "${YELLOW}🔨 Building frontend...${NC}"
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "
    cd /var/www/school-erp/client
    REACT_APP_API_URL=http://$EC2_IP/api npm run build
"

# Step 5: Create production config
echo -e "${YELLOW}⚙️  Creating production config...${NC}"
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "
    cd /var/www/school-erp
    cat > config.env << 'EOF'
NODE_ENV=production
PORT=5000
DB_HOST=school-erp-db.cluster-cremy6g60r5g.eu-north-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=school_erp
DB_USER=postgres
DB_PASSWORD=sohailmemon0099
JWT_SECRET=your_very_secure_jwt_secret_key_here
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_school_email@gmail.com
EMAIL_PASS=your_gmail_app_password_here
FRONTEND_URL=http://$EC2_IP
SMS_ENABLED=true
SMS_PROVIDER=textlocal
SMS_API_KEY=your_textlocal_api_key_here
SMS_FROM_NUMBER=+1234567890
EOF
"

# Step 6: Fix server configuration
echo -e "${YELLOW}🔧 Fixing server configuration...${NC}"
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "
    cd /var/www/school-erp
    sed -i 's/app.use(helmet());/\/\/ app.use(helmet()); \/\/ Disabled for HTTP deployment/' server.js
"

# Step 7: Start application
echo -e "${YELLOW}🚀 Starting application...${NC}"
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "
    cd /var/www/school-erp
    pm2 start server.js --name school-erp
"

# Step 8: Test application
echo -e "${YELLOW}🧪 Testing application...${NC}"
sleep 5
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "curl -s http://localhost:5000/api/health"

echo ""
echo -e "${GREEN}🎉 GitHub deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your School ERP is now available at: http://$EC2_IP${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Open your browser and go to: http://$EC2_IP"
echo "2. Test the application functionality"
echo "3. Check the logs if needed: ssh -i '$KEY_PATH' ubuntu@$EC2_IP 'pm2 logs school-erp'"
echo ""
echo -e "${GREEN}✨ Enjoy your School ERP system!${NC}"
