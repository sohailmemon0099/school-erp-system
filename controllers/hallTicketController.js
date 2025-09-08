const { HallTicket, Student, Exam, ExamSchedule, Class } = require('../models');
const { validationResult } = require('express-validator');

// Get all hall tickets
const getHallTickets = async (req, res) => {
  try {
    const { page = 1, limit = 10, examId, studentId, classId, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (examId) where.examId = examId;
    if (studentId) where.studentId = studentId;
    if (classId) where.classId = classId;
    if (status) where.status = status;

    const hallTickets = await HallTicket.findAndCountAll({
      where,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId'],
          include: [{
            model: require('../models').User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'name', 'type', 'academicYear']
        },
        {
          model: ExamSchedule,
          as: 'examSchedule',
          attributes: ['id', 'examDate', 'startTime', 'endTime', 'venue', 'roomNumber']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        hallTickets: hallTickets.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(hallTickets.count / limit),
          totalItems: hallTickets.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching hall tickets:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch hall tickets' });
  }
};

// Get hall ticket by ID
const getHallTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const hallTicket = await HallTicket.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId'],
          include: [{
            model: require('../models').User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'profileImage']
          }]
        },
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'name', 'type', 'academicYear']
        },
        {
          model: ExamSchedule,
          as: 'examSchedule',
          attributes: ['id', 'examDate', 'startTime', 'endTime', 'venue', 'roomNumber', 'instructions']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        }
      ]
    });

    if (!hallTicket) {
      return res.status(404).json({ status: 'error', message: 'Hall ticket not found' });
    }

    res.json({
      status: 'success',
      data: { hallTicket }
    });
  } catch (error) {
    console.error('Error fetching hall ticket:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch hall ticket' });
  }
};

// Create new hall ticket
const createHallTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const hallTicketData = req.body;
    const hallTicket = await HallTicket.create(hallTicketData);

    const createdHallTicket = await HallTicket.findByPk(hallTicket.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId'],
          include: [{
            model: require('../models').User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'name', 'type', 'academicYear']
        },
        {
          model: ExamSchedule,
          as: 'examSchedule',
          attributes: ['id', 'examDate', 'startTime', 'endTime', 'venue', 'roomNumber']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Hall ticket created successfully',
      data: { hallTicket: createdHallTicket }
    });
  } catch (error) {
    console.error('Error creating hall ticket:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create hall ticket' });
  }
};

// Update hall ticket
const updateHallTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const hallTicket = await HallTicket.findByPk(id);
    if (!hallTicket) {
      return res.status(404).json({ status: 'error', message: 'Hall ticket not found' });
    }

    await hallTicket.update(req.body);

    const updatedHallTicket = await HallTicket.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId'],
          include: [{
            model: require('../models').User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'name', 'type', 'academicYear']
        },
        {
          model: ExamSchedule,
          as: 'examSchedule',
          attributes: ['id', 'examDate', 'startTime', 'endTime', 'venue', 'roomNumber']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        }
      ]
    });

    res.json({
      status: 'success',
      message: 'Hall ticket updated successfully',
      data: { hallTicket: updatedHallTicket }
    });
  } catch (error) {
    console.error('Error updating hall ticket:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update hall ticket' });
  }
};

// Delete hall ticket
const deleteHallTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const hallTicket = await HallTicket.findByPk(id);
    if (!hallTicket) {
      return res.status(404).json({ status: 'error', message: 'Hall ticket not found' });
    }

    await hallTicket.destroy();

    res.json({
      status: 'success',
      message: 'Hall ticket deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting hall ticket:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete hall ticket' });
  }
};

// Generate hall tickets for exam
const generateHallTicketsForExam = async (req, res) => {
  try {
    const { examId, classId } = req.body;

    // Get all students for the class
    const students = await Student.findAll({
      where: { classId, isActive: true },
      attributes: ['id', 'studentId', 'classId'],
      include: [{
        model: require('../models').User,
        as: 'user',
        attributes: ['firstName', 'lastName']
      }]
    });

    if (students.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No active students found for the class' });
    }

    // Get exam schedules for the exam and class
    const examSchedules = await ExamSchedule.findAll({
      where: { examId, classId },
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'name', 'type', 'academicYear']
        }
      ]
    });

    if (examSchedules.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No exam schedules found for the exam and class' });
    }

    const hallTickets = [];

    // Generate hall tickets for each student and exam schedule
    for (const student of students) {
      for (const examSchedule of examSchedules) {
        // Check if hall ticket already exists
        const existingTicket = await HallTicket.findOne({
          where: {
            studentId: student.id,
            examScheduleId: examSchedule.id
          }
        });

        if (!existingTicket) {
          const hallTicket = await HallTicket.create({
            studentId: student.id,
            examId: examId,
            examScheduleId: examSchedule.id,
            classId: student.classId,
            ticketNumber: `HT-${examId.substring(0, 8)}-${student.studentId}-${examSchedule.id.substring(0, 8)}`,
            status: 'generated',
            generatedAt: new Date()
          });

          hallTickets.push(hallTicket);
        }
      }
    }

    res.status(201).json({
      status: 'success',
      message: `Generated ${hallTickets.length} hall tickets successfully`,
      data: { hallTickets }
    });
  } catch (error) {
    console.error('Error generating hall tickets:', error);
    res.status(500).json({ status: 'error', message: 'Failed to generate hall tickets' });
  }
};

// Get hall tickets by student
const getHallTicketsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const hallTickets = await HallTicket.findAll({
      where: { studentId },
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'name', 'type', 'academicYear']
        },
        {
          model: ExamSchedule,
          as: 'examSchedule',
          attributes: ['id', 'examDate', 'startTime', 'endTime', 'venue', 'roomNumber']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: { hallTickets }
    });
  } catch (error) {
    console.error('Error fetching hall tickets by student:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch hall tickets' });
  }
};

module.exports = {
  getHallTickets,
  getHallTicketById,
  createHallTicket,
  updateHallTicket,
  deleteHallTicket,
  generateHallTicketsForExam,
  getHallTicketsByStudent
};
