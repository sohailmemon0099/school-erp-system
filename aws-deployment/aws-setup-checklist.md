# AWS Setup Checklist

Use this checklist to ensure you complete all necessary steps for deploying your School ERP system on AWS.

## Pre-Deployment Checklist

### AWS Account Setup
- [ ] Created AWS account
- [ ] Added credit card for billing
- [ ] Set up billing alerts ($10, $25, $50)
- [ ] Enabled MFA (Multi-Factor Authentication)
- [ ] Created IAM user (optional, for better security)

### Domain Setup
- [ ] Purchased domain name
- [ ] Have access to domain registrar control panel
- [ ] Know how to update DNS records

### Application Preparation
- [ ] Code is in a Git repository (GitHub/GitLab)
- [ ] All environment variables identified
- [ ] Database schema is ready
- [ ] Email service configured (Gmail App Password)
- [ ] SMS service configured (TextLocal API key)

## Infrastructure Setup Checklist

### RDS Database
- [ ] Created RDS PostgreSQL instance
- [ ] Configured security group for database
- [ ] Noted database endpoint and credentials
- [ ] Tested database connection
- [ ] Enabled automated backups

### EC2 Instance
- [ ] Created EC2 instance (Ubuntu 22.04)
- [ ] Created and downloaded key pair
- [ ] Configured security group for EC2
- [ ] Connected to EC2 instance via SSH
- [ ] Installed required software (Node.js, PM2, Nginx)

### S3 Bucket
- [ ] Created S3 bucket for file uploads
- [ ] Configured bucket policy for public access
- [ ] Created IAM user for S3 access
- [ ] Noted S3 credentials

## Application Deployment Checklist

### Code Deployment
- [ ] Cloned repository to EC2
- [ ] Installed backend dependencies
- [ ] Installed frontend dependencies
- [ ] Built React application
- [ ] Created production config.env file

### Database Setup
- [ ] Connected to RDS database
- [ ] Ran database initialization scripts
- [ ] Created initial admin user
- [ ] Seeded initial data

### Process Management
- [ ] Configured PM2 ecosystem file
- [ ] Started application with PM2
- [ ] Set up PM2 startup script
- [ ] Verified application is running

### Web Server Configuration
- [ ] Configured Nginx
- [ ] Enabled site configuration
- [ ] Tested Nginx configuration
- [ ] Restarted Nginx service

## Security Checklist

### Network Security
- [ ] Configured security groups properly
- [ ] Removed unnecessary open ports
- [ ] Set up firewall rules (UFW)
- [ ] Limited SSH access to your IP only

### Application Security
- [ ] Used strong passwords for all services
- [ ] Configured JWT secret properly
- [ ] Set up rate limiting
- [ ] Enabled HTTPS (SSL certificate)

### Database Security
- [ ] Database not publicly accessible
- [ ] Strong database password
- [ ] Regular backups enabled
- [ ] Database security group properly configured

## Domain and SSL Checklist

### DNS Configuration
- [ ] Created A record pointing to EC2 IP
- [ ] Created CNAME record for www subdomain
- [ ] Verified DNS propagation

### SSL Certificate
- [ ] Requested SSL certificate from AWS Certificate Manager
- [ ] Completed DNS validation
- [ ] Updated Nginx configuration for HTTPS
- [ ] Tested HTTPS access

## Monitoring and Backup Checklist

### Monitoring Setup
- [ ] Configured CloudWatch alarms
- [ ] Set up application monitoring
- [ ] Created custom dashboard
- [ ] Configured log aggregation

### Backup Strategy
- [ ] Enabled RDS automated backups
- [ ] Created application backup script
- [ ] Set up automated backup schedule
- [ ] Tested backup and restore process

## Testing Checklist

### Functionality Testing
- [ ] User registration and login
- [ ] File upload functionality
- [ ] Database operations
- [ ] Email notifications
- [ ] SMS functionality
- [ ] All major features working

### Performance Testing
- [ ] Load testing completed
- [ ] Response times acceptable
- [ ] Memory usage within limits
- [ ] Database performance good

### Security Testing
- [ ] HTTPS working properly
- [ ] Security headers configured
- [ ] Rate limiting working
- [ ] No sensitive data exposed

## Go-Live Checklist

### Final Preparations
- [ ] All tests passed
- [ ] Monitoring alerts configured
- [ ] Backup procedures verified
- [ ] Documentation updated
- [ ] Team trained on new system

### Launch Day
- [ ] DNS changes propagated
- [ ] SSL certificate active
- [ ] Application accessible via domain
- [ ] All services running properly
- [ ] Performance monitoring active

## Post-Launch Checklist

### First Week
- [ ] Monitor application performance
- [ ] Check error logs daily
- [ ] Verify backups are running
- [ ] Monitor AWS costs
- [ ] Gather user feedback

### Ongoing Maintenance
- [ ] Regular security updates
- [ ] Application updates
- [ ] Database maintenance
- [ ] Cost optimization
- [ ] Performance monitoring

## Emergency Procedures

### Backup Contacts
- [ ] AWS Support contact information
- [ ] Domain registrar support
- [ ] Email service provider support
- [ ] SMS service provider support

### Recovery Procedures
- [ ] Database restore process documented
- [ ] Application rollback procedure
- [ ] Emergency contact list
- [ ] Incident response plan

---

## Quick Reference

### Important URLs
- AWS Console: https://console.aws.amazon.com
- Your Application: https://yourdomain.com
- Health Check: https://yourdomain.com/api/health

### Important Commands
```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Check application status
pm2 status
pm2 logs school-erp

# Restart application
pm2 restart school-erp

# Check Nginx status
sudo systemctl status nginx

# Update application
./update.sh

# Create backup
./backup.sh
```

### Important Files
- Application: `/var/www/school-erp`
- Config: `/var/www/school-erp/config.env`
- Logs: `/var/log/pm2/`
- Nginx: `/etc/nginx/sites-available/school-erp`

---

**Remember**: Keep this checklist handy during deployment and mark off items as you complete them. This ensures you don't miss any critical steps!
