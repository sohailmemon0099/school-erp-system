const { AttendanceReport, Student, Teacher, Class, User, Attendance } = require('../models');
const { Op } = require('sequelize');

// Generate unique report ID
const generateReportId = (reportType, academicYear) => {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${reportType.toUpperCase()}_${academicYear.replace('-', '')}_${timestamp}_${random}`;
};

// Get all attendance reports
const getAttendanceReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, reportType, status, academicYear, classId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { reportId: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (reportType) where.reportType = reportType;
    if (status) where.status = status;
    if (academicYear) where.academicYear = academicYear;
    if (classId) where.classId = classId;

    const { count, rows: reports } = await AttendanceReport.findAndCountAll({
      where,
      include: [
        { model: Class, as: 'class', attributes: ['id', 'name', 'section'] },
        { model: Student, as: 'student', include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName'] }
        ]},
        { model: Teacher, as: 'teacher', include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName'] }
        ]},
        { model: User, as: 'generator', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      status: 'success',
      data: {
        reports,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching attendance reports:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch attendance reports' });
  }
};

// Get attendance report by ID
const getAttendanceReportById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await AttendanceReport.findByPk(id, {
      include: [
        { model: Class, as: 'class', attributes: ['id', 'name', 'section'] },
        { model: Student, as: 'student', include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName'] }
        ]},
        { model: Teacher, as: 'teacher', include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName'] }
        ]},
        { model: User, as: 'generator', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    if (!report) {
      return res.status(404).json({ status: 'error', message: 'Attendance report not found' });
    }

    res.json({ status: 'success', data: { report } });
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch attendance report' });
  }
};

// Generate attendance report
const generateAttendanceReport = async (req, res) => {
  try {
    const {
      name,
      description,
      reportType,
      academicYear,
      startDate,
      endDate,
      classId,
      studentId,
      teacherId,
      filters = {}
    } = req.body;

    // Generate unique report ID
    const reportId = generateReportId(reportType, academicYear);

    // Calculate attendance data based on report type
    let attendanceData = {};
    let summary = {};

    if (reportType === 'student_wise' && studentId) {
      attendanceData = await generateStudentWiseReport(studentId, startDate, endDate, filters);
    } else if (reportType === 'class_wise' && classId) {
      attendanceData = await generateClassWiseReport(classId, startDate, endDate, filters);
    } else if (reportType === 'teacher_wise' && teacherId) {
      attendanceData = await generateTeacherWiseReport(teacherId, startDate, endDate, filters);
    } else {
      attendanceData = await generateGeneralReport(startDate, endDate, filters);
    }

    // Calculate summary statistics
    summary = calculateSummaryStatistics(attendanceData);

    // Create the report
    const report = await AttendanceReport.create({
      reportId,
      name,
      description,
      reportType,
      academicYear,
      startDate,
      endDate,
      classId,
      studentId,
      teacherId,
      totalDays: summary.totalDays,
      presentDays: summary.presentDays,
      absentDays: summary.absentDays,
      lateDays: summary.lateDays,
      halfDays: summary.halfDays,
      attendancePercentage: summary.attendancePercentage,
      reportData: attendanceData,
      summary,
      filters,
      generatedBy: req.user.id,
      status: 'generated'
    });

    res.status(201).json({
      status: 'success',
      message: 'Attendance report generated successfully',
      data: { report }
    });
  } catch (error) {
    console.error('Error generating attendance report:', error);
    res.status(500).json({ status: 'error', message: 'Failed to generate attendance report' });
  }
};

// Generate student-wise report
const generateStudentWiseReport = async (studentId, startDate, endDate, filters) => {
  const where = {
    studentId,
    date: {
      [Op.between]: [startDate, endDate]
    }
  };

  if (filters.status) {
    where.status = filters.status;
  }

  const attendanceRecords = await Attendance.findAll({
    where,
    include: [
      { model: Student, as: 'student', include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName'] }
      ]},
      { model: Class, as: 'class', attributes: ['name', 'section'] }
    ],
    order: [['date', 'ASC']]
  });

  return {
    type: 'student_wise',
    studentId,
    records: attendanceRecords,
    period: { startDate, endDate }
  };
};

// Generate class-wise report
const generateClassWiseReport = async (classId, startDate, endDate, filters) => {
  const where = {
    classId,
    date: {
      [Op.between]: [startDate, endDate]
    }
  };

  if (filters.status) {
    where.status = filters.status;
  }

  const attendanceRecords = await Attendance.findAll({
    where,
    include: [
      { model: Student, as: 'student', include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName'] }
      ]},
      { model: Class, as: 'class', attributes: ['name', 'section'] }
    ],
    order: [['date', 'ASC'], ['studentId', 'ASC']]
  });

  // Group by student
  const studentGroups = {};
  attendanceRecords.forEach(record => {
    const studentId = record.studentId;
    if (!studentGroups[studentId]) {
      studentGroups[studentId] = {
        student: record.student,
        records: []
      };
    }
    studentGroups[studentId].records.push(record);
  });

  return {
    type: 'class_wise',
    classId,
    studentGroups,
    period: { startDate, endDate }
  };
};

// Generate teacher-wise report
const generateTeacherWiseReport = async (teacherId, startDate, endDate, filters) => {
  // This would typically involve teacher attendance or classes taught
  // For now, we'll return a placeholder structure
  return {
    type: 'teacher_wise',
    teacherId,
    period: { startDate, endDate },
    note: 'Teacher-wise reports require additional teacher attendance tracking'
  };
};

// Generate general report
const generateGeneralReport = async (startDate, endDate, filters) => {
  const where = {
    date: {
      [Op.between]: [startDate, endDate]
    }
  };

  if (filters.classId) {
    where.classId = filters.classId;
  }
  if (filters.status) {
    where.status = filters.status;
  }

  const attendanceRecords = await Attendance.findAll({
    where,
    include: [
      { model: Student, as: 'student', include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName'] }
      ]},
      { model: Class, as: 'class', attributes: ['name', 'section'] }
    ],
    order: [['date', 'ASC']]
  });

  return {
    type: 'general',
    records: attendanceRecords,
    period: { startDate, endDate }
  };
};

// Calculate summary statistics
const calculateSummaryStatistics = (attendanceData) => {
  let totalDays = 0;
  let presentDays = 0;
  let absentDays = 0;
  let lateDays = 0;
  let halfDays = 0;

  if (attendanceData.records) {
    totalDays = attendanceData.records.length;
    attendanceData.records.forEach(record => {
      switch (record.status) {
        case 'present':
          presentDays++;
          break;
        case 'absent':
          absentDays++;
          break;
        case 'late':
          lateDays++;
          break;
        case 'half_day':
          halfDays++;
          break;
      }
    });
  } else if (attendanceData.studentGroups) {
    Object.values(attendanceData.studentGroups).forEach(group => {
      totalDays += group.records.length;
      group.records.forEach(record => {
        switch (record.status) {
          case 'present':
            presentDays++;
            break;
          case 'absent':
            absentDays++;
            break;
          case 'late':
            lateDays++;
            break;
          case 'half_day':
            halfDays++;
            break;
        }
      });
    });
  }

  const attendancePercentage = totalDays > 0 ? ((presentDays + lateDays + halfDays) / totalDays) * 100 : 0;

  return {
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    halfDays,
    attendancePercentage: Math.round(attendancePercentage * 100) / 100
  };
};

// Update attendance report
const updateAttendanceReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const report = await AttendanceReport.findByPk(id);
    if (!report) {
      return res.status(404).json({ status: 'error', message: 'Attendance report not found' });
    }

    await report.update(updateData);

    res.json({
      status: 'success',
      message: 'Attendance report updated successfully',
      data: { report }
    });
  } catch (error) {
    console.error('Error updating attendance report:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update attendance report' });
  }
};

// Delete attendance report
const deleteAttendanceReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await AttendanceReport.findByPk(id);
    if (!report) {
      return res.status(404).json({ status: 'error', message: 'Attendance report not found' });
    }

    await report.destroy();

    res.json({ status: 'success', message: 'Attendance report deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance report:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete attendance report' });
  }
};

// Get attendance report statistics
const getAttendanceReportStats = async (req, res) => {
  try {
    const { academicYear } = req.query;
    
    const where = {};
    if (academicYear) where.academicYear = academicYear;

    const totalReports = await AttendanceReport.count({ where });
    const monthlyReports = await AttendanceReport.count({ where: { ...where, reportType: 'monthly' } });
    const quarterlyReports = await AttendanceReport.count({ where: { ...where, reportType: 'quarterly' } });
    const yearlyReports = await AttendanceReport.count({ where: { ...where, reportType: 'yearly' } });
    const classWiseReports = await AttendanceReport.count({ where: { ...where, reportType: 'class_wise' } });
    const studentWiseReports = await AttendanceReport.count({ where: { ...where, reportType: 'student_wise' } });

    // Get recent reports
    const recentReports = await AttendanceReport.findAll({
      where,
      include: [
        { model: Class, as: 'class', attributes: ['name', 'section'] },
        { model: User, as: 'generator', attributes: ['firstName', 'lastName'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      status: 'success',
      data: {
        totalReports,
        monthlyReports,
        quarterlyReports,
        yearlyReports,
        classWiseReports,
        studentWiseReports,
        recentReports
      }
    });
  } catch (error) {
    console.error('Error fetching attendance report stats:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch attendance report statistics' });
  }
};

// Export report data
const exportAttendanceReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.query;

    const report = await AttendanceReport.findByPk(id, {
      include: [
        { model: Class, as: 'class', attributes: ['name', 'section'] },
        { model: Student, as: 'student', include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName'] }
        ]},
        { model: Teacher, as: 'teacher', include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName'] }
        ]},
        { model: User, as: 'generator', attributes: ['firstName', 'lastName', 'email'] }
      ]
    });

    if (!report) {
      return res.status(404).json({ status: 'error', message: 'Attendance report not found' });
    }

    if (format === 'csv') {
      // Generate CSV format
      const csvData = generateCSVData(report);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="attendance_report_${report.reportId}.csv"`);
      res.send(csvData);
    } else {
      // Return JSON format
      res.json({
        status: 'success',
        data: { report }
      });
    }
  } catch (error) {
    console.error('Error exporting attendance report:', error);
    res.status(500).json({ status: 'error', message: 'Failed to export attendance report' });
  }
};

