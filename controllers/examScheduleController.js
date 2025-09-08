const { ExamSchedule, Exam, Subject, Class, Teacher } = require('../models');
const { validationResult } = require('express-validator');

// Get all exam schedules
const getExamSchedules = async (req, res) => {
  try {
    const { page = 1, limit = 10, examId, classId, subjectId, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (examId) where.examId = examId;
    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;
    if (status) where.status = status;

    const examSchedules = await ExamSchedule.findAndCountAll({
      where,
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'name', 'type', 'academicYear']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        },
        {
          model: Teacher,
          as: 'invigilator',
          attributes: ['id', 'employeeId'],
          include: [{
            model: require('../models').User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email']
          }]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['examDate', 'ASC'], ['startTime', 'ASC']]
    });

    res.json({
      status: 'success',
      data: {
        examSchedules: examSchedules.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(examSchedules.count / limit),
          totalItems: examSchedules.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching exam schedules:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch exam schedules' });
  }
};

// Get exam schedule by ID
const getExamScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    const examSchedule = await ExamSchedule.findByPk(id, {
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'name', 'type', 'academicYear']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        },
        {
          model: Teacher,
          as: 'invigilator',
          attributes: ['id', 'employeeId'],
          include: [{
            model: require('../models').User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email']
          }]
        }
      ]
    });

    if (!examSchedule) {
      return res.status(404).json({ status: 'error', message: 'Exam schedule not found' });
    }

    res.json({
      status: 'success',
      data: { examSchedule }
    });
  } catch (error) {
    console.error('Error fetching exam schedule:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch exam schedule' });
  }
};

// Create new exam schedule
const createExamSchedule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const examScheduleData = req.body;
    const examSchedule = await ExamSchedule.create(examScheduleData);

    const createdExamSchedule = await ExamSchedule.findByPk(examSchedule.id, {
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'name', 'type', 'academicYear']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        },
        {
          model: Teacher,
          as: 'invigilator',
          attributes: ['id', 'employeeId'],
          include: [{
            model: require('../models').User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email']
          }]
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Exam schedule created successfully',
      data: { examSchedule: createdExamSchedule }
    });
  } catch (error) {
    console.error('Error creating exam schedule:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create exam schedule' });
  }
};

// Update exam schedule
const updateExamSchedule = async (req, res) => {
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

    const examSchedule = await ExamSchedule.findByPk(id);
    if (!examSchedule) {
      return res.status(404).json({ status: 'error', message: 'Exam schedule not found' });
    }

    await examSchedule.update(req.body);

    const updatedExamSchedule = await ExamSchedule.findByPk(id, {
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'name', 'type', 'academicYear']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        },
        {
          model: Teacher,
          as: 'invigilator',
          attributes: ['id', 'employeeId'],
          include: [{
            model: require('../models').User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email']
          }]
        }
      ]
    });

    res.json({
      status: 'success',
      message: 'Exam schedule updated successfully',
      data: { examSchedule: updatedExamSchedule }
    });
  } catch (error) {
    console.error('Error updating exam schedule:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update exam schedule' });
  }
};

// Delete exam schedule
const deleteExamSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const examSchedule = await ExamSchedule.findByPk(id);
    if (!examSchedule) {
      return res.status(404).json({ status: 'error', message: 'Exam schedule not found' });
    }

    await examSchedule.destroy();

    res.json({
      status: 'success',
      message: 'Exam schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting exam schedule:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete exam schedule' });
  }
};

// Get exam schedules by exam
const getExamSchedulesByExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const examSchedules = await ExamSchedule.findAll({
      where: { examId },
      include: [
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        },
        {
          model: Teacher,
          as: 'invigilator',
          attributes: ['id', 'employeeId'],
          include: [{
            model: require('../models').User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email']
          }]
        }
      ],
      order: [['examDate', 'ASC'], ['startTime', 'ASC']]
    });

    res.json({
      status: 'success',
      data: { examSchedules }
    });
  } catch (error) {
    console.error('Error fetching exam schedules by exam:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch exam schedules' });
  }
};

// Get exam schedules by class
const getExamSchedulesByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const examSchedules = await ExamSchedule.findAll({
      where: { classId },
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'name', 'type', 'academicYear']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Teacher,
          as: 'invigilator',
          attributes: ['id', 'employeeId'],
          include: [{
            model: require('../models').User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email']
          }]
        }
      ],
      order: [['examDate', 'ASC'], ['startTime', 'ASC']]
    });

    res.json({
      status: 'success',
      data: { examSchedules }
    });
  } catch (error) {
    console.error('Error fetching exam schedules by class:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch exam schedules' });
  }
};

module.exports = {
  getExamSchedules,
  getExamScheduleById,
  createExamSchedule,
  updateExamSchedule,
  deleteExamSchedule,
  getExamSchedulesByExam,
  getExamSchedulesByClass
};
