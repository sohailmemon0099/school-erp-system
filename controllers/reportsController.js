const { 
  Student, 
  Teacher, 
  Class, 
  Subject, 
  Attendance, 
  Grade, 
  Fee,
  User,
  sequelize
} = require('../models');
const { Op } = require('sequelize');

// @desc    Generate student report
// @route   GET /api/reports/student/:id
// @access  Private
const generateStudentReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const student = await Student.findByPk(id, {
      include: [
        {
          model: User,
          attributes: { exclude: ['password'] }
        },
        {
          model: Class,
          attributes: ['id', 'name', 'section', 'academicYear']
        }
      ]
    });

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    // Get attendance data
    const attendanceWhere = { studentId: id };
    if (startDate && endDate) {
      attendanceWhere.date = { [Op.between]: [startDate, endDate] };
    }

    const attendance = await Attendance.findAll({
      where: attendanceWhere,
      include: [{
        model: Subject,
        attributes: ['name', 'code']
      }],
      order: [['date', 'DESC']]
    });

    // Get grades data
    const gradesWhere = { studentId: id };
    if (startDate && endDate) {
      gradesWhere.examDate = { [Op.between]: [startDate, endDate] };
    }

    const grades = await Grade.findAll({
      where: gradesWhere,
      include: [{
        model: Subject,
        attributes: ['name', 'code']
      }],
      order: [['examDate', 'DESC']]
    });

    // Get fees data
    const fees = await Fee.findAll({
      where: { studentId: id },
      order: [['dueDate', 'DESC']]
    });

    // Calculate statistics
    const totalAttendance = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const attendancePercentage = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

    const totalMarks = grades.reduce((sum, grade) => sum + grade.marks, 0);
    const totalMaxMarks = grades.reduce((sum, grade) => sum + grade.maxMarks, 0);
    const averagePercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;

    const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const paidFees = fees.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);
    const pendingFees = totalFees - paidFees;

    res.status(200).json({
      status: 'success',
      data: {
        student,
        attendance: {
          records: attendance,
          total: totalAttendance,
          present: presentCount,
          percentage: Math.round(attendancePercentage * 100) / 100
        },
        grades: {
          records: grades,
          total: grades.length,
          averagePercentage: Math.round(averagePercentage * 100) / 100
        },
        fees: {
          records: fees,
          total: totalFees,
          paid: paidFees,
          pending: pendingFees
        }
      }
    });
  } catch (error) {
    console.error('Generate student report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while generating student report'
    });
  }
};

// @desc    Generate class report
// @route   GET /api/reports/class/:id
// @access  Private
const generateClassReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const classData = await Class.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'students',
          where: { isActive: true },
          required: false,
          include: [{
            model: User,
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Teacher,
          as: 'teachers',
          attributes: ['id', 'employeeId'],
          through: { attributes: [] },
          include: [{
            model: User,
            attributes: ['firstName', 'lastName']
          }]
        }
      ]
    });

    if (!classData) {
      return res.status(404).json({
        status: 'error',
        message: 'Class not found'
      });
    }

    // Get attendance data for the class
    const attendanceWhere = { classId: id };
    if (startDate && endDate) {
      attendanceWhere.date = { [Op.between]: [startDate, endDate] };
    }

    const attendance = await Attendance.findAll({
      where: attendanceWhere,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId'],
          include: [{
            model: User,
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Subject,
          attributes: ['name', 'code']
        }
      ],
      order: [['date', 'DESC']]
    });

    // Get grades data for the class
    const gradesWhere = {};
    if (startDate && endDate) {
      gradesWhere.examDate = { [Op.between]: [startDate, endDate] };
    }

    const grades = await Grade.findAll({
      where: gradesWhere,
      include: [
        {
          model: Student,
          as: 'student',
          where: { classId: id },
          attributes: ['id', 'studentId'],
          include: [{
            model: User,
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Subject,
          attributes: ['name', 'code']
        }
      ],
      order: [['examDate', 'DESC']]
    });

    // Calculate class statistics
    const totalAttendance = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const attendancePercentage = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

    const totalMarks = grades.reduce((sum, grade) => sum + grade.marks, 0);
    const totalMaxMarks = grades.reduce((sum, grade) => sum + grade.maxMarks, 0);
    const averagePercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;

    // Student-wise statistics
    const studentStats = classData.students.map(student => {
      const studentAttendance = attendance.filter(a => a.studentId === student.id);
      const studentGrades = grades.filter(g => g.studentId === student.id);
      
      const studentAttendancePercentage = studentAttendance.length > 0
        ? (studentAttendance.filter(a => a.status === 'present').length / studentAttendance.length) * 100
        : 0;

      const studentAverageGrade = studentGrades.length > 0
        ? studentGrades.reduce((sum, grade) => sum + (grade.marks / grade.maxMarks) * 100, 0) / studentGrades.length
        : 0;

      return {
        studentId: student.id,
        studentName: `${student.user.firstName} ${student.user.lastName}`,
        attendancePercentage: Math.round(studentAttendancePercentage * 100) / 100,
        averageGrade: Math.round(studentAverageGrade * 100) / 100,
        totalGrades: studentGrades.length
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        class: classData,
        attendance: {
          records: attendance,
          total: totalAttendance,
          present: presentCount,
          percentage: Math.round(attendancePercentage * 100) / 100
        },
        grades: {
          records: grades,
          total: grades.length,
          averagePercentage: Math.round(averagePercentage * 100) / 100
        },
        studentStats
      }
    });
  } catch (error) {
    console.error('Generate class report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while generating class report'
    });
  }
};

