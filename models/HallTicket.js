const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HallTicket = sequelize.define('HallTicket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ticketNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  examId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Exam',
      key: 'id'
    }
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Student',
      key: 'id'
    }
  },
  examScheduleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'ExamSchedule',
      key: 'id'
    }
  },
  examDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: true
  },
  roomNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  seatNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(['generated', 'downloaded', 'printed', 'used', 'cancelled']),
    allowNull: false,
    defaultValue: 'generated'
  },
  generatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  downloadedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  printedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  generatedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  }
}, {
  tableName: 'HallTicket',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['ticketNumber']
    },
    {
      fields: ['examId']
    },
    {
      fields: ['studentId']
    },
    {
      fields: ['examScheduleId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['examDate']
    }
  ]
});

// Generate ticket number
HallTicket.beforeCreate(async (ticket) => {
  if (!ticket.ticketNumber) {
    const year = new Date().getFullYear();
    const count = await HallTicket.count({
      where: {
        generatedAt: {
          [sequelize.Sequelize.Op.gte]: new Date(`${year}-01-01`),
          [sequelize.Sequelize.Op.lt]: new Date(`${year + 1}-01-01`)
        }
      }
    });
    ticket.ticketNumber = `HT-${year}-${String(count + 1).padStart(6, '0')}`;
  }
});

module.exports = HallTicket;
