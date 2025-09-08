#!/bin/bash

# Replace these with your actual values
SERVER_IP="YOUR_SERVER_IP_HERE"
KEY_PATH="YOUR_KEY_PATH_HERE"

# Get the filename from command line
FILE=$1

if [ -z "$FILE" ]; then
    echo "Usage: ./deploy-fast.sh <filename>"
    echo "Example: ./deploy-fast.sh server.js"
    exit 1
fi

echo "🚀 Deploying $FILE..."

# Upload file and restart in one go
scp -i $KEY_PATH $FILE ubuntu@$SERVER_IP:/var/www/school-erp/$FILE && \
ssh -i $KEY_PATH ubuntu@$SERVER_IP "cd /var/www/school-erp && pm2 restart school-erp" && \
echo "✅ Deployed in seconds!"
