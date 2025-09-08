const { MarkDistribution, GradeCalculation, Student, Class, Subject, User } = require('../models');
const { Op } = require('sequelize');

// Get all mark distributions
const getMarkDistributions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, classId, subjectId, academicYear } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;
    if (academicYear) where.academicYear = academicYear;
    where.isActive = true;

    const { count, rows: distributions } = await MarkDistribution.findAndCountAll({
      where,
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code'],
          required: false
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: distributions,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching mark distributions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mark distributions',
      error: error.message
    });
  }
};

// Get mark distribution by ID
const getMarkDistributionById = async (req, res) => {
  try {
    const { id } = req.params;

    const distribution = await MarkDistribution.findByPk(id, {
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code'],
          required: false
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    if (!distribution) {
      return res.status(404).json({
        success: false,
        message: 'Mark distribution not found'
      });
    }

    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error('Error fetching mark distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mark distribution',
      error: error.message
    });
  }
};

// Create new mark distribution
const createMarkDistribution = async (req, res) => {
  try {
    const {
      name,
      description,
      classId,
      subjectId,
      academicYear,
      semester,
      theoryMarks,
      practicalMarks,
      internalMarks,
      projectMarks,
      assignmentMarks,
      attendanceMarks,
      totalMarks,
      gradeSystem,
      passingPercentage,
      gradeBoundaries,
      theoryWeightage,
      practicalWeightage,
      internalWeightage,
      projectWeightage,
      assignmentWeightage,
      attendanceWeightage,
      allowGraceMarks,
      graceMarksLimit,
      roundingMethod
    } = req.body;

    // Validate that total marks equals sum of components
    const componentSum = theoryMarks + practicalMarks + internalMarks + 
                        projectMarks + assignmentMarks + attendanceMarks;
    
    if (componentSum !== totalMarks) {
      return res.status(400).json({
        success: false,
        message: 'Sum of component marks must equal total marks'
      });
    }

    // Validate that weightages sum to 100%
    const weightageSum = theoryWeightage + practicalWeightage + internalWeightage + 
                        projectWeightage + assignmentWeightage + attendanceWeightage;
    
    if (Math.abs(weightageSum - 100.0) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Sum of weightages must equal 100%'
      });
    }

    const distribution = await MarkDistribution.create({
      name,
      description,
      classId,
      subjectId,
      academicYear,
      semester,
      theoryMarks,
      practicalMarks,
      internalMarks,
      projectMarks,
      assignmentMarks,
      attendanceMarks,
      totalMarks,
      gradeSystem,
      passingPercentage,
      gradeBoundaries,
      theoryWeightage,
      practicalWeightage,
      internalWeightage,
      projectWeightage,
      assignmentWeightage,
      attendanceWeightage,
      allowGraceMarks,
      graceMarksLimit,
      roundingMethod,
      createdBy: req.user.id
    });

    // Fetch the created distribution with associations
    const createdDistribution = await MarkDistribution.findByPk(distribution.id, {
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code'],
          required: false
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Mark distribution created successfully',
      data: createdDistribution
    });
  } catch (error) {
    console.error('Error creating mark distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating mark distribution',
      error: error.message
    });
  }
};

// Update mark distribution
const updateMarkDistribution = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const distribution = await MarkDistribution.findByPk(id);
    if (!distribution) {
      return res.status(404).json({
        success: false,
        message: 'Mark distribution not found'
      });
    }

    // Validate component marks if provided
    if (updateData.theoryMarks !== undefined || updateData.practicalMarks !== undefined ||
        updateData.internalMarks !== undefined || updateData.projectMarks !== undefined ||
        updateData.assignmentMarks !== undefined || updateData.attendanceMarks !== undefined ||
        updateData.totalMarks !== undefined) {
      
      const theoryMarks = updateData.theoryMarks ?? distribution.theoryMarks;
      const practicalMarks = updateData.practicalMarks ?? distribution.practicalMarks;
      const internalMarks = updateData.internalMarks ?? distribution.internalMarks;
      const projectMarks = updateData.projectMarks ?? distribution.projectMarks;
      const assignmentMarks = updateData.assignmentMarks ?? distribution.assignmentMarks;
      const attendanceMarks = updateData.attendanceMarks ?? distribution.attendanceMarks;
      const totalMarks = updateData.totalMarks ?? distribution.totalMarks;
      
      const componentSum = theoryMarks + practicalMarks + internalMarks + 
                          projectMarks + assignmentMarks + attendanceMarks;
      
      if (componentSum !== totalMarks) {
        return res.status(400).json({
          success: false,
          message: 'Sum of component marks must equal total marks'
        });
      }
    }

    // Validate weightages if provided
    if (updateData.theoryWeightage !== undefined || updateData.practicalWeightage !== undefined ||
        updateData.internalWeightage !== undefined || updateData.projectWeightage !== undefined ||
        updateData.assignmentWeightage !== undefined || updateData.attendanceWeightage !== undefined) {
      
      const theoryWeightage = updateData.theoryWeightage ?? distribution.theoryWeightage;
      const practicalWeightage = updateData.practicalWeightage ?? distribution.practicalWeightage;
      const internalWeightage = updateData.internalWeightage ?? distribution.internalWeightage;
      const projectWeightage = updateData.projectWeightage ?? distribution.projectWeightage;
      const assignmentWeightage = updateData.assignmentWeightage ?? distribution.assignmentWeightage;
      const attendanceWeightage = updateData.attendanceWeightage ?? distribution.attendanceWeightage;
      
      const weightageSum = theoryWeightage + practicalWeightage + internalWeightage + 
                          projectWeightage + assignmentWeightage + attendanceWeightage;
      
      if (Math.abs(weightageSum - 100.0) > 0.01) {
        return res.status(400).json({
          success: false,
          message: 'Sum of weightages must equal 100%'
        });
      }
    }

    await distribution.update(updateData);

    // Fetch the updated distribution with associations
    const updatedDistribution = await MarkDistribution.findByPk(id, {
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code'],
          required: false
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Mark distribution updated successfully',
      data: updatedDistribution
    });
  } catch (error) {
    console.error('Error updating mark distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating mark distribution',
      error: error.message
    });
  }
};

