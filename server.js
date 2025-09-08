const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: './config.env' });

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: {
    status: 'error',
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/grades', require('./routes/grades'));
app.use('/api/fees', require('./routes/fees'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/affidavits', require('./routes/affidavits'));
app.use('/api/bulk-sms', require('./routes/bulkSMS'));
app.use('/api/bonafide-certificates', require('./routes/bonafideCertificates'));
app.use('/api/leaving-certificates', require('./routes/leavingCertificates'));
app.use('/api/classworks', require('./routes/classworks'));
app.use('/api/transport-fees', require('./routes/transportFees'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/mark-distributions', require('./routes/markDistributions'));
app.use('/api/attendance-reports', require('./routes/attendanceReports'));
app.use('/api/cheques', require('./routes/cheques'));
app.use('/api/transaction-logs', require('./routes/transactionLogs'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/events', require('./routes/events'));
app.use('/api/circulars', require('./routes/circulars'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/exam-schedules', require('./routes/examSchedules'));
app.use('/api/hall-tickets', require('./routes/hallTickets'));
app.use('/api/books', require('./routes/books'));

// New feature routes
app.use('/api/transport', require('./routes/transport'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/communication', require('./routes/communication'));
app.use('/api/health', require('./routes/health'));
app.use('/api/admission', require('./routes/admission'));
app.use('/api/lms', require('./routes/lms'));
app.use('/api/social', require('./routes/social'));
app.use('/api/transaction-reports', require('./routes/transactionReports'));
app.use('/api/user-management', require('./routes/userManagement'));
app.use('/api/role-permissions', require('./routes/rolePermissions'));
app.use('/api/class-teacher-assignments', require('./routes/classTeacherAssignments'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'School ERP API is running',
    timestamp: new Date().toISOString()
  });
});

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 School ERP Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
});

module.exports = app;
