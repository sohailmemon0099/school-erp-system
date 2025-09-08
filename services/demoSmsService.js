const axios = require('axios');

class DemoSMSService {
  constructor() {
    this.config = {
      enabled: process.env.SMS_ENABLED === 'true' || false,
      demoMode: process.env.SMS_DEMO_MODE === 'true' || true
    };
  }

  /**
   * Format phone number to international format
   */
  formatPhoneNumber(phoneNumber) {
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      cleaned = '+1' + cleaned;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      cleaned = '+' + cleaned;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      cleaned = '+' + cleaned;
    } else if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  }

  /**
   * Send SMS (Demo Mode)
   */
  async sendSMS(phoneNumber, message) {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    
    console.log('\n📱 ===== SMS NOTIFICATION =====');
    console.log(`📞 To: ${formattedPhone}`);
    console.log(`📝 Message: ${message}`);
    console.log('📱 ==============================\n');
    
    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In demo mode, always return success
    if (this.config.demoMode) {
      console.log('✅ DEMO MODE: SMS would be sent successfully!');
      console.log('💡 To enable real SMS, configure a SMS provider in config.env');
      console.log('🔧 Available providers: Twilio, TextLocal, SMSGlobal, TextBelt\n');
      
      return {
        success: true,
        messageId: 'demo-' + Date.now(),
        provider: 'demo',
        message: 'Demo mode - SMS logged to console'
      };
    }
    
    return {
      success: false,
      error: 'SMS service not configured',
      provider: 'none'
    };
  }

  /**
   * Send inquiry confirmation SMS
   */
  async sendInquiryConfirmation(inquiry) {
    const message = `Dear ${inquiry.parentFirstName} ${inquiry.parentLastName},

Your inquiry has been registered successfully!

Inquiry ID: ${inquiry.inquiryId}
Student: ${inquiry.studentFirstName} ${inquiry.studentLastName}
Desired Class: ${inquiry.desiredClass}
Academic Year: ${inquiry.desiredAcademicYear}

We will contact you soon for further admission process.

Thank you for your interest in our school.

Best regards,
School Administration`;

    return await this.sendSMS(inquiry.parentPhone, message);
  }
}

module.exports = new DemoSMSService();
