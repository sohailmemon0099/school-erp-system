const { Student, User } = require('../models');
const { Op } = require('sequelize');

// Health Record Management
const getHealthRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', studentId = '', condition = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { condition: { [Op.iLike]: `%${search}%` } },
        { treatment: { [Op.iLike]: `%${search}%` } },
        { notes: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (studentId) {
      whereClause.studentId = studentId;
    }
    if (condition) {
      whereClause.condition = condition;
    }

    // For now, we'll use a simple approach since we don't have a HealthRecord model yet
    // In a real implementation, you would create a HealthRecord model
    const students = await Student.findAll({
      where: { isActive: true },
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // Mock health records for demonstration
    const healthRecords = students.map(student => ({
      id: `health_${student.id}`,
      studentId: student.id,
      student: student,
      condition: 'General Checkup',
      treatment: 'Routine examination',
      date: new Date(),
      notes: 'Student is in good health',
      isEmergency: false,
      createdAt: new Date()
    }));

    res.json({
      success: true,
      data: healthRecords,
      pagination: {
        total: students.length,
        page: parseInt(page),
        pages: Math.ceil(students.length / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createHealthRecord = async (req, res) => {
  try {
    // Mock implementation - in real app, create HealthRecord model
    const healthRecord = {
      id: `health_${Date.now()}`,
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.status(201).json({ success: true, data: healthRecord });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Vaccination Management
const getVaccinations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', studentId = '', vaccineType = '' } = req.query;
    const offset = (page - 1) * limit;

    // Mock vaccination data
    const vaccinations = [
      {
        id: 'vacc_1',
        studentId: 'student_1',
        vaccineType: 'MMR',
        dateGiven: new Date('2024-01-15'),
        nextDueDate: new Date('2024-07-15'),
        administeredBy: 'Dr. Smith',
        notes: 'First dose completed',
        isCompleted: true
      },
      {
        id: 'vacc_2',
        studentId: 'student_2',
        vaccineType: 'Hepatitis B',
        dateGiven: new Date('2024-02-20'),
        nextDueDate: new Date('2024-08-20'),
        administeredBy: 'Dr. Johnson',
        notes: 'Booster required',
        isCompleted: false
      }
    ];

    res.json({
      success: true,
      data: vaccinations,
      pagination: {
        total: vaccinations.length,
        page: parseInt(page),
        pages: Math.ceil(vaccinations.length / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createVaccination = async (req, res) => {
  try {
    const vaccination = {
      id: `vacc_${Date.now()}`,
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.status(201).json({ success: true, data: vaccination });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Emergency Contacts
const getEmergencyContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { relationship: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Mock emergency contacts data
    const emergencyContacts = [
      {
        id: 'emergency_1',
        studentId: 'student_1',
        name: 'John Doe',
        phone: '+1234567890',
        relationship: 'Father',
        isPrimary: true,
        address: '123 Main St, City, State'
      },
      {
        id: 'emergency_2',
        studentId: 'student_1',
        name: 'Jane Doe',
        phone: '+0987654321',
        relationship: 'Mother',
        isPrimary: false,
        address: '123 Main St, City, State'
      }
    ];

    res.json({
      success: true,
      data: emergencyContacts,
      pagination: {
        total: emergencyContacts.length,
        page: parseInt(page),
        pages: Math.ceil(emergencyContacts.length / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  // Health Record Management
  getHealthRecords,
  createHealthRecord,
  
  // Vaccination Management
  getVaccinations,
  createVaccination,
  
  // Emergency Contacts
  getEmergencyContacts
};
