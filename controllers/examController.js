const { Exam, ExamSchedule, ExamResult, HallTicket, Student, Class, Subject, Teacher, User } = require('../models');
const { Op } = require('sequelize');

// Get all exams
const getExams = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, examType, status, classId, academicYear } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { examId: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (examType) where.examType = examType;
    if (status) where.status = status;
    if (classId) where.classId = classId;
    if (academicYear) where.academicYear = academicYear;

    const { count, rows: exams } = await Exam.findAndCountAll({
      where,
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      status: 'success',
      data: {
        exams,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch exams' });
  }
};

// Get exam by ID
const getExamById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const exam = await Exam.findByPk(id, {
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: ExamSchedule, as: 'schedules', include: [
          { model: Subject, as: 'subject' },
          { model: Teacher, as: 'invigilator', include: [
            { model: User, as: 'user', attributes: ['firstName', 'lastName'] }
          ]}
        ]}
      ]
    });

    if (!exam) {
      return res.status(404).json({ status: 'error', message: 'Exam not found' });
    }

    res.json({ status: 'success', data: { exam } });
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch exam' });
  }
};

// Create new exam
const createExam = async (req, res) => {
  try {
    // Generate exam ID if not provided
    let examId = req.body.examId;
    if (!examId) {
      const year = new Date().getFullYear();
      const academicYear = req.body.academicYear || `${year}-${year + 1}`;
      const count = await Exam.count({
        where: {
          academicYear: academicYear
        }
      });
      examId = `EXAM-${year}-${String(count + 1).padStart(4, '0')}`;
    }

    const examData = {
      ...req.body,
      examId,
      createdBy: req.user.id
    };

    const exam = await Exam.create(examData);

    res.status(201).json({
      status: 'success',
      message: 'Exam created successfully',
      data: { exam }
    });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create exam' });
  }
};

// Update exam
const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const exam = await Exam.findByPk(id);
    if (!exam) {
      return res.status(404).json({ status: 'error', message: 'Exam not found' });
    }

    await exam.update(updateData);

    res.json({
      status: 'success',
      message: 'Exam updated successfully',
      data: { exam }
    });
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update exam' });
  }
};

// Delete exam
const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findByPk(id);
    if (!exam) {
      return res.status(404).json({ status: 'error', message: 'Exam not found' });
    }

    await exam.destroy();

    res.json({ status: 'success', message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete exam' });
  }
};

// Get exam statistics
const getExamStats = async (req, res) => {
  try {
    const { academicYear } = req.query;
    
    const where = {};
    if (academicYear) where.academicYear = academicYear;

    const totalExams = await Exam.count({ where });
    const scheduledExams = await Exam.count({ where: { ...where, status: 'scheduled' } });
    const ongoingExams = await Exam.count({ where: { ...where, status: 'ongoing' } });
    const completedExams = await Exam.count({ where: { ...where, status: 'completed' } });

    // Get exam types distribution
    const examTypes = await Exam.findAll({
      attributes: [
        'examType',
        [Exam.sequelize.fn('COUNT', Exam.sequelize.col('id')), 'count']
      ],
      where,
      group: ['examType']
    });

    res.json({
      status: 'success',
      data: {
        totalExams,
        scheduledExams,
        ongoingExams,
        completedExams,
        examTypes
      }
    });
  } catch (error) {
    console.error('Error fetching exam stats:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch exam statistics' });
  }
};

// Create exam schedule
const createExamSchedule = async (req, res) => {
  try {
    const scheduleData = req.body;

    const examSchedule = await ExamSchedule.create(scheduleData);

    res.status(201).json({
      status: 'success',
      message: 'Exam schedule created successfully',
      data: { examSchedule }
    });
  } catch (error) {
    console.error('Error creating exam schedule:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create exam schedule' });
  }
};

// Get exam schedules
const getExamSchedules = async (req, res) => {
  try {
    const { examId, classId, subjectId, examDate } = req.query;

    const where = {};
    if (examId) where.examId = examId;
    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;
    if (examDate) where.examDate = examDate;

    const schedules = await ExamSchedule.findAll({
      where,
      include: [
        { model: Exam, as: 'exam' },
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { model: Teacher, as: 'invigilator', include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName'] }
        ]}
      ],
      order: [['examDate', 'ASC'], ['startTime', 'ASC']]
    });

    res.json({ status: 'success', data: { schedules } });
  } catch (error) {
    console.error('Error fetching exam schedules:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch exam schedules' });
  }
};

// Generate hall tickets
const generateHallTickets = async (req, res) => {
  try {
    const { examId, examScheduleId } = req.body;

    // Get students for the exam
    const exam = await Exam.findByPk(examId, {
      include: [
        { model: Class, as: 'class', include: [
          { model: Student, as: 'students', include: [
            { model: User, as: 'user', attributes: ['firstName', 'lastName'] }
          ]}
        ]}
      ]
    });

    if (!exam) {
      return res.status(404).json({ status: 'error', message: 'Exam not found' });
    }

    const hallTickets = [];
    const students = exam.class.students;

    for (const student of students) {
      const hallTicket = await HallTicket.create({
        examId,
        examScheduleId,
        studentId: student.id,
        examDate: exam.startDate,
        startTime: exam.startDate,
        endTime: exam.endDate,
        venue: exam.venue,
        generatedBy: req.user.id
      });

      hallTickets.push(hallTicket);
    }

    res.status(201).json({
      status: 'success',
      message: 'Hall tickets generated successfully',
      data: { hallTickets }
    });
  } catch (error) {
    console.error('Error generating hall tickets:', error);
    res.status(500).json({ status: 'error', message: 'Failed to generate hall tickets' });
  }
};

// Get hall tickets
const getHallTickets = async (req, res) => {
  try {
    const { examId, studentId, status } = req.query;

    const where = {};
    if (examId) where.examId = examId;
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;

    const hallTickets = await HallTicket.findAll({
      where,
      include: [
        { model: Exam, as: 'exam' },
        { model: Student, as: 'student', include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName'] }
        ]}
      ],
      order: [['examDate', 'ASC']]
    });

    res.json({ status: 'success', data: { hallTickets } });
  } catch (error) {
    console.error('Error fetching hall tickets:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch hall tickets' });
  }
};

module.exports = {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  getExamStats,
  createExamSchedule,
  getExamSchedules,
  generateHallTickets,
  getHallTickets
};
