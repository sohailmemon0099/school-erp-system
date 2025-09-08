# AWS Deployment Files

This folder contains all the necessary files and documentation for deploying your School ERP system on AWS.

## 📁 Files Overview

### 📖 Documentation
- **`AWS_DEPLOYMENT_GUIDE.md`** - Complete step-by-step deployment guide (295+ lines)
- **`aws-setup-checklist.md`** - Comprehensive checklist to ensure nothing is missed
- **`README.md`** - This file explaining all the deployment files

### ⚙️ Configuration Files
- **`config.env.production`** - Production environment variables template
- **`ecosystem.config.js`** - PM2 process manager configuration
- **`nginx.conf`** - Nginx web server configuration with SSL support

### 🚀 Automation Scripts
- **`deploy.sh`** - Automated deployment script for EC2 instance

## 🎯 Quick Start

1. **Start with the main guide**: Read `AWS_DEPLOYMENT_GUIDE.md` thoroughly
2. **Use the checklist**: Follow `aws-setup-checklist.md` to track your progress
3. **Run the deployment script**: Use `deploy.sh` on your EC2 instance for automation

## 📋 File Usage Order

### 1. Planning Phase
- Read `AWS_DEPLOYMENT_GUIDE.md` (sections 1-3)
- Use `aws-setup-checklist.md` to plan your deployment

### 2. Infrastructure Setup
- Follow `AWS_DEPLOYMENT_GUIDE.md` (sections 4-5)
- Set up RDS and EC2 instances

### 3. Application Deployment
- Copy `config.env.production` to `config.env` and update values
- Copy `ecosystem.config.js` to your EC2 instance
- Copy `nginx.conf` to your EC2 instance
- Run `deploy.sh` on your EC2 instance

### 4. Final Configuration
- Complete SSL setup using `AWS_DEPLOYMENT_GUIDE.md` (section 7)
- Set up monitoring and backups (section 8)

## 🔧 Configuration Files Explained

### `config.env.production`
Template for production environment variables. Copy this to `config.env` and update with your actual values:
- Database credentials
- JWT secrets
- Email/SMS settings
- AWS S3 credentials

### `ecosystem.config.js`
PM2 configuration for process management:
- Application startup settings
- Log file locations
- Memory limits
- Auto-restart configuration

### `nginx.conf`
Web server configuration:
- HTTP to HTTPS redirect
- Proxy settings for Node.js app
- Static file serving
- SSL configuration (commented out initially)

### `deploy.sh`
Automated deployment script that:
- Updates system packages
- Installs Node.js, PM2, Nginx
- Sets up application directory
- Configures PM2 and Nginx
- Creates backup and update scripts

## 🚨 Important Notes

1. **Security**: Always update default passwords and secrets
2. **Domain**: Replace `yourdomain.com` with your actual domain
3. **AWS Credentials**: Keep your AWS credentials secure
4. **Backup**: Test your backup procedures before going live
5. **Monitoring**: Set up CloudWatch alarms for cost and performance

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section in `AWS_DEPLOYMENT_GUIDE.md`
2. Review the checklist in `aws-setup-checklist.md`
3. Check application logs: `pm2 logs school-erp`
4. Verify Nginx status: `sudo systemctl status nginx`

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ Application accessible via domain
- ✅ HTTPS working properly
- ✅ Database connected and populated
- ✅ File uploads working
- ✅ Email/SMS functionality working
- ✅ All security measures in place
- ✅ Monitoring and backups configured

---

**Happy Deploying! 🚀**
