const { Attendance, Student, Class, Subject, User, ClassTeacherAssignment } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { studentId, classId, subjectId, date, status } = req.query;

    const whereClause = {};
    
    if (studentId) whereClause.studentId = studentId;
    if (classId) whereClause.classId = classId;
    if (subjectId) whereClause.subjectId = subjectId;
    if (date) whereClause.date = date;
    if (status) whereClause.status = status;

    const { count, rows: attendance } = await Attendance.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code']
        }
      ],
      limit,
      offset,
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        attendance,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalRecords: count,
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching attendance'
    });
  }
};

// @desc    Get single attendance record
// @route   GET /api/attendance/:id
// @access  Private
const getAttendanceRecord = async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    if (!attendance) {
      return res.status(404).json({
        status: 'error',
        message: 'Attendance record not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { attendance }
    });
  } catch (error) {
    console.error('Get attendance record error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching attendance record'
    });
  }
};

// @desc    Create attendance record
// @route   POST /api/attendance
// @access  Private (Teacher, Admin)
const createAttendance = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { studentId, classId, subjectId, date, status, remarks } = req.body;

    // Check if attendance record already exists for this student, subject, and date
    const existingAttendance = await Attendance.findOne({
      where: { studentId, subjectId, date }
    });

    if (existingAttendance) {
      return res.status(400).json({
        status: 'error',
        message: 'Attendance record already exists for this student, subject, and date'
      });
    }

    const attendance = await Attendance.create({
      studentId,
      classId,
      subjectId,
      date,
      status,
      remarks,
      markedBy: req.user.id
    });

    // Fetch the created attendance with associations
    const newAttendance = await Attendance.findByPk(attendance.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Attendance recorded successfully',
      data: { attendance: newAttendance }
    });
  } catch (error) {
    console.error('Create attendance error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating attendance record'
    });
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Teacher, Admin)
const updateAttendance = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const attendance = await Attendance.findByPk(req.params.id);
    if (!attendance) {
      return res.status(404).json({
        status: 'error',
        message: 'Attendance record not found'
      });
    }

    const { status, remarks } = req.body;

    await attendance.update({
      status: status || attendance.status,
      remarks: remarks || attendance.remarks
    });

    // Fetch updated attendance with associations
    const updatedAttendance = await Attendance.findByPk(attendance.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    res.status(200).json({
      status: 'success',
      message: 'Attendance updated successfully',
      data: { attendance: updatedAttendance }
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating attendance record'
    });
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Admin)
const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id);
    if (!attendance) {
      return res.status(404).json({
        status: 'error',
        message: 'Attendance record not found'
      });
    }

    await attendance.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting attendance record'
    });
  }
};

// @desc    Bulk create attendance
// @route   POST /api/attendance/bulk
// @access  Private (Teacher, Admin)
const bulkCreateAttendance = async (req, res) => {
  try {
    const { classId, subjectId, date, attendanceData } = req.body;

    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Attendance data must be a non-empty array'
      });
    }

    const attendanceRecords = attendanceData.map(record => ({
      studentId: record.studentId,
      classId,
      subjectId,
      date,
      status: record.status,
      remarks: record.remarks,
      markedBy: req.user.id
    }));

    // Check for existing records
    const existingRecords = await Attendance.findAll({
      where: {
        classId,
        subjectId,
        date,
        studentId: attendanceRecords.map(r => r.studentId)
      }
    });

    if (existingRecords.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Some attendance records already exist for this date'
      });
    }

    const createdAttendance = await Attendance.bulkCreate(attendanceRecords);

    res.status(201).json({
      status: 'success',
      message: `${createdAttendance.length} attendance records created successfully`,
      data: { count: createdAttendance.length }
    });
  } catch (error) {
    console.error('Bulk create attendance error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating bulk attendance records'
    });
  }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private
