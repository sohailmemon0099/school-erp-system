# Free Domain Setup for Testing

This guide shows you how to get a free domain for testing your School ERP system on AWS.

## 🆓 Free Domain Options

### **1. Freenom (Recommended)**
- **Free domains**: `.tk`, `.ml`, `.ga`, `.cf`, `.gq`
- **Duration**: 12 months free
- **Cost**: Free for 12 months, then $0.99/year
- **Example**: `maatrika-school.tk`

### **2. DuckDNS (Alternative)**
- **Free subdomains**: `yourschool.duckdns.org`
- **Duration**: Free forever
- **Cost**: Completely free
- **Example**: `maatrika.duckdns.org`

## 🎯 Freenom Setup (Step by Step)

### **Step 1: Register Free Domain**
1. Go to [freenom.com](https://freenom.com)
2. Click "Register a new domain"
3. Search for your desired name (e.g., "maatrika-school")
4. Choose a free extension (`.tk` is most popular)
5. Click "Get it now!"
6. Select "12 months @ FREE"
7. Click "Continue"
8. Create account or login
9. Complete registration

### **Step 2: Configure DNS Records**
1. Login to Freenom
2. Go to "My Domains"
3. Click "Manage Domain" next to your domain
4. Go to "Management Tools" → "Nameservers"
5. Select "Use default nameservers"
6. Go to "Management Tools" → "Manage Freenom DNS"
7. Add these records:

```
Type: A
Name: @
Target: YOUR_EC2_PUBLIC_IP
TTL: 3600

Type: CNAME
Name: www
Target: yourdomain.tk
TTL: 3600
```

### **Step 3: Wait for DNS Propagation**
- DNS changes take 5-30 minutes to propagate
- Test with: `ping yourdomain.tk`
- Should return your EC2 IP address

## 🦆 DuckDNS Setup (Alternative)

### **Step 1: Create DuckDNS Account**
1. Go to [duckdns.org](https://duckdns.org)
2. Login with Google, Twitter, or Reddit
3. Create a subdomain (e.g., "maatrika")
4. Your domain will be: `maatrika.duckdns.org`

### **Step 2: Update IP Address**
1. In DuckDNS dashboard, click "Update IP"
2. Or use the update URL: `https://www.duckdns.org/update?domains=maatrika&token=YOUR_TOKEN&ip=YOUR_EC2_IP`

### **Step 3: Configure DNS**
DuckDNS automatically handles DNS, so no additional configuration needed.

## 🔧 AWS Configuration

### **Update Your Environment Variables**
```env
# In your config.env file
FRONTEND_URL=https://yourdomain.tk
# or
FRONTEND_URL=https://maatrika.duckdns.org
```

### **Update Nginx Configuration**
```nginx
# In nginx.conf, replace yourdomain.com with your free domain
server_name yourdomain.tk www.yourdomain.tk;
# or
server_name maatrika.duckdns.org;
```

## 🧪 Testing Your Free Domain

### **Step 1: Test DNS Resolution**
```bash
# Test if domain points to your server
ping yourdomain.tk
nslookup yourdomain.tk
```

### **Step 2: Test HTTP Access**
```bash
# Test if your application is accessible
curl -I http://yourdomain.tk
curl -I http://yourdomain.tk/api/health
```

### **Step 3: Test in Browser**
1. Open browser
2. Go to `http://yourdomain.tk`
3. Should see your School ERP login page

## 🔒 SSL Certificate for Free Domain

### **Using Let's Encrypt (Free SSL)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.tk -d www.yourdomain.tk

# Test auto-renewal
sudo certbot renew --dry-run
```

### **Update Nginx for HTTPS**
After SSL setup, your domain will be accessible at:
- `https://yourdomain.tk`
- `https://www.yourdomain.tk`

## 📱 Mobile Testing

Once your free domain is working:
1. **Test on mobile**: Open `https://yourdomain.tk` on your phone
2. **Test from different networks**: Try from different WiFi/mobile data
3. **Test from different locations**: Ask friends to test from their locations

## 🎯 Example URLs After Setup

If your free domain is `maatrika-school.tk`:

- **Main App**: `https://maatrika-school.tk`
- **Login**: `https://maatrika-school.tk/login`
- **Dashboard**: `https://maatrika-school.tk/dashboard`
- **API**: `https://maatrika-school.tk/api/health`
- **Admin**: `https://maatrika-school.tk/admin`

## ⚠️ Important Notes

### **Freenom Limitations**
- Free for 12 months only
- Some extensions may be blocked in certain countries
- Renewal required after 12 months

### **DuckDNS Limitations**
- Subdomain only (not a real domain)
- Less professional looking
- But completely free forever

### **Production Considerations**
- For production, consider buying a real domain ($10-15/year)
- Free domains may have reputation issues
- Some email providers block free domains

## 🚀 Quick Start Commands

### **For Freenom Domain**
```bash
# 1. Get your EC2 public IP
curl ifconfig.me

# 2. Update DNS records in Freenom
# 3. Wait 5-30 minutes for propagation
# 4. Test your domain
ping yourdomain.tk
```

### **For DuckDNS Domain**
```bash
# 1. Create subdomain at duckdns.org
# 2. Update IP address
# 3. Test immediately
ping maatrika.duckdns.org
```

## 🎉 Success Indicators

Your free domain is working when:
- ✅ `ping yourdomain.tk` returns your EC2 IP
- ✅ `http://yourdomain.tk` shows your application
- ✅ `https://yourdomain.tk` works with SSL
- ✅ Mobile devices can access the domain
- ✅ All functionality works the same as localhost

---

**Happy Testing! 🚀**

*Remember: Free domains are perfect for testing. For production use, consider investing in a professional domain name.*