// @desc    Generate attendance report
// @route   GET /api/reports/attendance
// @access  Private
const generateAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, classId, subjectId } = req.query;

    const whereClause = {};
    if (startDate && endDate) {
      whereClause.date = { [Op.between]: [startDate, endDate] };
    }
    if (classId) whereClause.classId = classId;
    if (subjectId) whereClause.subjectId = subjectId;

    const attendance = await Attendance.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId'],
          include: [{
            model: User,
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
      order: [['date', 'DESC']]
    });

    // Calculate statistics
    const totalRecords = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const absentCount = attendance.filter(a => a.status === 'absent').length;
    const lateCount = attendance.filter(a => a.status === 'late').length;
    const excusedCount = attendance.filter(a => a.status === 'excused').length;

    const attendancePercentage = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

    // Group by date
    const dailyStats = attendance.reduce((acc, record) => {
      const date = record.date;
      if (!acc[date]) {
        acc[date] = { date, present: 0, absent: 0, late: 0, excused: 0, total: 0 };
      }
      acc[date][record.status]++;
      acc[date].total++;
      return acc;
    }, {});

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          totalRecords,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          excused: excusedCount,
          attendancePercentage: Math.round(attendancePercentage * 100) / 100
        },
        dailyStats: Object.values(dailyStats),
        records: attendance
      }
    });
  } catch (error) {
    console.error('Generate attendance report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while generating attendance report'
    });
  }
};

// @desc    Generate fee report
// @route   GET /api/reports/fees
// @access  Private
const generateFeeReport = async (req, res) => {
  try {
    const { startDate, endDate, classId, status } = req.query;

    const whereClause = {};
    if (startDate && endDate) {
      whereClause.dueDate = { [Op.between]: [startDate, endDate] };
    }
    if (status) whereClause.status = status;

    let includeClause = [{
      model: Student,
      as: 'student',
      attributes: ['id', 'studentId'],
      include: [{
        model: User,
        attributes: ['firstName', 'lastName']
      }]
    }];

    if (classId) {
      includeClause[0].include.push({
        model: Class,
        attributes: ['id', 'name', 'section']
      });
      includeClause[0].where = { classId };
    }

    const fees = await Fee.findAll({
      where: whereClause,
      include: includeClause,
      order: [['dueDate', 'DESC']]
    });

    // Calculate statistics
    const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const paidFees = fees.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);
    const pendingFees = totalFees - paidFees;

    // Group by fee type
    const feeTypeStats = fees.reduce((acc, fee) => {
      if (!acc[fee.feeType]) {
        acc[fee.feeType] = { total: 0, paid: 0, pending: 0, count: 0 };
      }
      acc[fee.feeType].total += fee.amount;
      acc[fee.feeType].count++;
      if (fee.status === 'paid') {
        acc[fee.feeType].paid += fee.amount;
      } else {
        acc[fee.feeType].pending += fee.amount;
      }
      return acc;
    }, {});

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          totalFees,
          paidFees,
          pendingFees,
          collectionRate: totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0
        },
        feeTypeStats,
        records: fees
      }
    });
  } catch (error) {
    console.error('Generate fee report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while generating fee report'
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/reports/dashboard-stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    // Get counts for all entities
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      totalAttendance,
      totalGrades,
      totalFees
    ] = await Promise.all([
      Student.count(),
      Teacher.count(),
      Class.count(),
      Subject.count(),
      Attendance.count(),
      Grade.count(),
      Fee.count()
    ]);

    // Calculate total revenue from fees
    const feeStats = await Fee.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalCount']
      ],
      where: { status: 'paid' }
    });

    const totalRevenue = feeStats[0]?.dataValues?.totalAmount || 0;

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalStudents,
          totalTeachers,
          totalClasses,
          totalSubjects,
          totalAttendance,
          totalGrades,
          totalFees,
          totalRevenue: parseFloat(totalRevenue)
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching dashboard stats'
    });
  }
};

// @desc    Generate all students report
// @route   GET /api/reports/students
// @access  Private
const generateAllStudentsReport = async (req, res) => {
  try {
    const { startDate, endDate, classId } = req.query;
    
    let whereClause = {};
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    if (classId) {
      whereClause.classId = classId;
    }

    const students = await Student.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        students,
        total: students.length,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Generate all students report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while generating students report'
    });
  }
};

module.exports = {
  generateStudentReport,
  generateAllStudentsReport,
  generateClassReport,
  generateAttendanceReport,
  generateFeeReport,
  getDashboardStats
};
