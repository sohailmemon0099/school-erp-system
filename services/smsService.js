const axios = require('axios');

class SMSService {
  constructor() {
    // SMS Service Configuration
    this.config = {
      // Using TextBelt (free SMS service) for demo purposes
      // You can replace with Twilio, AWS SNS, or any other SMS provider
      provider: process.env.SMS_PROVIDER || 'textbelt',
      apiKey: process.env.SMS_API_KEY || '',
      fromNumber: process.env.SMS_FROM_NUMBER || '+1234567890',
      enabled: process.env.SMS_ENABLED === 'true' || false
    };
  }

  /**
   * Send SMS using TextBelt (free service)
   * @param {string} phoneNumber - Phone number in international format
   * @param {string} message - SMS message content
   * @returns {Promise<Object>} - Response object
   */
  async sendViaTextBelt(phoneNumber, message) {
    try {
      const response = await axios.post('https://textbelt.com/text', {
        phone: phoneNumber,
        message: message,
        key: this.config.apiKey || 'textbelt'
      });

      return {
        success: response.data.success,
        messageId: response.data.textId,
        provider: 'textbelt',
        response: response.data
      };
    } catch (error) {
      console.error('TextBelt SMS Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
        provider: 'textbelt'
      };
    }
  }

  /**
   * Send SMS using TextLocal (free service)
   * @param {string} phoneNumber - Phone number in international format
   * @param {string} message - SMS message content
   * @returns {Promise<Object>} - Response object
   */
  async sendViaTextLocal(phoneNumber, message) {
    try {
      // TextLocal free SMS API
      const response = await axios.post('https://api.textlocal.in/send/', {
        apikey: this.config.apiKey || 'your_textlocal_api_key',
        numbers: phoneNumber,
        message: message,
        sender: 'TXTLCL'
      });

      return {
        success: response.data.status === 'success',
        messageId: response.data.batch_id,
        provider: 'textlocal',
        response: response.data
      };
    } catch (error) {
      console.error('TextLocal SMS Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
        provider: 'textlocal'
      };
    }
  }

  /**
   * Send SMS using SMSGlobal (free tier)
   * @param {string} phoneNumber - Phone number in international format
   * @param {string} message - SMS message content
   * @returns {Promise<Object>} - Response object
   */
  async sendViaSMSGlobal(phoneNumber, message) {
    try {
      // SMSGlobal free SMS API
      const response = await axios.post('https://api.smsglobal.com/http-api.php', {
        action: 'sendsms',
        user: this.config.apiKey || 'your_smsglobal_username',
        password: process.env.SMSGLOBAL_PASSWORD || 'your_smsglobal_password',
        to: phoneNumber,
        from: 'SchoolERP',
        text: message
      });

      return {
        success: response.data.includes('SUCCESS'),
        messageId: 'smsglobal-' + Date.now(),
        provider: 'smsglobal',
        response: response.data
      };
    } catch (error) {
      console.error('SMSGlobal SMS Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
        provider: 'smsglobal'
      };
    }
  }

  /**
   * Send SMS using Twilio
   * @param {string} phoneNumber - Phone number in international format
   * @param {string} message - SMS message content
   * @returns {Promise<Object>} - Response object
   */
  async sendViaTwilio(phoneNumber, message) {
    try {
      const twilio = require('twilio');
      const client = twilio(this.config.apiKey, process.env.TWILIO_AUTH_TOKEN);

      const response = await client.messages.create({
        body: message,
        from: this.config.fromNumber,
        to: phoneNumber
      });

      return {
        success: true,
        messageId: response.sid,
        provider: 'twilio',
        response: response
      };
    } catch (error) {
      console.error('Twilio SMS Error:', error.message);
      return {
        success: false,
        error: error.message,
        provider: 'twilio'
      };
    }
  }

  /**
   * Send SMS using AWS SNS
   * @param {string} phoneNumber - Phone number in international format
   * @param {string} message - SMS message content
   * @returns {Promise<Object>} - Response object
   */
  async sendViaAWSSNS(phoneNumber, message) {
    try {
      const AWS = require('aws-sdk');
      const sns = new AWS.SNS({
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      });

      const params = {
        Message: message,
        PhoneNumber: phoneNumber
      };

      const response = await sns.publish(params).promise();

      return {
        success: true,
        messageId: response.MessageId,
        provider: 'aws-sns',
        response: response
      };
    } catch (error) {
      console.error('AWS SNS SMS Error:', error.message);
      return {
        success: false,
        error: error.message,
        provider: 'aws-sns'
      };
    }
  }