const getAttendanceStats = async (req, res) => {
  try {
    const { studentId, classId, subjectId, startDate, endDate } = req.query;

    const whereClause = {};
    if (studentId) whereClause.studentId = studentId;
    if (classId) whereClause.classId = classId;
    if (subjectId) whereClause.subjectId = subjectId;
    if (startDate && endDate) {
      whereClause.date = { [Op.between]: [startDate, endDate] };
    }

    const totalRecords = await Attendance.count({ where: whereClause });
    const presentCount = await Attendance.count({ 
      where: { ...whereClause, status: 'present' } 
    });
    const absentCount = await Attendance.count({ 
      where: { ...whereClause, status: 'absent' } 
    });
    const lateCount = await Attendance.count({ 
      where: { ...whereClause, status: 'late' } 
    });
    const excusedCount = await Attendance.count({ 
      where: { ...whereClause, status: 'excused' } 
    });

    const attendancePercentage = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

    res.status(200).json({
      status: 'success',
      data: {
        total: totalRecords,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        excused: excusedCount,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100
      }
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching attendance statistics'
    });
  }
};

// @desc    Get classes accessible to teacher for attendance
// @route   GET /api/attendance/teacher-classes
// @access  Private (Teacher, Admin)
const getTeacherClasses = async (req, res) => {
  try {
    let classes;

    if (req.user.role === 'admin') {
      // Admin can see all classes
      classes = await Class.findAll({
        where: { isActive: true },
        attributes: ['id', 'name', 'section', 'academicYear'],
        order: [['name', 'ASC'], ['section', 'ASC']]
      });
    } else if (req.user.role === 'teacher') {
      // Teacher can only see assigned classes
      const assignments = await ClassTeacherAssignment.findAll({
        where: {
          teacherId: req.user.id,
          isActive: true
        },
        include: [
          {
            model: Class,
            as: 'class',
            attributes: ['id', 'name', 'section', 'academicYear'],
            where: { isActive: true }
          }
        ]
      });

      classes = assignments.map(assignment => assignment.class);
    } else {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Only teachers and admins can access this endpoint.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { classes }
    });
  } catch (error) {
    console.error('Get teacher classes error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching teacher classes'
    });
  }
};

// @desc    Get students by class for attendance marking
// @route   GET /api/attendance/class/:classId/students
// @access  Private (Teacher, Admin)
const getStudentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;
    
    console.log('getStudentsByClass called with classId:', classId, 'date:', date, 'user:', req.user.id, 'role:', req.user.role);

    // If user is a teacher, check if they have access to this class
    if (req.user.role === 'teacher') {
      const assignment = await ClassTeacherAssignment.findOne({
        where: {
          classId,
          teacherId: req.user.id,
          isActive: true
        }
      });

      if (!assignment) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied. You are not assigned to this class.'
        });
      }
    }

    // Get all students in the class
    const students = await Student.findAll({
      where: { classId, isActive: true },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section', 'academicYear']
        }
      ],
      order: [['studentId', 'ASC']]
    });

    // If date is provided, get existing attendance for that date
    let existingAttendance = [];
    if (date) {
      existingAttendance = await Attendance.findAll({
        where: { classId, date },
        attributes: ['studentId', 'status', 'remarks']
      });
    }

    // Create a map of existing attendance
    const attendanceMap = {};
    existingAttendance.forEach(record => {
      attendanceMap[record.studentId] = {
        status: record.status,
        remarks: record.remarks
      };
    });

    // Combine student data with attendance status
    const studentsWithAttendance = students.map(student => ({
      id: student.id,
      studentId: student.studentId,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      email: student.user.email,
      phone: student.user.phone,
      dateOfBirth: student.user.dateOfBirth,
      gender: student.user.gender,
      class: student.class,
      classId: student.classId,
      attendance: attendanceMap[student.id] || { status: null, remarks: null }
    }));
    
    console.log('Found students for class:', studentsWithAttendance.length);
    console.log('Students data:', studentsWithAttendance.map(s => ({ 
      id: s.id, 
      name: s.firstName, 
      classId: s.classId, 
      className: s.class?.name 
    })));

    res.status(200).json({
      status: 'success',
      data: {
        students: studentsWithAttendance,
        totalStudents: students.length,
        date: date || null
      }
    });
  } catch (error) {
    console.error('Get students by class error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching students for attendance'
    });
  }
};

