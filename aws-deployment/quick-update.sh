#!/bin/bash

# Ultra-fast update script for School ERP
# Only updates what's necessary

echo "🚀 Quick Update Starting..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Navigate to app directory
cd /var/www/school-erp

# Check if there are any changes to pull
print_status "Checking for updates..."
if git fetch origin main && git diff --quiet HEAD origin/main; then
    print_warning "No new changes found. Application is up to date!"
    exit 0
fi

# Pull only the changes (not full project)
print_status "Pulling changes from Git..."
git pull origin main

# Check if package.json changed (new dependencies)
if git diff HEAD~1 HEAD --name-only | grep -q "package.json"; then
    print_status "New dependencies detected. Installing..."
    npm install --production
else
    print_status "No new dependencies. Skipping npm install."
fi

# Check if frontend files changed
if git diff HEAD~1 HEAD --name-only | grep -q "client/"; then
    print_status "Frontend changes detected. Rebuilding..."
    cd client
    npm install
    npm run build
    cd ..
else
    print_status "No frontend changes. Skipping frontend build."
fi

# Restart application
print_status "Restarting application..."
pm2 restart school-erp

print_status "✅ Quick update completed successfully!"
print_status "Application is now running the latest version."
