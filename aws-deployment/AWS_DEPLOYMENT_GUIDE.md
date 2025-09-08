# Complete AWS Deployment Guide for School ERP System

This comprehensive guide will walk you through deploying your School ERP system on AWS from scratch, even if you have zero AWS knowledge.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [AWS Account Setup](#aws-account-setup)
3. [AWS Infrastructure Planning](#aws-infrastructure-planning)
4. [Database Setup (RDS PostgreSQL)](#database-setup-rds-postgresql)
5. [EC2 Instance Setup](#ec2-instance-setup)
6. [Application Deployment](#application-deployment)
7. [Domain and SSL Setup](#domain-and-ssl-setup)
8. [Monitoring and Backup](#monitoring-and-backup)
9. [Security Configuration](#security-configuration)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### What You Need:
- A computer with internet connection
- A domain name (optional but recommended)
- Basic understanding of command line (we'll guide you through everything)
- Credit card for AWS billing (you'll get free tier benefits)

### Estimated Costs:
- **Free Tier (First 12 months)**: $0-5/month
- **Production (after free tier)**: $20-50/month depending on usage

---

## AWS Account Setup

### Step 1: Create AWS Account
1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click "Create an AWS Account"
3. Fill in your details:
   - Email address
   - Password (use a strong password)
   - AWS account name (e.g., "School ERP Production")
4. Choose "Personal" account type
5. Add your credit card information
6. Complete phone verification
7. Choose a support plan (select "Basic Plan" - it's free)

### Step 2: Access AWS Console
1. Go to [console.aws.amazon.com](https://console.aws.amazon.com)
2. Sign in with your credentials
3. You'll see the AWS Management Console dashboard

### Step 3: Set Up Billing Alerts (Important!)
1. In the AWS Console, search for "Billing"
2. Click on "Billing Dashboard"
3. Go to "Billing Preferences"
4. Enable "Receive Billing Alerts"
5. Go to "CloudWatch" → "Alarms" → "Create Alarm"
6. Set up alerts for:
   - Total charges > $10
   - Total charges > $25
   - Total charges > $50

---

## AWS Infrastructure Planning

### Architecture Overview
```
Internet → Route 53 (DNS) → CloudFront (CDN) → Application Load Balancer → EC2 Instance
                                                      ↓
                                              RDS PostgreSQL Database
                                                      ↓
                                              S3 (File Storage)
```

### Services We'll Use:
1. **EC2**: Virtual server to run your application
2. **RDS**: Managed PostgreSQL database
3. **S3**: File storage for uploads
4. **Route 53**: DNS management
5. **CloudFront**: Content delivery network
6. **Application Load Balancer**: Traffic distribution
7. **Certificate Manager**: SSL certificates
8. **CloudWatch**: Monitoring and logging

---

## Database Setup (RDS PostgreSQL)

### Step 1: Create RDS Instance
1. In AWS Console, search for "RDS"
2. Click "Create database"
3. Choose "Standard create"
4. Select "PostgreSQL"
5. Choose "Free tier" template
6. Configure:
   - **DB instance identifier**: `school-erp-db`
   - **Master username**: `postgres`
   - **Master password**: Create a strong password (save this!) Sohailmemon0099
   - **DB instance class**: `db.t3.micro` (free tier)
   - **Storage**: 20 GB (free tier)
   - **VPC**: Default VPC
   - **Subnet group**: Default
   - **Public access**: Yes (for initial setup)
   - **VPC security groups**: Create new
   - **Database name**: `school_erp`

### Step 2: Configure Security Group
1. After database creation, go to "Security Groups"
2. Find your database security group
3. Edit inbound rules:
   - **Type**: PostgreSQL
   - **Port**: 5432
   - **Source**: Your IP address (for initial setup)
   - **Description**: "PostgreSQL access from my IP"

### Step 3: Get Database Connection Details
1. Go to RDS → Databases
2. Click on your database instance
3. Note down:
   - **Endpoint**: `school-erp-db.xxxxx.us-east-1.rds.amazonaws.com`
   - **Port**: 5432
   - **Database name**: school_erp
   - **Username**: postgres
   - **Password**: (the one you created)

---

## EC2 Instance Setup

### Step 1: Create EC2 Instance
1. In AWS Console, search for "EC2"
2. Click "Launch Instance"
3. Configure:
   - **Name**: `school-erp-server`
   - **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance type**: t2.micro (free tier)
   - **Key pair**: Create new key pair
     - Name: `school-erp-key`
     - Download the .pem file (save it securely!)
   - **Network settings**: 
     - VPC: Default VPC
     - Subnet: Default subnet
     - Auto-assign public IP: Enable
     - Security group: Create new
       - SSH (22): Your IP
       - HTTP (80): Anywhere (0.0.0.0/0)
       - HTTPS (443): Anywhere (0.0.0.0/0)
       - Custom TCP (5000): Anywhere (0.0.0.0/0)

### Step 2: Connect to EC2 Instance
1. Download and install PuTTY (Windows) or use Terminal (Mac/Linux)
2. Convert .pem to .ppk (PuTTY) or use SSH directly:

**For Mac/Linux:**
```bash
chmod 400 school-erp-key.pem
ssh -i school-erp-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

**For Windows (PuTTY):**
1. Open PuTTYgen
2. Load your .pem file
3. Save as .ppk file
4. Use PuTTY to connect with the .ppk file

### Step 3: Install Required Software
Once connected to your EC2 instance, run these commands:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Git
sudo apt install git -y

# Install PostgreSQL client
sudo apt install postgresql-client -y

# Install unzip
sudo apt install unzip -y

# Verify installations
node --version
npm --version
pm2 --version
nginx --version
```

---

## Application Deployment

### Step 1: Clone and Setup Application
```bash
# Create application directory
sudo mkdir -p /var/www/school-erp
sudo chown ubuntu:ubuntu /var/www/school-erp
cd /var/www/school-erp

# Clone your repository (replace with your actual repo URL)
git clone https://github.com/yourusername/school-erp-system.git .

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 2: Configure Environment Variables
```bash
# Create production environment file
sudo nano /var/www/school-erp/config.env
```

Add the following content (replace with your actual values):
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-rds-endpoint.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=school_erp
DB_USER=postgres
DB_PASSWORD=your_secure_database_password
JWT_SECRET=your_very_secure_jwt_secret_key_here
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=https://yourdomain.com

# SMS Configuration
SMS_ENABLED=true
SMS_PROVIDER=textlocal
SMS_API_KEY=your_textlocal_api_key_here
SMS_FROM_NUMBER=+1234567890

# AWS S3 Configuration (we'll set this up later)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=school-erp-uploads
```

### Step 3: Initialize Database
```bash
# Connect to your RDS database and create tables
cd /var/www/school-erp
npm run init-db
npm run init-role-permissions
npm run seed-db
```

### Step 4: Build Frontend
```bash
# Build React application
cd client
npm run build
cd ..
```

### Step 5: Configure PM2
```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

Add this content:
```javascript
module.exports = {
  apps: [{
    name: 'school-erp',
    script: 'server.js',
    cwd: '/var/www/school-erp',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/pm2/school-erp-error.log',
    out_file: '/var/log/pm2/school-erp-out.log',
    log_file: '/var/log/pm2/school-erp.log'
  }]
};
```

### Step 6: Start Application with PM2
```bash
# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown ubuntu:ubuntu /var/log/pm2

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command above
```

---

## Nginx Configuration

### Step 1: Configure Nginx
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/school-erp
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS (we'll enable this after SSL setup)
    # return 301 https://$server_name$request_uri;

    # For now, serve HTTP directly
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

    # Serve static files directly
    location /uploads/ {
        alias /var/www/school-erp/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Step 2: Enable Site
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/school-erp /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## S3 Setup for File Storage

### Step 1: Create S3 Bucket
1. In AWS Console, search for "S3"
2. Click "Create bucket"
3. Configure:
   - **Bucket name**: `school-erp-uploads-yourname` (must be globally unique)
   - **Region**: Same as your other resources
   - **Block all public access**: Uncheck (we need public access for uploads)
   - **Bucket Versioning**: Enable
   - **Default encryption**: Enable

### Step 2: Configure Bucket Policy
1. Go to your bucket → Permissions → Bucket Policy
2. Add this policy (replace bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::school-erp-uploads-yourname/*"
        }
    ]
}
```

### Step 3: Create IAM User for S3 Access
1. In AWS Console, search for "IAM"
2. Go to "Users" → "Create user"
3. Configure:
   - **User name**: `school-erp-s3-user`
   - **Access type**: Programmatic access
4. Attach policy: `AmazonS3FullAccess`
5. Save the Access Key ID and Secret Access Key

---

## Domain and SSL Setup

### Step 1: Point Domain to AWS
1. In your domain registrar (GoDaddy, Namecheap, etc.):
   - Create A record: `@` → Your EC2 public IP
   - Create CNAME record: `www` → `yourdomain.com`

### Step 2: Request SSL Certificate
1. In AWS Console, search for "Certificate Manager"
2. Click "Request a certificate"
3. Choose "Request a public certificate"
4. Add domain names:
   - `yourdomain.com`
   - `www.yourdomain.com`
5. Choose "DNS validation"
6. Follow DNS validation instructions

### Step 3: Update Nginx for HTTPS
```bash
# Update Nginx configuration
sudo nano /etc/nginx/sites-available/school-erp
```

Replace with HTTPS configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

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

    location /uploads/ {
        alias /var/www/school-erp/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Monitoring and Backup

### Step 1: Setup CloudWatch Monitoring
1. In AWS Console, go to CloudWatch
2. Create custom dashboard for your application
3. Set up alarms for:
   - High CPU usage
   - High memory usage
   - Database connections
   - Application errors

### Step 2: Database Backup
1. In RDS console, go to your database
2. Enable automated backups
3. Set backup retention period to 7 days
4. Enable point-in-time recovery

### Step 3: Application Backup Script
```bash
# Create backup script
nano /home/ubuntu/backup.sh
```

Add this content:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
APP_DIR="/var/www/school-erp"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $APP_DIR .

# Keep only last 7 days of backups
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: app_backup_$DATE.tar.gz"
```

```bash
# Make script executable
chmod +x /home/ubuntu/backup.sh

# Add to crontab for daily backups
crontab -e
# Add this line:
0 2 * * * /home/ubuntu/backup.sh
```

---

## Security Configuration

### Step 1: Update Security Groups
1. Go to EC2 → Security Groups
2. Edit your application security group:
   - Remove port 5000 from "Anywhere"
   - Add port 5000 only from Load Balancer security group
   - Keep SSH (22) only from your IP

### Step 2: Database Security
1. Update RDS security group:
   - Remove "Anywhere" access
   - Add only your EC2 security group

### Step 3: Regular Security Updates
```bash
# Create update script
nano /home/ubuntu/update.sh
```

Add this content:
```bash
#!/bin/bash
echo "Starting system update..."
sudo apt update && sudo apt upgrade -y
sudo npm update -g
pm2 restart school-erp
echo "Update completed!"
```

---

## Testing Your Deployment

### Step 1: Test Application
1. Open your browser and go to `http://yourdomain.com`
2. Test the following:
   - User registration/login
   - File uploads
   - Database operations
   - Email functionality

### Step 2: Performance Testing
```bash
# Install Apache Bench for testing
sudo apt install apache2-utils -y

# Test your application
ab -n 100 -c 10 http://yourdomain.com/api/health
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Application Won't Start
```bash
# Check PM2 logs
pm2 logs school-erp

# Check application logs
tail -f /var/log/pm2/school-erp-error.log
```

#### 2. Database Connection Issues
```bash
# Test database connection
psql -h your-rds-endpoint -U postgres -d school_erp

# Check security groups
# Ensure RDS security group allows EC2 security group
```

#### 3. Nginx Issues
```bash
# Check Nginx status
sudo systemctl status nginx

# Test Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

#### 4. SSL Certificate Issues
- Ensure DNS validation is complete
- Check domain DNS propagation
- Verify certificate is attached to load balancer

---

## Maintenance Tasks

### Daily Tasks
- Monitor application logs
- Check system resources
- Verify backups are running

### Weekly Tasks
- Review security groups
- Update system packages
- Check SSL certificate expiration

### Monthly Tasks
- Review AWS costs
- Update application dependencies
- Test disaster recovery procedures

---

## Cost Optimization

### Free Tier Limits
- EC2: 750 hours/month of t2.micro
- RDS: 750 hours/month of db.t2.micro
- S3: 5 GB storage
- Data transfer: 1 GB/month

### Cost-Saving Tips
1. Use t2.micro instances (free tier)
2. Enable S3 lifecycle policies
3. Use CloudWatch for monitoring
4. Set up billing alerts
5. Review unused resources monthly

---

## Support and Resources

### AWS Documentation
- [EC2 User Guide](https://docs.aws.amazon.com/ec2/)
- [RDS User Guide](https://docs.aws.amazon.com/rds/)
- [S3 User Guide](https://docs.aws.amazon.com/s3/)

### Getting Help
1. AWS Support (Basic plan is free)
2. AWS Forums
3. Stack Overflow
4. Your application logs

---

## Final Checklist

Before going live, ensure:
- [ ] Domain is pointing to your server
- [ ] SSL certificate is installed and working
- [ ] Database is accessible and populated
- [ ] Application is running without errors
- [ ] File uploads are working
- [ ] Email functionality is working
- [ ] Backup procedures are in place
- [ ] Monitoring is configured
- [ ] Security groups are properly configured
- [ ] Billing alerts are set up

---

## Congratulations! 🎉

Your School ERP system is now deployed on AWS! 

### Your Application URLs:
- **Main Application**: `https://yourdomain.com`
- **API Health Check**: `https://yourdomain.com/api/health`
- **Admin Panel**: `https://yourdomain.com/admin`

### Important Information to Save:
- EC2 Public IP: `YOUR_EC2_IP`
- RDS Endpoint: `YOUR_RDS_ENDPOINT`
- S3 Bucket: `YOUR_S3_BUCKET`
- Domain: `yourdomain.com`

### Next Steps:
1. Test all functionality thoroughly
2. Set up monitoring alerts
3. Create user accounts
4. Configure email settings
5. Train your team on the system

Remember to monitor your AWS costs and keep your system updated for security and performance!

---

*This guide covers the complete deployment process. If you encounter any issues, refer to the troubleshooting section or contact AWS support.*
