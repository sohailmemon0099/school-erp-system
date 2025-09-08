const Timetable = require('../models/Timetable');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { Op } = require('sequelize');

// Get all timetable entries
const getAllTimetables = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, classId, teacherId, dayOfWeek } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (classId) {
      whereClause.classId = classId;
    }
    
    if (teacherId) {
      whereClause.teacherId = teacherId;
    }
    
    if (dayOfWeek) {
      whereClause.dayOfWeek = dayOfWeek;
    }

    const timetables = await Timetable.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['name', 'section']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['name', 'code']
        },
        {
          model: Teacher,
          as: 'teacher',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName']
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['firstName', 'lastName']
        }
      ],
      order: [
        ['dayOfWeek', 'ASC'],
        ['startTime', 'ASC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      status: 'success',
      data: {
        timetables: timetables.rows,
        totalCount: timetables.count,
        totalPages: Math.ceil(timetables.count / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    console.error('Error fetching timetables:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch timetables'
    });
  }
};

// Get timetable by ID
const getTimetableById = async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await Timetable.findByPk(id, {
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['name', 'section']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['name', 'code']
        },
        {
          model: Teacher,
          as: 'teacher',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName']
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    if (!timetable) {
      return res.status(404).json({
        status: 'error',
        message: 'Timetable entry not found'
      });
    }

    res.json({
      status: 'success',
      data: { timetable }
    });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch timetable'
    });
  }
};

// Get timetable by class
const getTimetableByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { academicYear = '2024-2025' } = req.query;

    const timetables = await Timetable.findAll({
      where: { 
        classId,
        academicYear,
        isActive: true
      },
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['name', 'section']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['name', 'code']
        },
        {
          model: Teacher,
          as: 'teacher',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName']
            }
          ]
        }
      ],
      order: [
        ['dayOfWeek', 'ASC'],
        ['startTime', 'ASC']
      ]
    });

    // Group by day of week
    const groupedTimetables = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    };

    timetables.forEach(entry => {
      groupedTimetables[entry.dayOfWeek].push(entry);
    });

    res.json({
      status: 'success',
      data: { 
        timetables: groupedTimetables,
        class: timetables[0]?.class || null
      }
    });
  } catch (error) {
    console.error('Error fetching class timetable:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch class timetable'
    });
  }
};

// Get timetable by teacher
const getTimetableByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { academicYear = '2024-2025' } = req.query;

    const timetables = await Timetable.findAll({
      where: { 
        teacherId,
        academicYear,
        isActive: true
      },
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['name', 'section']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['name', 'code']
        },
        {
          model: Teacher,
          as: 'teacher',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName']
            }
          ]
        }
      ],
      order: [
        ['dayOfWeek', 'ASC'],
        ['startTime', 'ASC']
      ]
    });

    // Group by day of week
    const groupedTimetables = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    };

    timetables.forEach(entry => {
      groupedTimetables[entry.dayOfWeek].push(entry);
    });

    res.json({
      status: 'success',
      data: { 
        timetables: groupedTimetables,
        teacher: timetables[0]?.teacher || null
      }
    });
  } catch (error) {
    console.error('Error fetching teacher timetable:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch teacher timetable'
    });
  }
};

// Create new timetable entry
const createTimetable = async (req, res) => {
  try {
    const {
      classId,
      subjectId,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
      roomNumber,
      academicYear,
      semester
    } = req.body;

    // Check for conflicts
    const conflict = await Timetable.findOne({
      where: {
        [Op.or]: [
          // Same class at same time
          {
            classId,
            dayOfWeek,
            startTime: { [Op.lt]: endTime },
            endTime: { [Op.gt]: startTime }
          },
          // Same teacher at same time
          {
            teacherId,
            dayOfWeek,
            startTime: { [Op.lt]: endTime },
            endTime: { [Op.gt]: startTime }
          }
        ],
        isActive: true
      }
    });

    if (conflict) {
      return res.status(400).json({
        status: 'error',
        message: 'Time slot conflict detected. Please choose a different time.'
      });
    }

    const timetable = await Timetable.create({
      classId,
      subjectId,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
      roomNumber,
      academicYear,
      semester,
      createdBy: req.user.id
    });

    const newTimetable = await Timetable.findByPk(timetable.id, {
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['name', 'section']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['name', 'code']
        },
        {
          model: Teacher,
          as: 'teacher',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Timetable entry created successfully',
      data: { timetable: newTimetable }
    });
  } catch (error) {
    console.error('Error creating timetable:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create timetable entry'
    });
  }
};