// @desc    Mark attendance for entire class
// @route   POST /api/attendance/class/:classId/mark
// @access  Private (Teacher, Admin)
const markClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date, subjectId, attendanceData } = req.body;

    if (!date || !subjectId || !Array.isArray(attendanceData)) {
      return res.status(400).json({
        status: 'error',
        message: 'Date, subjectId, and attendanceData are required'
      });
    }

    // Check if attendance already exists for this class, subject, and date
    const existingAttendance = await Attendance.findAll({
      where: { classId, subjectId, date }
    });

    if (existingAttendance.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Attendance already marked for this class, subject, and date'
      });
    }

    // Prepare attendance records
    const attendanceRecords = attendanceData.map(record => ({
      studentId: record.studentId,
      classId,
      subjectId,
      date,
      status: record.status,
      remarks: record.remarks || null,
      markedBy: req.user.id
    }));

    // Create attendance records
    const createdAttendance = await Attendance.bulkCreate(attendanceRecords);

    res.status(201).json({
      status: 'success',
      message: `Attendance marked for ${createdAttendance.length} students`,
      data: {
        count: createdAttendance.length,
        date,
        classId,
        subjectId
      }
    });
  } catch (error) {
    console.error('Mark class attendance error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while marking class attendance'
    });
  }
};

// @desc    Update attendance for entire class
// @route   PUT /api/attendance/class/:classId/update
// @access  Private (Teacher, Admin)
const updateClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date, subjectId, attendanceData } = req.body;

    if (!date || !subjectId || !Array.isArray(attendanceData)) {
      return res.status(400).json({
        status: 'error',
        message: 'Date, subjectId, and attendanceData are required'
      });
    }

    // Get existing attendance records
    const existingAttendance = await Attendance.findAll({
      where: { classId, subjectId, date }
    });

    if (existingAttendance.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No attendance records found for this class, subject, and date'
      });
    }

    // Update attendance records
    const updatePromises = attendanceData.map(record => {
      const existingRecord = existingAttendance.find(att => att.studentId === record.studentId);
      if (existingRecord) {
        return existingRecord.update({
          status: record.status,
          remarks: record.remarks || null
        });
      }
      return null;
    });

    await Promise.all(updatePromises.filter(promise => promise !== null));

    res.status(200).json({
      status: 'success',
      message: 'Class attendance updated successfully',
      data: {
        count: attendanceData.length,
        date,
        classId,
        subjectId
      }
    });
  } catch (error) {
    console.error('Update class attendance error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating class attendance'
    });
  }
};

// @desc    Get attendance report for a class
// @route   GET /api/attendance/class/:classId/report
// @access  Private
const getClassAttendanceReport = async (req, res) => {
  try {
    const { classId } = req.params;
    const { startDate, endDate, subjectId } = req.query;

    const whereClause = { classId };
    if (startDate && endDate) {
      whereClause.date = { [Op.between]: [startDate, endDate] };
    }
    if (subjectId) {
      whereClause.subjectId = subjectId;
    }

    // Get attendance records
    const attendance = await Attendance.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code']
        }
      ],
      order: [['date', 'DESC'], ['student', 'studentId', 'ASC']]
    });

    // Calculate statistics
    const totalRecords = attendance.length;
    const presentCount = attendance.filter(record => record.status === 'present').length;
    const absentCount = attendance.filter(record => record.status === 'absent').length;
    const lateCount = attendance.filter(record => record.status === 'late').length;
    const excusedCount = attendance.filter(record => record.status === 'excused').length;

    const attendancePercentage = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

    res.status(200).json({
      status: 'success',
      data: {
        attendance,
        statistics: {
          total: totalRecords,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          excused: excusedCount,
          attendancePercentage: Math.round(attendancePercentage * 100) / 100
        },
        filters: {
          classId,
          startDate,
          endDate,
          subjectId
        }
      }
    });
  } catch (error) {
    console.error('Get class attendance report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching class attendance report'
    });
  }
};

module.exports = {
  getAttendance,
  getAttendanceRecord,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  bulkCreateAttendance,
  getAttendanceStats,
  getTeacherClasses,
  getStudentsByClass,
  markClassAttendance,
  updateClassAttendance,
  getClassAttendanceReport
};
