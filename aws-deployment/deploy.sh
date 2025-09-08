#!/bin/bash

# School ERP AWS Deployment Script
# This script automates the deployment process on your EC2 instance

set -e  # Exit on any error

echo "🚀 Starting School ERP Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root. Use a regular user with sudo privileges."
    exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 if not already installed
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    print_status "Node.js already installed: $(node --version)"
fi

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    sudo npm install -g pm2
else
    print_status "PM2 already installed: $(pm2 --version)"
fi

# Install Nginx if not already installed
if ! command -v nginx &> /dev/null; then
    print_status "Installing Nginx..."
    sudo apt install nginx -y
else
    print_status "Nginx already installed: $(nginx -v 2>&1)"
fi

# Install other required packages
print_status "Installing additional packages..."
sudo apt install -y git postgresql-client unzip

# Create application directory
APP_DIR="/var/www/school-erp"
print_status "Setting up application directory: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Check if this is a fresh deployment or update
if [ -d "$APP_DIR/.git" ]; then
    print_status "Updating existing application..."
    cd $APP_DIR
    git pull origin main
else
    print_warning "Fresh deployment detected. Please clone your repository manually:"
    print_warning "cd $APP_DIR"
    print_warning "git clone https://github.com/yourusername/school-erp-system.git ."
    print_warning "Then run this script again."
    exit 1
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
npm install --production

# Install frontend dependencies and build
print_status "Installing frontend dependencies and building..."
cd client
npm install
npm run build
cd ..

# Create uploads directory
print_status "Creating uploads directory..."
mkdir -p uploads
sudo chown -R $USER:$USER uploads

# Create log directories
print_status "Setting up log directories..."
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Check if config.env exists
if [ ! -f "config.env" ]; then
    print_warning "config.env not found. Please create it with your production settings."
    print_warning "You can copy from the example in the deployment guide."
    exit 1
fi

# Setup PM2
print_status "Setting up PM2..."
pm2 delete school-erp 2>/dev/null || true  # Delete existing process if any
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 startup (only if not already set)
if ! pm2 startup | grep -q "already"; then
    print_status "Setting up PM2 startup..."
    pm2 startup
    print_warning "Please run the command shown above to enable PM2 startup."
fi

# Setup Nginx
print_status "Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/school-erp
sudo ln -sf /etc/nginx/sites-available/school-erp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
if sudo nginx -t; then
    print_status "Nginx configuration is valid. Restarting Nginx..."
    sudo systemctl restart nginx
    sudo systemctl enable nginx
else
    print_error "Nginx configuration test failed. Please check your nginx.conf file."
    exit 1
fi

# Setup firewall
print_status "Configuring UFW firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Create backup script
print_status "Creating backup script..."
cat > /home/$USER/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
APP_DIR="/var/www/school-erp"

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $APP_DIR .

# Keep only last 7 days of backups
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: app_backup_$DATE.tar.gz"
EOF

chmod +x /home/$USER/backup.sh

# Create update script
print_status "Creating update script..."
cat > /home/$USER/update.sh << 'EOF'
#!/bin/bash
echo "Starting system update..."
sudo apt update && sudo apt upgrade -y
sudo npm update -g
cd /var/www/school-erp
git pull origin main
npm install --production
cd client
npm install
npm run build
cd ..
pm2 restart school-erp
echo "Update completed!"
EOF

chmod +x /home/$USER/update.sh

# Final status check
print_status "Checking application status..."
pm2 status

print_status "Checking Nginx status..."
sudo systemctl status nginx --no-pager -l

print_status "🎉 Deployment completed successfully!"
print_status "Your application should now be accessible at:"
print_status "  - HTTP: http://$(curl -s ifconfig.me)"
print_status "  - HTTPS: https://yourdomain.com (after SSL setup)"

print_warning "Next steps:"
print_warning "1. Update your config.env with production values"
print_warning "2. Initialize your database: npm run init-db"
print_warning "3. Set up your domain and SSL certificate"
print_warning "4. Configure your email and SMS settings"
print_warning "5. Test all functionality"

print_status "Useful commands:"
print_status "  - View logs: pm2 logs school-erp"
print_status "  - Restart app: pm2 restart school-erp"
print_status "  - Update app: ./update.sh"
print_status "  - Backup app: ./backup.sh"
