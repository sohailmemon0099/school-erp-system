# 📱 SMS Service Setup Guide

## ✅ Current Status
Your School ERP system now has SMS functionality integrated! Currently running in **Demo Mode** which logs SMS messages to the console.

## 🎯 What's Working
- ✅ Inquiry creation triggers SMS notification
- ✅ SMS messages are formatted and logged to console
- ✅ Database tracks SMS sent status
- ✅ Multiple SMS provider support ready

## 🔧 How to Enable Real SMS

### Option 1: Twilio (Recommended - Most Reliable)
1. Sign up at [Twilio.com](https://www.twilio.com)
2. Get your Account SID and Auth Token
3. Update `config.env`:
```env
SMS_ENABLED=true
SMS_PROVIDER=twilio
SMS_API_KEY=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
SMS_FROM_NUMBER=+1234567890
```

### Option 2: TextLocal (Free Tier Available)
1. Sign up at [TextLocal.in](https://www.textlocal.in)
2. Get your API key
3. Update `config.env`:
```env
SMS_ENABLED=true
SMS_PROVIDER=textlocal
SMS_API_KEY=your_textlocal_api_key
```

### Option 3: SMSGlobal (Free Tier Available)
1. Sign up at [SMSGlobal.com](https://www.smsglobal.com)
2. Get your username and password
3. Update `config.env`:
```env
SMS_ENABLED=true
SMS_PROVIDER=smsglobal
SMS_API_KEY=your_smsglobal_username
SMSGLOBAL_PASSWORD=your_smsglobal_password
```

### Option 4: TextBelt (Limited Free)
1. Update `config.env`:
```env
SMS_ENABLED=true
SMS_PROVIDER=textbelt
SMS_API_KEY=textbelt
```

## 🔄 Switch to Real SMS Service

1. **Update the controller** to use real SMS service:
```javascript
// In controllers/inquiryController.js, change:
const smsService = require('../services/demoSmsService');
// To:
const smsService = require('../services/smsService');
```

2. **Restart the server**:
```bash
npm start
```

## 📱 Current Demo Mode Features

When you create an inquiry, you'll see:
```
📱 ===== SMS NOTIFICATION =====
📞 To: +18830933745
📝 Message: Dear Parent Demo,

Your inquiry has been registered successfully!

Inquiry ID: INQ-2025-09-0053
Student: SMS Demo
Desired Class: 5th
Academic Year: 2024-2025

We will contact you soon for further admission process.

Thank you for your interest in our school.

Best regards,
School Administration
📱 ==============================
```

## 🎯 SMS Features Available

1. **Inquiry Confirmation SMS** - Sent when new inquiry is created
2. **Follow-up SMS** - Can be sent manually for follow-ups
3. **Custom SMS** - Can send custom messages to parents
4. **Multi-provider Support** - Automatic fallback between providers
5. **Phone Number Formatting** - Automatic international format conversion

## 🔧 Advanced Configuration

### Multiple Provider Fallback
```env
SMS_PROVIDER=twilio,textlocal,textbelt
```
This will try Twilio first, then TextLocal, then TextBelt if previous ones fail.

### Disable SMS
```env
SMS_ENABLED=false
```

## 📊 Testing SMS

1. Create a new inquiry through the frontend
2. Check the server console for SMS logs
3. Verify the inquiry shows `smsSent: true` in the database

## 🚀 Next Steps

1. Choose a SMS provider from the options above
2. Sign up and get API credentials
3. Update the configuration
4. Switch from demo to real SMS service
5. Test with real phone numbers

## 💡 Tips

- **Twilio** is the most reliable but requires a paid account
- **TextLocal** offers free SMS for Indian numbers
- **SMSGlobal** has a free tier with limitations
- **TextBelt** is free but has country restrictions

## 🆘 Troubleshooting

- Check server console for SMS error messages
- Verify phone number format (should be international)
- Ensure API credentials are correct
- Check provider-specific error messages

---

**Your SMS system is ready! Just configure a provider to start sending real SMS messages.**