// Generate CSV data
const generateCSVData = (report) => {
  let csv = `Report ID,${report.reportId}\n`;
  csv += `Name,${report.name}\n`;
  csv += `Type,${report.reportType}\n`;
  csv += `Academic Year,${report.academicYear}\n`;
  csv += `Period,${report.startDate} to ${report.endDate}\n`;
  csv += `Total Days,${report.totalDays}\n`;
  csv += `Present Days,${report.presentDays}\n`;
  csv += `Absent Days,${report.absentDays}\n`;
  csv += `Late Days,${report.lateDays}\n`;
  csv += `Half Days,${report.halfDays}\n`;
  csv += `Attendance %,${report.attendancePercentage}\n\n`;

  if (report.reportData && report.reportData.records) {
    csv += `Date,Student,Class,Status,Remarks\n`;
    report.reportData.records.forEach(record => {
      const studentName = record.student ? `${record.student.user.firstName} ${record.student.user.lastName}` : 'N/A';
      const className = record.class ? `${record.class.name} ${record.class.section}` : 'N/A';
      csv += `${record.date},${studentName},${className},${record.status},${record.remarks || ''}\n`;
    });
  }

  return csv;
};

module.exports = {
  getAttendanceReports,
  getAttendanceReportById,
  generateAttendanceReport,
  updateAttendanceReport,
  deleteAttendanceReport,
  getAttendanceReportStats,
  exportAttendanceReport
};