const BulkSMS = require('../models/BulkSMS');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Class = require('../models/Class');
const { Op } = require('sequelize');
const smsService = require('../services/smsService');

// Get all bulk SMS campaigns
const getAllBulkSMS = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { campaignId: { [Op.iLike]: `%${search}%` } },
        { title: { [Op.iLike]: `%${search}%` } },
        { message: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    const campaigns = await BulkSMS.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['firstName', 'lastName', 'email']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['name', 'section']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      status: 'success',
      data: {
        campaigns: campaigns.rows,
        totalCount: campaigns.count,
        totalPages: Math.ceil(campaigns.count / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    console.error('Error fetching bulk SMS campaigns:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bulk SMS campaigns'
    });
  }
};

// Get bulk SMS campaign by ID
const getBulkSMSById = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await BulkSMS.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['firstName', 'lastName', 'email']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['name', 'section']
        }
      ]
    });

    if (!campaign) {
      return res.status(404).json({
        status: 'error',
        message: 'Bulk SMS campaign not found'
      });
    }

    res.json({
      status: 'success',
      data: { campaign }
    });
  } catch (error) {
    console.error('Error fetching bulk SMS campaign:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bulk SMS campaign'
    });
  }
};

// Create new bulk SMS campaign
const createBulkSMS = async (req, res) => {
  try {
    const {
      title,
      message,
      recipientType,
      recipientIds,
      classId,
      scheduledAt
    } = req.body;

    // Calculate total recipients
    let totalRecipients = 0;
    let recipients = [];

    switch (recipientType) {
      case 'all_students':
        const allStudents = await Student.findAll({
          include: [{ model: User, as: 'user', attributes: ['phone'] }]
        });
        recipients = allStudents.filter(s => s.user?.phone).map(s => ({
          id: s.id,
          phone: s.user.phone,
          name: `${s.user.firstName} ${s.user.lastName}`,
          type: 'student'
        }));
        totalRecipients = recipients.length;
        break;

      case 'all_teachers':
        const allTeachers = await Teacher.findAll({
          include: [{ model: User, as: 'user', attributes: ['phone'] }]
        });
        recipients = allTeachers.filter(t => t.user?.phone).map(t => ({
          id: t.id,
          phone: t.user.phone,
          name: `${t.user.firstName} ${t.user.lastName}`,
          type: 'teacher'
        }));
        totalRecipients = recipients.length;
        break;

      case 'specific_class':
        if (!classId) {
          return res.status(400).json({
            status: 'error',
            message: 'Class ID is required for specific class recipients'
          });
        }
        const classStudents = await Student.findAll({
          where: { classId },
          include: [{ model: User, as: 'user', attributes: ['phone'] }]
        });
        recipients = classStudents.filter(s => s.user?.phone).map(s => ({
          id: s.id,
          phone: s.user.phone,
          name: `${s.user.firstName} ${s.user.lastName}`,
          type: 'student'
        }));
        totalRecipients = recipients.length;
        break;

      case 'specific_students':
        if (!recipientIds || recipientIds.length === 0) {
          return res.status(400).json({
            status: 'error',
            message: 'Recipient IDs are required for specific students'
          });
        }
        const specificStudents = await Student.findAll({
          where: { id: recipientIds },
          include: [{ model: User, as: 'user', attributes: ['phone'] }]
        });
        recipients = specificStudents.filter(s => s.user?.phone).map(s => ({
          id: s.id,
          phone: s.user.phone,
          name: `${s.user.firstName} ${s.user.lastName}`,
          type: 'student'
        }));
        totalRecipients = recipients.length;
        break;

      case 'custom_numbers':
        if (!recipientIds || recipientIds.length === 0) {
          return res.status(400).json({
            status: 'error',
            message: 'Phone numbers are required for custom recipients'
          });
        }
        recipients = recipientIds.map(phone => ({
          phone,
          name: 'Custom Recipient',
          type: 'custom'
        }));
        totalRecipients = recipients.length;
        break;

      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid recipient type'
        });
    }

    if (totalRecipients === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid recipients found'
      });
    }

    const campaign = await BulkSMS.create({
      title,
      message,
      recipientType,
      recipientIds: recipients,
      classId,
      scheduledAt,
      totalRecipients,
      createdBy: req.user.id
    });

    const newCampaign = await BulkSMS.findByPk(campaign.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['firstName', 'lastName', 'email']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['name', 'section']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Bulk SMS campaign created successfully',
      data: { campaign: newCampaign }
    });
  } catch (error) {
    console.error('Error creating bulk SMS campaign:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create bulk SMS campaign'
    });
  }
};

// Send bulk SMS campaign
const sendBulkSMS = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await BulkSMS.findByPk(id);
    if (!campaign) {
      return res.status(404).json({
        status: 'error',
        message: 'Bulk SMS campaign not found'
      });
    }

    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      return res.status(400).json({
        status: 'error',
        message: 'Campaign can only be sent if it is in draft or scheduled status'
      });
    }

    // Update status to sending
    await campaign.update({ status: 'sending' });

    // Send SMS to all recipients
    const recipients = campaign.recipientIds;
    let sentCount = 0;
    let failedCount = 0;
    const deliveryReport = [];

    for (const recipient of recipients) {
      try {
        const result = await smsService.sendBulkSMS(recipient.phone, campaign.message);
        if (result.success) {
          sentCount++;
          deliveryReport.push({
            phone: recipient.phone,
            name: recipient.name,
            status: 'sent',
            messageId: result.messageId,
            sentAt: new Date()
          });
        } else {
          failedCount++;
          deliveryReport.push({
            phone: recipient.phone,
            name: recipient.name,
            status: 'failed',
            error: result.error,
            sentAt: new Date()
          });
        }
      } catch (error) {
        failedCount++;
        deliveryReport.push({
          phone: recipient.phone,
          name: recipient.name,
          status: 'failed',
          error: error.message,
          sentAt: new Date()
        });
      }

      // Add delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Update campaign with results
    await campaign.update({
      status: sentCount > 0 ? 'sent' : 'failed',
      sentAt: new Date(),
      sentCount,
      failedCount,
      deliveryReport
    });

    res.json({
      status: 'success',
      message: `Bulk SMS sent successfully. Sent: ${sentCount}, Failed: ${failedCount}`,
      data: {
        sentCount,
        failedCount,
        totalRecipients: campaign.totalRecipients
      }
    });
  } catch (error) {
    console.error('Error sending bulk SMS:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send bulk SMS'
    });
  }
};

