#!/bin/bash

# Fresh School ERP Deployment Script
# This will completely redeploy your School ERP system

echo "🚀 Starting Fresh School ERP Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
EC2_IP="13.61.100.250"
KEY_PATH="/Users/sohailmemon/Desktop/School ERP/EC2 /key/school-erp-key.pem"
PROJECT_PATH="/Users/sohailmemon/school-erp-system"

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "EC2 IP: $EC2_IP"
echo "Key Path: $KEY_PATH"
echo "Project Path: $PROJECT_PATH"
echo ""

# Step 1: Stop all processes on EC2
echo -e "${YELLOW}🛑 Stopping all processes on EC2...${NC}"
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "pm2 stop all; pm2 delete all; pkill -f node; pkill -f npm"

# Step 2: Clean up old files
echo -e "${YELLOW}🧹 Cleaning up old files...${NC}"
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "sudo rm -rf /var/www/school-erp"

# Step 3: Create fresh directory
echo -e "${YELLOW}📁 Creating fresh directory...${NC}"
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "sudo mkdir -p /var/www/school-erp && sudo chown ubuntu:ubuntu /var/www/school-erp"

# Step 4: Upload fresh code
echo -e "${YELLOW}📤 Uploading fresh code...${NC}"
cd "$PROJECT_PATH"
scp -i "$KEY_PATH" -r . ubuntu@$EC2_IP:/var/www/school-erp/

# Step 5: Build frontend locally
echo -e "${YELLOW}🔨 Building frontend locally...${NC}"
cd client
REACT_APP_API_URL=http://$EC2_IP/api npm run build

# Step 6: Upload fresh build
echo -e "${YELLOW}📤 Uploading fresh build...${NC}"
scp -i "$KEY_PATH" -r build ubuntu@$EC2_IP:/var/www/school-erp/client/

# Step 7: Install dependencies on EC2
echo -e "${YELLOW}📦 Installing dependencies on EC2...${NC}"
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "cd /var/www/school-erp && npm install --production"

# Step 8: Create clean config.env
echo -e "${YELLOW}⚙️  Creating clean config...${NC}"
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "cd /var/www/school-erp && cat > config.env << 'EOF'
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
EOF"

# Step 9: Fix server.js to remove problematic helmet
echo -e "${YELLOW}🔧 Fixing server configuration...${NC}"
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "cd /var/www/school-erp && sed -i 's/app.use(helmet());/\/\/ app.use(helmet()); \/\/ Disabled for HTTP deployment/' server.js"

# Step 10: Start application
echo -e "${YELLOW}🚀 Starting application...${NC}"
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "cd /var/www/school-erp && pm2 start server.js --name school-erp"

# Step 11: Test application
echo -e "${YELLOW}🧪 Testing application...${NC}"
sleep 5
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "curl -s http://localhost:5000/api/health"

echo ""
echo -e "${GREEN}🎉 Fresh deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your School ERP is now available at: http://$EC2_IP${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Open your browser and go to: http://$EC2_IP"
echo "2. Test the application functionality"
echo "3. Check the logs if needed: ssh -i '$KEY_PATH' ubuntu@$EC2_IP 'pm2 logs school-erp'"
echo ""
echo -e "${GREEN}✨ Enjoy your School ERP system!${NC}"
