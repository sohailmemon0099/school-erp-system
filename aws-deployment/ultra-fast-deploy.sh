#!/bin/bash

# Ultra-Fast Single File Deployment Script
# Usage: ./ultra-fast-deploy.sh filename

if [ $# -eq 0 ]; then
    echo "Usage: ./ultra-fast-deploy.sh <filename>"
    echo "Example: ./ultra-fast-deploy.sh server.js"
    echo "Example: ./ultra-fast-deploy.sh controllers/studentController.js"
    exit 1
fi

FILENAME=$1
SERVER_IP="your-server-ip"  # Replace with your actual server IP
KEY_PATH="your-key.pem"     # Replace with your key path

echo "🚀 Ultra-Fast Deploy: $FILENAME"

# Upload single file
echo "📤 Uploading $FILENAME..."
scp -i $KEY_PATH $FILENAME ubuntu@$SERVER_IP:/var/www/school-erp/$FILENAME

# Restart application
echo "🔄 Restarting application..."
ssh -i $KEY_PATH ubuntu@$SERVER_IP "cd /var/www/school-erp && pm2 restart school-erp"

echo "✅ Deployment completed in seconds!"