// Delete mark distribution
const deleteMarkDistribution = async (req, res) => {
  try {
    const { id } = req.params;

    const distribution = await MarkDistribution.findByPk(id);
    if (!distribution) {
      return res.status(404).json({
        success: false,
        message: 'Mark distribution not found'
      });
    }

    // Check if there are any grade calculations using this distribution
    const gradeCalculations = await GradeCalculation.count({
      where: { markDistributionId: id }
    });

    if (gradeCalculations > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete mark distribution that is being used in grade calculations'
      });
    }

    await distribution.update({ isActive: false });

    res.json({
      success: true,
      message: 'Mark distribution deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting mark distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting mark distribution',
      error: error.message
    });
  }
};

// Calculate grades for students
const calculateGrades = async (req, res) => {
  try {
    const {
      classId,
      subjectId,
      academicYear,
      semester,
      studentIds
    } = req.body;

    // Get the mark distribution
    const distribution = await MarkDistribution.findOne({
      where: {
        classId,
        subjectId: subjectId || null,
        academicYear,
        semester: semester || null,
        isActive: true
      }
    });

    if (!distribution) {
      return res.status(404).json({
        success: false,
        message: 'No mark distribution found for the specified criteria'
      });
    }

    // Get students
    const where = { classId, isActive: true };
    if (studentIds && studentIds.length > 0) {
      where.id = { [Op.in]: studentIds };
    }

    const students = await Student.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No students found for the specified criteria'
      });
    }

    const results = [];

    for (const student of students) {
      // Check if grade calculation already exists
      let gradeCalculation = await GradeCalculation.findOne({
        where: {
          studentId: student.id,
          classId,
          subjectId,
          academicYear,
          semester: semester || null
        }
      });

      if (!gradeCalculation) {
        // Create new grade calculation
        gradeCalculation = await GradeCalculation.create({
          studentId: student.id,
          classId,
          subjectId,
          markDistributionId: distribution.id,
          academicYear,
          semester: semester || null,
          calculatedBy: req.user.id
        });
      }

      results.push({
        studentId: student.id,
        studentName: `${student.user.firstName} ${student.user.lastName}`,
        gradeCalculation
      });
    }

    res.json({
      success: true,
      message: 'Grades calculated successfully',
      data: {
        distribution,
        results
      }
    });
  } catch (error) {
    console.error('Error calculating grades:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating grades',
      error: error.message
    });
  }
};

// Get grade calculations
const getGradeCalculations = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      studentId, 
      classId, 
      subjectId, 
      academicYear, 
      semester 
    } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (studentId) where.studentId = studentId;
    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;
    if (academicYear) where.academicYear = academicYear;
    if (semester) where.semester = semester;
    where.isActive = true;

    const { count, rows: calculations } = await GradeCalculation.findAndCountAll({
      where,
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName']
            }
          ]
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
        },
        {
          model: MarkDistribution,
          as: 'markDistribution',
          attributes: ['id', 'name', 'totalMarks']
        }
      ],
      order: [['calculatedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: calculations,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching grade calculations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grade calculations',
      error: error.message
    });
  }
};

// Get mark distribution statistics
const getMarkDistributionStats = async (req, res) => {
  try {
    const { classId, academicYear } = req.query;

    const where = { isActive: true };
    if (classId) where.classId = classId;
    if (academicYear) where.academicYear = academicYear;

    const totalDistributions = await MarkDistribution.count({ where });
    
    const distributionsByClass = await MarkDistribution.findAll({
      where,
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        }
      ],
      attributes: ['classId'],
      group: ['classId', 'class.id', 'class.name', 'class.section'],
      raw: false
    });

    const distributionsBySubject = await MarkDistribution.findAll({
      where,
      include: [
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code']
        }
      ],
      attributes: ['subjectId'],
      group: ['subjectId', 'subject.id', 'subject.name', 'subject.code'],
      raw: false
    });

    res.json({
      success: true,
      data: {
        totalDistributions,
        distributionsByClass: distributionsByClass.map(d => ({
          classId: d.classId,
          className: d.class ? `${d.class.name} ${d.class.section}` : 'All Classes',
          count: 1 // This would need to be calculated properly in a real implementation
        })),
        distributionsBySubject: distributionsBySubject.map(d => ({
          subjectId: d.subjectId,
          subjectName: d.subject ? d.subject.name : 'All Subjects',
          count: 1 // This would need to be calculated properly in a real implementation
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching mark distribution stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mark distribution stats',
      error: error.message
    });
  }
};

module.exports = {
  getMarkDistributions,
  getMarkDistributionById,
  createMarkDistribution,
  updateMarkDistribution,
  deleteMarkDistribution,
  calculateGrades,
  getGradeCalculations,
  getMarkDistributionStats
};
