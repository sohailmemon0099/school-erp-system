const { Classwork, ClassworkSubmission, Class, Subject, Teacher, Student, User } = require('../models');
const { Op } = require('sequelize');

// Create new classwork
const createClasswork = async (req, res) => {
  try {
    const {
      classId,
      subjectId,
      teacherId,
      title,
      description,
      type,
      dueDate,
      maxMarks,
      instructions,
      attachments,
      academicYear,
      semester
    } = req.body;

    // Generate unique classwork ID
    const classworkId = `CW${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const classwork = await Classwork.create({
      classworkId,
      classId,
      subjectId,
      teacherId,
      title,
      description,
      type,
      dueDate,
      maxMarks,
      instructions,
      attachments,
      academicYear,
      semester,
      createdBy: req.user.id
    });

    // Create submission records for all students in the class
    const students = await Student.findAll({
      where: { classId, isActive: true },
      include: [{ model: User, as: 'user' }]
    });

    const submissions = students.map(student => ({
      classworkId: classwork.id,
      studentId: student.id,
      status: 'not_submitted'
    }));

    await ClassworkSubmission.bulkCreate(submissions);

    const createdClasswork = await Classwork.findByPk(classwork.id, {
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user' }] },
        { model: User, as: 'creator' }
      ]
    });

    res.status(201).json({
      status: 'success',
      data: { classwork: createdClasswork }
    });
  } catch (error) {
    console.error('Error creating classwork:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create classwork'
    });
  }
};

// Get all classworks with filters
const getClassworks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      classId,
      subjectId,
      teacherId,
      type,
      status,
      academicYear,
      semester,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { isActive: true };

    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;
    if (teacherId) where.teacherId = teacherId;
    if (type) where.type = type;
    if (status) where.status = status;
    if (academicYear) where.academicYear = academicYear;
    if (semester) where.semester = semester;

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: classworks } = await Classwork.findAndCountAll({
      where,
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user' }] },
        { model: User, as: 'creator' }
      ],
      order: [['dueDate', 'ASC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      status: 'success',
      data: {
        classworks,
        pagination: {
          total: count,
          pages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching classworks:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch classworks'
    });
  }
};

// Get single classwork with submissions
const getClassworkById = async (req, res) => {
  try {
    const { id } = req.params;

    const classwork = await Classwork.findByPk(id, {
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user' }] },
        { model: User, as: 'creator' },
        {
          model: ClassworkSubmission,
          as: 'submissions',
          include: [
            { model: Student, as: 'student', include: [{ model: User, as: 'user' }] },
            { model: User, as: 'grader' }
          ]
        }
      ]
    });

    if (!classwork) {
      return res.status(404).json({
        status: 'error',
        message: 'Classwork not found'
      });
    }

    res.json({
      status: 'success',
      data: { classwork }
    });
  } catch (error) {
    console.error('Error fetching classwork:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch classwork'
    });
  }
};

// Update classwork
const updateClasswork = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const classwork = await Classwork.findByPk(id);
    if (!classwork) {
      return res.status(404).json({
        status: 'error',
        message: 'Classwork not found'
      });
    }

    await classwork.update(updateData);

    const updatedClasswork = await Classwork.findByPk(id, {
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user' }] },
        { model: User, as: 'creator' }
      ]
    });

    res.json({
      status: 'success',
      data: { classwork: updatedClasswork }
    });
  } catch (error) {
    console.error('Error updating classwork:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update classwork'
    });
  }
};

// Delete classwork
const deleteClasswork = async (req, res) => {
  try {
    const { id } = req.params;

    const classwork = await Classwork.findByPk(id);
    if (!classwork) {
      return res.status(404).json({
        status: 'error',
        message: 'Classwork not found'
      });
    }

    await classwork.update({ isActive: false });

    res.json({
      status: 'success',
      message: 'Classwork deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting classwork:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete classwork'
    });
  }
};

// Submit classwork
const submitClasswork = async (req, res) => {
  try {
    const { classworkId } = req.params;
    const { submissionText, attachments } = req.body;

    const submission = await ClassworkSubmission.findOne({
      where: {
        classworkId,
        studentId: req.user.studentId
      }
    });

    if (!submission) {
      return res.status(404).json({
        status: 'error',
        message: 'Classwork submission not found'
      });
    }

    const classwork = await Classwork.findByPk(classworkId);
    const isLate = new Date() > new Date(classwork.dueDate);

    await submission.update({
      submissionText,
      attachments,
      submittedAt: new Date(),
      status: isLate ? 'late' : 'submitted',
      isLate
    });

    res.json({
      status: 'success',
      message: 'Classwork submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting classwork:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit classwork'
    });
  }
};

// Grade classwork submission
const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { marksObtained, feedback, remarks } = req.body;

    const submission = await ClassworkSubmission.findByPk(submissionId);
    if (!submission) {
      return res.status(404).json({
        status: 'error',
        message: 'Submission not found'
      });
    }

    await submission.update({
      marksObtained,
      feedback,
      remarks,
      status: 'graded',
      gradedAt: new Date(),
      gradedBy: req.user.id
    });

    res.json({
      status: 'success',
      message: 'Submission graded successfully'
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to grade submission'
    });
  }
};

// Get classwork statistics
const getClassworkStats = async (req, res) => {
  try {
    const { classId, teacherId, academicYear } = req.query;
    const where = { isActive: true };

    if (classId) where.classId = classId;
    if (teacherId) where.teacherId = teacherId;
    if (academicYear) where.academicYear = academicYear;

    const totalClassworks = await Classwork.count({ where });

    const statusCounts = await Classwork.findAll({
      where,
      attributes: [
        'status',
        [Classwork.sequelize.fn('COUNT', Classwork.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const typeCounts = await Classwork.findAll({
      where,
      attributes: [
        'type',
        [Classwork.sequelize.fn('COUNT', Classwork.sequelize.col('id')), 'count']
      ],
      group: ['type']
    });

    res.json({
      status: 'success',
      data: {
        totalClassworks,
        statusCounts,
        typeCounts
      }
    });
  } catch (error) {
    console.error('Error fetching classwork stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch classwork statistics'
    });
  }
};

module.exports = {
  createClasswork,
  getClassworks,
  getClassworkById,
  updateClasswork,
  deleteClasswork,
  submitClasswork,
  gradeSubmission,
  getClassworkStats
};
