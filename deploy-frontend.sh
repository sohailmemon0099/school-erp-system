#!/bin/bash

# School ERP Frontend Deployment Script
# This script will build the frontend locally and deploy it to EC2

echo "🚀 Starting School ERP Frontend Deployment..."

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

# Check if key file exists
if [ ! -f "$KEY_PATH" ]; then
    echo -e "${RED}❌ Key file not found at: $KEY_PATH${NC}"
    echo "Please check the path and try again."
    exit 1
fi

# Check if project directory exists
if [ ! -d "$PROJECT_PATH" ]; then
    echo -e "${RED}❌ Project directory not found at: $PROJECT_PATH${NC}"
    echo "Please check the path and try again."
    exit 1
fi

# Navigate to project directory
cd "$PROJECT_PATH" || exit 1

echo -e "${YELLOW}📁 Current directory: $(pwd)${NC}"

# Step 1: Stop any stuck processes on EC2
echo -e "${YELLOW}🛑 Stopping stuck processes on EC2...${NC}"
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "pkill -f 'react-scripts' || true; pkill -f 'node' || true"

# Step 2: Build frontend locally
echo -e "${YELLOW}🔨 Building frontend locally...${NC}"
cd client

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Build the frontend
echo -e "${YELLOW}🏗️  Building React application...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend build completed successfully!${NC}"
else
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi

# Step 3: Upload build to EC2
echo -e "${YELLOW}📤 Uploading build to EC2...${NC}"
scp -i "$KEY_PATH" -r build ubuntu@$EC2_IP:/var/www/school-erp/client/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build uploaded successfully!${NC}"
else
    echo -e "${RED}❌ Upload failed!${NC}"
    exit 1
fi

# Step 4: Restart application on EC2
echo -e "${YELLOW}🔄 Restarting application on EC2...${NC}"
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "cd /var/www/school-erp && pm2 restart school-erp"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Application restarted successfully!${NC}"
else
    echo -e "${RED}❌ Application restart failed!${NC}"
    exit 1
fi

# Step 5: Test the application
echo -e "${YELLOW}🧪 Testing the application...${NC}"
sleep 5
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "curl -s http://localhost:5000/api/health"

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your School ERP is now available at: http://$EC2_IP${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Open your browser and go to: http://$EC2_IP"
echo "2. Test the application functionality"
echo "3. Check the logs if needed: ssh -i '$KEY_PATH' ubuntu@$EC2_IP 'pm2 logs school-erp'"
echo ""
echo -e "${GREEN}✨ Enjoy your School ERP system!${NC}"