  /**
   * Format phone number to international format
   * @param {string} phoneNumber - Phone number
   * @returns {string} - Formatted phone number
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it's a 10-digit number, assume it's US/India and add country code
    if (cleaned.length === 10) {
      // For demo purposes, assuming US (+1) - you can modify this logic
      cleaned = '+1' + cleaned;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      // US number with country code
      cleaned = '+' + cleaned;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      // Indian number with country code
      cleaned = '+' + cleaned;
    } else if (!cleaned.startsWith('+')) {
      // Add + if not present
      cleaned = '+' + cleaned;
    }

    return cleaned;
  }

  /**
   * Main method to send SMS
   * @param {string} phoneNumber - Phone number
   * @param {string} message - SMS message
   * @returns {Promise<Object>} - Response object
   */
  async sendSMS(phoneNumber, message) {
    // Check if SMS is enabled
    if (!this.config.enabled) {
      console.log('SMS service is disabled. Message would be sent to:', phoneNumber);
      console.log('Message:', message);
      return {
        success: true,
        messageId: 'disabled-' + Date.now(),
        provider: 'disabled',
        message: 'SMS service is disabled - message logged only'
      };
    }

    // Format phone number
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    
    console.log(`Sending SMS to ${formattedPhone}: ${message}`);

    try {
      let result;
      
      // Try multiple providers in order of preference
      const providers = this.config.provider.toLowerCase().split(',');
      
      for (const provider of providers) {
        switch (provider.trim()) {
          case 'twilio':
            result = await this.sendViaTwilio(formattedPhone, message);
            break;
          case 'aws-sns':
            result = await this.sendViaAWSSNS(formattedPhone, message);
            break;
          case 'textlocal':
            result = await this.sendViaTextLocal(formattedPhone, message);
            break;
          case 'smsglobal':
            result = await this.sendViaSMSGlobal(formattedPhone, message);
            break;
          case 'textbelt':
          default:
            result = await this.sendViaTextBelt(formattedPhone, message);
            break;
        }

        if (result.success) {
          console.log(`✅ SMS sent successfully via ${result.provider}. Message ID: ${result.messageId}`);
          return result;
        } else {
          console.warn(`⚠️ SMS failed via ${result.provider}:`, result.error);
          // Continue to next provider
        }
      }

      // If all providers failed, return the last result
      console.error(`❌ All SMS providers failed for ${formattedPhone}`);
      return result || {
        success: false,
        error: 'All SMS providers failed',
        provider: 'none'
      };
    } catch (error) {
      console.error('SMS Service Error:', error.message);
      return {
        success: false,
        error: error.message,
        provider: this.config.provider
      };
    }
  }

  /**
   * Send inquiry confirmation SMS
   * @param {Object} inquiry - Inquiry object
   * @returns {Promise<Object>} - Response object
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

  /**
   * Send follow-up SMS
   * @param {Object} inquiry - Inquiry object
   * @param {string} customMessage - Custom follow-up message
   * @returns {Promise<Object>} - Response object
   */
  async sendFollowUp(inquiry, customMessage = null) {
    const message = customMessage || `Dear ${inquiry.parentFirstName},

This is a follow-up regarding your inquiry ${inquiry.inquiryId} for ${inquiry.studentFirstName}.

Please contact us for further information about admission.

Best regards,
School Administration`;

    return await this.sendSMS(inquiry.parentPhone, message);
  }

  /**
   * Send bulk SMS (alias for sendSMS for compatibility)
   * @param {string} phoneNumber - Phone number in international format
   * @param {string} message - SMS message content
   * @returns {Promise<Object>} - Response object
   */
  async sendBulkSMS(phoneNumber, message) {
    return await this.sendSMS(phoneNumber, message);
  }
}

// Create singleton instance
const smsService = new SMSService();

module.exports = smsService;