// Update timetable entry
const updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const timetable = await Timetable.findByPk(id);
    if (!timetable) {
      return res.status(404).json({
        status: 'error',
        message: 'Timetable entry not found'
      });
    }

    // Check for conflicts if time is being updated
    if (updateData.startTime || updateData.endTime || updateData.dayOfWeek) {
      const startTime = updateData.startTime || timetable.startTime;
      const endTime = updateData.endTime || timetable.endTime;
      const dayOfWeek = updateData.dayOfWeek || timetable.dayOfWeek;
      const classId = updateData.classId || timetable.classId;
      const teacherId = updateData.teacherId || timetable.teacherId;

      const conflict = await Timetable.findOne({
        where: {
          id: { [Op.ne]: id },
          [Op.or]: [
            // Same class at same time
            {
              classId,
              dayOfWeek,
              startTime: { [Op.lt]: endTime },
              endTime: { [Op.gt]: startTime }
            },
            // Same teacher at same time
            {
              teacherId,
              dayOfWeek,
              startTime: { [Op.lt]: endTime },
              endTime: { [Op.gt]: startTime }
            }
          ],
          isActive: true
        }
      });

      if (conflict) {
        return res.status(400).json({
          status: 'error',
          message: 'Time slot conflict detected. Please choose a different time.'
        });
      }
    }

    await timetable.update(updateData);

    const updatedTimetable = await Timetable.findByPk(id, {
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['name', 'section']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['name', 'code']
        },
        {
          model: Teacher,
          as: 'teacher',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName']
            }
          ]
        }
      ]
    });

    res.json({
      status: 'success',
      message: 'Timetable entry updated successfully',
      data: { timetable: updatedTimetable }
    });
  } catch (error) {
    console.error('Error updating timetable:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update timetable entry'
    });
  }
};

// Delete timetable entry
const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await Timetable.findByPk(id);
    if (!timetable) {
      return res.status(404).json({
        status: 'error',
        message: 'Timetable entry not found'
      });
    }

    await timetable.destroy();

    res.json({
      status: 'success',
      message: 'Timetable entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting timetable:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete timetable entry'
    });
  }
};

// Get available time slots for a class/teacher
const getAvailableSlots = async (req, res) => {
  try {
    const { classId, teacherId, dayOfWeek, academicYear = '2024-2025' } = req.query;

    if (!classId && !teacherId) {
      return res.status(400).json({
        status: 'error',
        message: 'Either classId or teacherId is required'
      });
    }

    const whereClause = {
      dayOfWeek,
      academicYear,
      isActive: true
    };

    if (classId) {
      whereClause.classId = classId;
    }

    if (teacherId) {
      whereClause.teacherId = teacherId;
    }

    const occupiedSlots = await Timetable.findAll({
      where: whereClause,
      attributes: ['startTime', 'endTime'],
      order: [['startTime', 'ASC']]
    });

    // Generate available slots (assuming 8 AM to 5 PM, 1-hour slots)
    const availableSlots = [];
    const startHour = 8;
    const endHour = 17;

    for (let hour = startHour; hour < endHour; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00:00`;

      const isOccupied = occupiedSlots.some(slot => {
        const slotStart = slot.startTime;
        const slotEnd = slot.endTime;
        return (startTime < slotEnd && endTime > slotStart);
      });

      if (!isOccupied) {
        availableSlots.push({
          startTime,
          endTime,
          display: `${hour}:00 - ${hour + 1}:00`
        });
      }
    }

    res.json({
      status: 'success',
      data: { availableSlots }
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch available slots'
    });
  }
};

module.exports = {
  getAllTimetables,
  getTimetableById,
  getTimetableByClass,
  getTimetableByTeacher,
  createTimetable,
  updateTimetable,
  deleteTimetable,
  getAvailableSlots
};