// Update bulk SMS campaign
const updateBulkSMS = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const campaign = await BulkSMS.findByPk(id);
    if (!campaign) {
      return res.status(404).json({
        status: 'error',
        message: 'Bulk SMS campaign not found'
      });
    }

    if (campaign.status === 'sent' || campaign.status === 'sending') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot update campaign that has been sent or is being sent'
      });
    }

    await campaign.update(updateData);

    const updatedCampaign = await BulkSMS.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['firstName', 'lastName', 'email']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['name', 'section']
        }
      ]
    });

    res.json({
      status: 'success',
      message: 'Bulk SMS campaign updated successfully',
      data: { campaign: updatedCampaign }
    });
  } catch (error) {
    console.error('Error updating bulk SMS campaign:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update bulk SMS campaign'
    });
  }
};

// Delete bulk SMS campaign
const deleteBulkSMS = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await BulkSMS.findByPk(id);
    if (!campaign) {
      return res.status(404).json({
        status: 'error',
        message: 'Bulk SMS campaign not found'
      });
    }

    if (campaign.status === 'sent' || campaign.status === 'sending') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete campaign that has been sent or is being sent'
      });
    }

    await campaign.destroy();

    res.json({
      status: 'success',
      message: 'Bulk SMS campaign deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bulk SMS campaign:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete bulk SMS campaign'
    });
  }
};

// Get recipients for preview
const getRecipients = async (req, res) => {
  try {
    const { recipientType, classId, recipientIds } = req.query;
    let recipients = [];

    switch (recipientType) {
      case 'all_students':
        const allStudents = await Student.findAll({
          include: [
            { 
              model: User, 
              as: 'user', 
              attributes: ['firstName', 'lastName', 'phone', 'email'] 
            },
            {
              model: Class,
              as: 'class',
              attributes: ['name', 'section']
            }
          ]
        });
        recipients = allStudents.filter(s => s.user?.phone).map(s => ({
          id: s.id,
          name: `${s.user.firstName} ${s.user.lastName}`,
          phone: s.user.phone,
          email: s.user.email,
          class: `${s.class?.name} ${s.class?.section}`,
          type: 'student'
        }));
        break;

      case 'all_teachers':
        const allTeachers = await Teacher.findAll({
          include: [
            { 
              model: User, 
              as: 'user', 
              attributes: ['firstName', 'lastName', 'phone', 'email'] 
            }
          ]
        });
        recipients = allTeachers.filter(t => t.user?.phone).map(t => ({
          id: t.id,
          name: `${t.user.firstName} ${t.user.lastName}`,
          phone: t.user.phone,
          email: t.user.email,
          type: 'teacher'
        }));
        break;

      case 'specific_class':
        if (!classId) {
          return res.status(400).json({
            status: 'error',
            message: 'Class ID is required'
          });
        }
        const classStudents = await Student.findAll({
          where: { classId },
          include: [
            { 
              model: User, 
              as: 'user', 
              attributes: ['firstName', 'lastName', 'phone', 'email'] 
            },
            {
              model: Class,
              as: 'class',
              attributes: ['name', 'section']
            }
          ]
        });
        recipients = classStudents.filter(s => s.user?.phone).map(s => ({
          id: s.id,
          name: `${s.user.firstName} ${s.user.lastName}`,
          phone: s.user.phone,
          email: s.user.email,
          class: `${s.class?.name} ${s.class?.section}`,
          type: 'student'
        }));
        break;

      case 'specific_students':
        if (!recipientIds) {
          return res.status(400).json({
            status: 'error',
            message: 'Recipient IDs are required'
          });
        }
        const specificStudents = await Student.findAll({
          where: { id: recipientIds.split(',') },
          include: [
            { 
              model: User, 
              as: 'user', 
              attributes: ['firstName', 'lastName', 'phone', 'email'] 
            },
            {
              model: Class,
              as: 'class',
              attributes: ['name', 'section']
            }
          ]
        });
        recipients = specificStudents.filter(s => s.user?.phone).map(s => ({
          id: s.id,
          name: `${s.user.firstName} ${s.user.lastName}`,
          phone: s.user.phone,
          email: s.user.email,
          class: `${s.class?.name} ${s.class?.section}`,
          type: 'student'
        }));
        break;

      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid recipient type'
        });
    }

    res.json({
      status: 'success',
      data: { recipients }
    });
  } catch (error) {
    console.error('Error fetching recipients:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch recipients'
    });
  }
};

module.exports = {
  getAllBulkSMS,
  getBulkSMSById,
  createBulkSMS,
  sendBulkSMS,
  updateBulkSMS,
  deleteBulkSMS,
  getRecipients
};
