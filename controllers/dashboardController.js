const { 
  User, 
  Student, 
  Teacher, 
  Class, 
  Subject, 
  Attendance, 
  Grade, 
  Fee 
} = require('../models');
const { Op } = require('sequelize');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    // Get basic counts
    const totalStudents = await Student.count({ where: { isActive: true } });
    const totalTeachers = await Teacher.count({ where: { isActive: true } });
    const totalClasses = await Class.count({ where: { isActive: true } });
    const totalSubjects = await Subject.count({ where: { isActive: true } });

    // Get today's attendance
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.count({
      where: {
        date: today,
        status: 'present'
      }
    });

    // Get total attendance for today
    const totalTodayAttendance = await Attendance.count({
      where: { date: today }
    });

    const attendancePercentage = totalTodayAttendance > 0 
      ? Math.round((todayAttendance / totalTodayAttendance) * 100) 
      : 0;

    // Get fee statistics
    const totalFees = await Fee.sum('amount') || 0;
    const paidFees = await Fee.sum('amount', {
      where: { status: 'paid' }
    }) || 0;
    const pendingFees = totalFees - paidFees;

    // Get recent activities
    const recentStudents = await Student.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName']
      }]
    });

    const recentTeachers = await Teacher.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName']
      }]
    });

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalStudents,
          totalTeachers,
          totalClasses,
          totalSubjects,
          todayAttendance,
          attendancePercentage
        },
        fees: {
          total: totalFees,
          paid: paidFees,
          pending: pendingFees,
          collectionRate: totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0
        },
        recentActivities: {
          students: recentStudents,
          teachers: recentTeachers
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching dashboard statistics'
    });
  }
};

// @desc    Get attendance chart data
// @route   GET /api/dashboard/attendance-chart
// @access  Private
const getAttendanceChart = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(days));

    const attendanceData = await Attendance.findAll({
      where: {
        date: {
          [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
        }
      },
      attributes: [
        'date',
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['date', 'status'],
      order: [['date', 'ASC']]
    });

    // Process data for chart
    const chartData = {};
    attendanceData.forEach(record => {
      if (!chartData[record.date]) {
        chartData[record.date] = { date: record.date, present: 0, absent: 0, late: 0, excused: 0 };
      }
      chartData[record.date][record.status] = parseInt(record.dataValues.count);
    });

    const chartArray = Object.values(chartData);

    res.status(200).json({
      status: 'success',
      data: { chartData: chartArray }
    });
  } catch (error) {
    console.error('Get attendance chart error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching attendance chart data'
    });
  }
};

// @desc    Get grade distribution chart
// @route   GET /api/dashboard/grade-distribution
// @access  Private
const getGradeDistribution = async (req, res) => {
  try {
    const { classId, subjectId } = req.query;

    const whereClause = {};
    if (classId) {
      whereClause['$student.classId$'] = classId;
    }
    if (subjectId) {
      whereClause.subjectId = subjectId;
    }

    const grades = await Grade.findAll({
      where: whereClause,
      include: [{
        model: Student,
        as: 'student',
        attributes: []
      }]
    });

    // Calculate grade distribution
    const distribution = grades.reduce((acc, grade) => {
      const percentage = (grade.marks / grade.maxMarks) * 100;
      let gradeLetter;
      
      if (percentage >= 90) gradeLetter = 'A+';
      else if (percentage >= 80) gradeLetter = 'A';
      else if (percentage >= 70) gradeLetter = 'B+';
      else if (percentage >= 60) gradeLetter = 'B';
      else if (percentage >= 50) gradeLetter = 'C+';
      else if (percentage >= 40) gradeLetter = 'C';
      else gradeLetter = 'F';

      acc[gradeLetter] = (acc[gradeLetter] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      status: 'success',
      data: { distribution }
    });
  } catch (error) {
    console.error('Get grade distribution error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching grade distribution'
    });
  }
};

// @desc    Get fee collection chart
// @route   GET /api/dashboard/fee-collection
// @access  Private
const getFeeCollection = async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - parseInt(months));

    const fees = await Fee.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
        'status',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      group: ['month', 'status'],
      order: [['month', 'ASC']]
    });

    // Process data for chart
    const chartData = {};
    fees.forEach(fee => {
      const month = fee.dataValues.month.toISOString().substring(0, 7);
      if (!chartData[month]) {
        chartData[month] = { month, paid: 0, pending: 0 };
      }
      if (fee.status === 'paid') {
        chartData[month].paid += parseFloat(fee.dataValues.total);
      } else {
        chartData[month].pending += parseFloat(fee.dataValues.total);
      }
    });

    const chartArray = Object.values(chartData);

    res.status(200).json({
      status: 'success',
      data: { chartData: chartArray }
    });
  } catch (error) {
    console.error('Get fee collection error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching fee collection data'
    });
  }
};

// @desc    Get class performance
// @route   GET /api/dashboard/class-performance
// @access  Private
const getClassPerformance = async (req, res) => {
  try {
    const classes = await Class.findAll({
      include: [
        {
          model: Student,
          as: 'students',
          attributes: ['id'],
          where: { isActive: true },
          required: false
        }
      ]
    });

    const classPerformance = await Promise.all(classes.map(async (classData) => {
      const studentCount = classData.students.length;
      
      // Get average attendance for this class
      const attendanceRecords = await Attendance.count({
        where: { classId: classData.id }
      });
      
      const presentRecords = await Attendance.count({
        where: { 
          classId: classData.id,
          status: 'present'
        }
      });
      
      const attendanceRate = attendanceRecords > 0 
        ? Math.round((presentRecords / attendanceRecords) * 100) 
        : 0;

      // Get average grades for this class
      const grades = await Grade.findAll({
        include: [{
          model: Student,
          as: 'student',
          where: { classId: classData.id },
          attributes: []
        }]
      });

      const averageGrade = grades.length > 0
        ? Math.round(grades.reduce((sum, grade) => sum + (grade.marks / grade.maxMarks) * 100, 0) / grades.length)
        : 0;

      return {
        classId: classData.id,
        className: classData.name,
        section: classData.section,
        studentCount,
        attendanceRate,
        averageGrade,
        capacity: classData.capacity,
        utilization: classData.capacity > 0 ? Math.round((studentCount / classData.capacity) * 100) : 0
      };
    }));

    res.status(200).json({
      status: 'success',
      data: { classPerformance }
    });
  } catch (error) {
    console.error('Get class performance error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching class performance data'
    });
  }
};

module.exports = {
  getDashboardStats,
  getAttendanceChart,
  getGradeDistribution,
  getFeeCollection,
  getClassPerformance
};
