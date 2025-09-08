const { body, param, query } = require('express-validator');

// Auth validation rules
const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'teacher', 'student', 'parent'])
    .withMessage('Role must be one of: admin, teacher, student, parent'),
  body('phone')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be one of: male, female, other')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be one of: male, female, other')
];

const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Student validation rules (for existing user)
const validateStudent = [
  body('userId')
    .isUUID()
    .withMessage('Valid user ID is required'),
  body('studentId')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Student ID must be between 3 and 20 characters'),
  body('admissionDate')
    .isISO8601()
    .withMessage('Valid admission date is required'),
  body('classId')
    .isUUID()
    .withMessage('Valid class ID is required'),
  body('parentName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Parent name must be between 2 and 100 characters'),
  body('parentPhone')
    .isLength({ min: 10, max: 15 })
    .withMessage('Parent phone must be between 10 and 15 characters'),
  body('parentEmail')
    .optional()
    .isEmail()
    .withMessage('Valid parent email is required')
];

// Student creation with user data validation
const validateStudentWithUser = [
  // User fields
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must not exceed 200 characters'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Valid date of birth is required'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be one of: male, female, other'),
  
  // Student fields
  body('studentId')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Student ID must be between 3 and 20 characters'),
  body('admissionDate')
    .isISO8601()
    .withMessage('Valid admission date is required'),
  body('classId')
    .isUUID()
    .withMessage('Valid class ID is required'),
  body('parentName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Parent name must be between 2 and 100 characters'),
  body('parentPhone')
    .isLength({ min: 10, max: 15 })
    .withMessage('Parent phone must be between 10 and 15 characters'),
  body('parentEmail')
    .optional()
    .isEmail()
    .withMessage('Valid parent email is required')
];

// Student update validation (without userId requirement)
const validateStudentUpdate = [
  body('studentId')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Student ID must be between 3 and 20 characters'),
  body('admissionDate')
    .optional()
    .isISO8601()
    .withMessage('Valid admission date is required'),
  body('classId')
    .optional()
    .isUUID()
    .withMessage('Valid class ID is required'),
  body('parentName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Parent name must be between 2 and 100 characters'),
  body('parentPhone')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('Parent phone must be between 10 and 15 characters'),
  body('parentEmail')
    .optional()
    .isEmail()
    .withMessage('Valid parent email is required')
];

// Teacher validation rules (for existing user)
const validateTeacher = [
  body('userId')
    .isUUID()
    .withMessage('Valid user ID is required'),
  body('employeeId')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Employee ID must be between 3 and 20 characters'),
  body('hireDate')
    .isISO8601()
    .withMessage('Valid hire date is required'),
  body('qualification')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Qualification must be between 2 and 200 characters'),
  body('specialization')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Specialization must be between 2 and 100 characters')
];

// Teacher creation with user data validation
const validateTeacherWithUser = [
  // User fields
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must not exceed 200 characters'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Valid date of birth is required'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be one of: male, female, other'),
  
  // Teacher fields
  body('employeeId')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Employee ID must be between 3 and 20 characters'),
  body('hireDate')
    .isISO8601()
    .withMessage('Valid hire date is required'),
  body('qualification')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Qualification must be between 2 and 200 characters'),
  body('specialization')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Specialization must be between 2 and 100 characters')
];

// Teacher update validation (without userId requirement)
const validateTeacherUpdate = [
  body('employeeId')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Employee ID must be between 3 and 20 characters'),
  body('hireDate')
    .optional()
    .isISO8601()
    .withMessage('Valid hire date is required'),
  body('qualification')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Qualification must be between 2 and 200 characters'),
  body('specialization')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Specialization must be between 2 and 100 characters')
];

// Class validation rules
const validateClass = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Class name must be between 1 and 50 characters'),
  body('section')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Section must be between 1 and 10 characters'),
  body('capacity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Capacity must be between 1 and 100'),
  body('academicYear')
    .trim()
    .isLength({ min: 4, max: 10 })
    .withMessage('Academic year must be between 4 and 10 characters')
];

// Subject validation rules
const validateSubject = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Subject name must be between 2 and 100 characters'),
  body('code')
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Subject code must be between 2 and 20 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('credits')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Credits must be between 1 and 10')
];

// Attendance validation rules
const validateAttendance = [
  body('studentId')
    .isUUID()
    .withMessage('Valid student ID is required'),
  body('classId')
    .isUUID()
    .withMessage('Valid class ID is required'),
  body('subjectId')
    .isUUID()
    .withMessage('Valid subject ID is required'),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required'),
  body('status')
    .isIn(['present', 'absent', 'late', 'excused'])
    .withMessage('Status must be one of: present, absent, late, excused')
];

// Grade validation rules
const validateGrade = [
  body('studentId')
    .isUUID()
    .withMessage('Valid student ID is required'),
  body('subjectId')
    .isUUID()
    .withMessage('Valid subject ID is required'),
  body('examType')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Exam type must be between 2 and 50 characters'),
  body('marks')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Marks must be between 0 and 100'),
  body('maxMarks')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Max marks must be between 1 and 1000')
];

// Fee validation rules
const validateFee = [
  body('studentId')
    .isUUID()
    .withMessage('Valid student ID is required'),
  body('feeType')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Fee type must be between 2 and 50 characters'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('dueDate')
    .isISO8601()
    .withMessage('Valid due date is required'),
  body('academicYear')
    .trim()
    .isLength({ min: 4, max: 10 })
    .withMessage('Academic year must be between 4 and 10 characters')
];

// UUID parameter validation
const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('Valid ID is required')
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Course validation rules
const validateCourse = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('courseCode')
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Course code must be between 2 and 20 characters'),
  body('category')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category must be between 2 and 100 characters'),
  body('level')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Level must be one of: beginner, intermediate, advanced'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer')
];

// Lesson validation rules
const validateLesson = [
  body('courseId')
    .isUUID()
    .withMessage('Valid course ID is required'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('lessonType')
    .isIn(['video', 'audio', 'document', 'text', 'quiz', 'assignment'])
    .withMessage('Lesson type must be one of: video, audio, document, text, quiz, assignment'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
  body('order')
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer')
];

// Quiz validation rules
const validateQuiz = [
  body('courseId')
    .isUUID()
    .withMessage('Valid course ID is required'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('timeLimit')
    .isInt({ min: 1 })
    .withMessage('Time limit must be a positive integer'),
  body('totalMarks')
    .isInt({ min: 1 })
    .withMessage('Total marks must be a positive integer'),
  body('passingMarks')
    .isInt({ min: 0 })
    .withMessage('Passing marks must be a non-negative integer')
];

// Quiz Question validation rules
const validateQuizQuestion = [
  body('quizId')
    .isUUID()
    .withMessage('Valid quiz ID is required'),
  body('question')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Question must be between 10 and 1000 characters'),
  body('questionType')
    .isIn(['multiple_choice', 'true_false', 'short_answer', 'essay'])
    .withMessage('Question type must be one of: multiple_choice, true_false, short_answer, essay'),
  body('correctAnswer')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Correct answer must be between 1 and 500 characters'),
  body('marks')
    .isInt({ min: 1 })
    .withMessage('Marks must be a positive integer'),
  body('order')
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer')
];

// Forum validation rules
const validateForum = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('category')
    .isIn(['general', 'academic', 'sports', 'events', 'announcements', 'discussions'])
    .withMessage('Category must be one of: general, academic, sports, events, announcements, discussions')
];

// Forum Post validation rules
const validateForumPost = [
  body('forumId')
    .isUUID()
    .withMessage('Valid forum ID is required'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),
  body('parentPostId')
    .optional()
    .isUUID()
    .withMessage('Valid parent post ID is required')
];

// Announcement validation rules
const validateAnnouncement = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Content must be between 10 and 2000 characters'),
  body('priority')
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  body('targetAudience')
    .isIn(['all', 'students', 'teachers', 'parents', 'staff'])
    .withMessage('Target audience must be one of: all, students, teachers, parents, staff'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid date')
];

// Event validation rules
const validateEvent = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('eventType')
    .isIn(['academic', 'sports', 'cultural', 'social', 'meeting', 'celebration'])
    .withMessage('Event type must be one of: academic, sports, cultural, social, meeting, celebration'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Location must not exceed 255 characters'),
  body('maxAttendees')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max attendees must be a positive integer')
];

// Transaction Report validation rules
const validateTransactionReport = [
  body('studentId')
    .isUUID()
    .withMessage('Valid student ID is required'),
  body('transactionType')
    .isIn(['fee_payment', 'transport_payment', 'library_fine', 'cafeteria_payment', 'other'])
    .withMessage('Transaction type must be one of: fee_payment, transport_payment, library_fine, cafeteria_payment, other'),
  body('amount')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Amount must be a valid decimal number'),
  body('paymentMode')
    .isIn(['cash', 'cheque', 'card', 'online', 'bank_transfer'])
    .withMessage('Payment mode must be one of: cash, cheque, card, online, bank_transfer'),
  body('transactionDate')
    .isISO8601()
    .withMessage('Transaction date must be a valid date'),
  body('receiptNumber')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Receipt number must be between 3 and 50 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'refunded'])
    .withMessage('Status must be one of: pending, completed, failed, refunded')
];

// User Management validation rules
const validateUserCreation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['admin', 'teacher', 'student', 'clark', 'parent', 'staff'])
    .withMessage('Role must be one of: admin, teacher, student, clark, parent, staff'),
  body('phone')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be one of: male, female, other'),
  body('dateOfBirth')
    .optional(),
  // Teacher-specific validation
  body('employeeId')
    .optional(),
  body('specialization')
    .optional(),
  // Student-specific validation
  body('studentId')
    .optional(),
  body('admissionDate')
    .optional(),
  body('classId')
    .optional(),
  body('parentName')
    .optional(),
  body('parentPhone')
    .optional(),
  body('parentEmail')
    .optional()
];

const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required'),
  body('role')
    .optional()
    .isIn(['admin', 'teacher', 'student', 'clark', 'parent', 'staff'])
    .withMessage('Role must be one of: admin, teacher, student, clark, parent, staff'),
  body('phone')
    .optional(),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be one of: male, female, other'),
  body('dateOfBirth')
    .optional(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  // Teacher-specific validation
  body('employeeId')
    .optional(),
  body('specialization')
    .optional(),
  // Student-specific validation
  body('studentId')
    .optional(),
  body('admissionDate')
    .optional(),
  body('classId')
    .optional(),
  body('parentName')
    .optional(),
  body('parentPhone')
    .optional(),
  body('parentEmail')
    .optional()
];

const validatePasswordChange = [
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const validateBulkUserCreation = [
  body('users')
    .isArray({ min: 1 })
    .withMessage('Users must be an array with at least one user'),
  body('users.*.firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('users.*.lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('users.*.email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('users.*.password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('users.*.role')
    .isIn(['admin', 'teacher', 'student', 'clark', 'parent', 'staff'])
    .withMessage('Role must be one of: admin, teacher, student, clark, parent, staff')
];

// Role Permission validation rules
const validateRolePermission = [
  body('role')
    .isIn(['admin', 'teacher', 'student', 'clark', 'parent', 'staff'])
    .withMessage('Role must be one of: admin, teacher, student, clark, parent, staff'),
  body('permissions')
    .isObject()
    .withMessage('Permissions must be an object'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// Exam validation rules
const validateExam = [
  body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Exam name must be between 2 and 255 characters'),
  body('examType').isIn(['unit_test', 'mid_term', 'final_exam', 'quarterly', 'half_yearly', 'annual', 'competitive', 'entrance', 'other']).withMessage('Invalid exam type'),
  body('academicYear').trim().isLength({ min: 4, max: 20 }).withMessage('Academic year must be between 4 and 20 characters'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required')
];

const validateExamUpdate = [
  body('name').optional().trim().isLength({ min: 2, max: 255 }).withMessage('Exam name must be between 2 and 255 characters'),
  body('examType').optional().isIn(['unit_test', 'mid_term', 'final_exam', 'quarterly', 'half_yearly', 'annual', 'competitive', 'entrance', 'other']).withMessage('Invalid exam type'),
  body('academicYear').optional().trim().isLength({ min: 4, max: 20 }).withMessage('Academic year must be between 4 and 20 characters'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required')
];

// Vehicle validation rules
const validateVehicle = [
  body('vehicleNumber').trim().isLength({ min: 5, max: 20 }).withMessage('Vehicle number must be between 5 and 20 characters'),
  body('vehicleType').isIn(['bus', 'van', 'car', 'other']).withMessage('Vehicle type must be one of: bus, van, car, other'),
  body('driverName').trim().isLength({ min: 2, max: 100 }).withMessage('Driver name must be between 2 and 100 characters'),
  body('driverPhone').trim().isMobilePhone().withMessage('Valid driver phone number is required'),
  body('capacity').isInt({ min: 1, max: 100 }).withMessage('Capacity must be between 1 and 100'),
  body('route').trim().isLength({ min: 2, max: 255 }).withMessage('Route must be between 2 and 255 characters'),
  body('status').isIn(['active', 'inactive', 'maintenance']).withMessage('Status must be one of: active, inactive, maintenance')
];

// Transport Fee validation rules
const validateTransportFee = [
  body('studentId').isUUID().withMessage('Student ID must be a valid UUID'),
  body('vehicleId').optional().isUUID().withMessage('Vehicle ID must be a valid UUID'),
  body('route').trim().isLength({ min: 2, max: 255 }).withMessage('Route must be between 2 and 255 characters'),
  body('pickupPoint').trim().isLength({ min: 2, max: 255 }).withMessage('Pickup point must be between 2 and 255 characters'),
  body('dropPoint').trim().isLength({ min: 2, max: 255 }).withMessage('Drop point must be between 2 and 255 characters'),
  body('monthlyFee').isDecimal({ decimal_digits: '0,2' }).withMessage('Monthly fee must be a valid decimal'),
  body('academicYear').trim().isLength({ min: 4, max: 20 }).withMessage('Academic year must be between 4 and 20 characters')
];

// Transport Payment validation rules
const validateTransportPayment = [
  body('transportFeeId').isUUID().withMessage('Transport Fee ID must be a valid UUID'),
  body('studentId').isUUID().withMessage('Student ID must be a valid UUID'),
  body('amount').isDecimal({ decimal_digits: '0,2' }).withMessage('Amount must be a valid decimal'),
  body('paymentDate').isISO8601().withMessage('Valid payment date is required'),
  body('paymentMethod').isIn(['cash', 'cheque', 'bank_transfer', 'online', 'card']).withMessage('Payment method must be one of: cash, cheque, bank_transfer, online, card')
];

// Bonafide Certificate validation rules
const validateBonafideCertificate = [
  body('studentId').isUUID().withMessage('Student ID must be a valid UUID'),
  body('purpose').isIn(['scholarship', 'passport', 'visa', 'bank_account', 'employment', 'admission', 'other']).withMessage('Purpose must be one of: scholarship, passport, visa, bank_account, employment, admission, other'),
  body('purposeDescription').trim().isLength({ min: 10, max: 500 }).withMessage('Purpose description must be between 10 and 500 characters'),
  body('issuedDate').isISO8601().withMessage('Valid issued date is required'),
  body('validUntil').isISO8601().withMessage('Valid until date is required'),
  body('issuedBy').isUUID().withMessage('Issued by must be a valid UUID')
];

// Leaving Certificate validation rules
const validateLeavingCertificate = [
  body('studentId').isUUID().withMessage('Student ID must be a valid UUID'),
  body('leavingDate').isISO8601().withMessage('Valid leaving date is required'),
  body('reasonForLeaving').isIn(['transfer', 'completion', 'withdrawal', 'expulsion', 'migration', 'other']).withMessage('Reason for leaving must be one of: transfer, completion, withdrawal, expulsion, migration, other'),
  body('reasonDescription').trim().isLength({ min: 10, max: 500 }).withMessage('Reason description must be between 10 and 500 characters'),
  body('lastClassAttended').trim().isLength({ min: 2, max: 100 }).withMessage('Last class attended must be between 2 and 100 characters'),
  body('issuedBy').isUUID().withMessage('Issued by must be a valid UUID')
];

// Affidavit validation rules
const validateAffidavit = [
  body('studentId').isUUID().withMessage('Student ID must be a valid UUID'),
  body('type').isIn(['birth_certificate', 'address_proof', 'income_certificate', 'caste_certificate', 'other']).withMessage('Type must be one of: birth_certificate, address_proof, income_certificate, caste_certificate, other'),
  body('documentNumber').trim().isLength({ min: 5, max: 100 }).withMessage('Document number must be between 5 and 100 characters'),
  body('issuedDate').isISO8601().withMessage('Valid issued date is required'),
  body('validUntil').optional().isISO8601().withMessage('Valid until date must be a valid date')
];

// Bulk SMS validation rules
const validateBulkSMS = [
  body('title').trim().isLength({ min: 5, max: 255 }).withMessage('Title must be between 5 and 255 characters'),
  body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters'),
  body('recipientType').isIn(['all_students', 'all_teachers', 'all_parents', 'specific_class', 'specific_students', 'custom_numbers']).withMessage('Recipient type must be one of: all_students, all_teachers, all_parents, specific_class, specific_students, custom_numbers'),
  body('recipientIds').isArray().withMessage('Recipient IDs must be an array'),
  body('scheduledAt').optional().isISO8601().withMessage('Scheduled date must be a valid date')
];

// Message validation rules
const validateMessage = [
  body('subject').trim().isLength({ min: 5, max: 255 }).withMessage('Subject must be between 5 and 255 characters'),
  body('content').trim().isLength({ min: 10, max: 2000 }).withMessage('Content must be between 10 and 2000 characters'),
  body('messageType').isIn(['announcement', 'reminder', 'notification', 'personal']).withMessage('Message type must be one of: announcement, reminder, notification, personal'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Priority must be one of: low, medium, high, urgent'),
  body('senderId').isUUID().withMessage('Sender ID must be a valid UUID'),
  body('recipientId').isUUID().withMessage('Recipient ID must be a valid UUID')
];

// Notification validation rules
const validateNotification = [
  body('title').trim().isLength({ min: 5, max: 255 }).withMessage('Title must be between 5 and 255 characters'),
  body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters'),
  body('type').isIn(['info', 'warning', 'error', 'success']).withMessage('Type must be one of: info, warning, error, success'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Priority must be one of: low, medium, high, urgent'),
  body('targetType').isIn(['all', 'specific_users', 'role_based']).withMessage('Target type must be one of: all, specific_users, role_based'),
  body('targetRole').optional().isIn(['admin', 'teacher', 'student', 'parent']).withMessage('Target role must be one of: admin, teacher, student, parent')
];

// Inquiry validation rules
const validateInquiry = [
  body('studentName').trim().isLength({ min: 2, max: 100 }).withMessage('Student name must be between 2 and 100 characters'),
  body('parentName').trim().isLength({ min: 2, max: 100 }).withMessage('Parent name must be between 2 and 100 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().isMobilePhone().withMessage('Valid phone number is required'),
  body('preferredClass').trim().isLength({ min: 2, max: 50 }).withMessage('Preferred class must be between 2 and 50 characters'),
  body('inquirySource').isIn(['website', 'referral', 'advertisement', 'walk_in', 'phone', 'other']).withMessage('Inquiry source must be one of: website, referral, advertisement, walk_in, phone, other'),
  body('status').isIn(['new', 'contacted', 'qualified', 'application', 'admitted', 'rejected']).withMessage('Status must be one of: new, contacted, qualified, application, admitted, rejected')
];


const validateAffidavitUpdate = [
  body('type')
    .optional()
    .isIn(['birth_certificate', 'address_proof', 'income_certificate', 'caste_certificate', 'medical_certificate', 'other'])
    .withMessage('Type must be one of: birth_certificate, address_proof, income_certificate, caste_certificate, medical_certificate, other'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('issuedBy')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Issued by must be between 2 and 100 characters'),
  body('issuedDate')
    .optional()
    .isISO8601()
    .withMessage('Valid issued date is required'),
  body('validUntil')
    .optional()
    .isISO8601()
    .withMessage('Valid until date must be in ISO format'),
  body('documentNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Document number must not exceed 50 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'verified', 'rejected', 'expired'])
    .withMessage('Status must be one of: pending, verified, rejected, expired'),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Remarks must not exceed 500 characters')
];


const validateBulkSMSUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('message')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1600 })
    .withMessage('Message must be between 10 and 1600 characters'),
  body('recipientType')
    .optional()
    .isIn(['all_students', 'all_teachers', 'all_parents', 'specific_class', 'specific_students', 'custom_numbers'])
    .withMessage('Recipient type must be one of: all_students, all_teachers, all_parents, specific_class, specific_students, custom_numbers'),
  body('classId')
    .optional()
    .isUUID()
    .withMessage('Valid class ID is required when recipient type is specific_class'),
  body('recipientIds')
    .optional()
    .isArray()
    .withMessage('Recipient IDs must be an array'),
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be in ISO format'),
  body('status')
    .optional()
    .isIn(['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'])
    .withMessage('Status must be one of: draft, scheduled, sending, sent, failed, cancelled')
];

// Timetable validation rules
const validateTimetable = [
  body('classId')
    .isUUID()
    .withMessage('Valid class ID is required'),
  body('subjectId')
    .isUUID()
    .withMessage('Valid subject ID is required'),
  body('teacherId')
    .isUUID()
    .withMessage('Valid teacher ID is required'),
  body('dayOfWeek')
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Day of week must be one of: monday, tuesday, wednesday, thursday, friday, saturday, sunday'),
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM:SS format'),
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM:SS format'),
  body('roomNumber')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Room number must not exceed 20 characters'),
  body('academicYear')
    .optional()
    .trim()
    .isLength({ min: 9, max: 9 })
    .withMessage('Academic year must be in YYYY-YYYY format'),
  body('semester')
    .optional()
    .isIn(['1', '2', '3', '4', '5', '6', '7', '8'])
    .withMessage('Semester must be one of: 1, 2, 3, 4, 5, 6, 7, 8')
];

const validateTimetableUpdate = [
  body('classId')
    .optional()
    .isUUID()
    .withMessage('Valid class ID is required'),
  body('subjectId')
    .optional()
    .isUUID()
    .withMessage('Valid subject ID is required'),
  body('teacherId')
    .optional()
    .isUUID()
    .withMessage('Valid teacher ID is required'),
  body('dayOfWeek')
    .optional()
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Day of week must be one of: monday, tuesday, wednesday, thursday, friday, saturday, sunday'),
  body('startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM:SS format'),
  body('endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM:SS format'),
  body('roomNumber')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Room number must not exceed 20 characters'),
  body('academicYear')
    .optional()
    .trim()
    .isLength({ min: 9, max: 9 })
    .withMessage('Academic year must be in YYYY-YYYY format'),
  body('semester')
    .optional()
    .isIn(['1', '2', '3', '4', '5', '6', '7', '8'])
    .withMessage('Semester must be one of: 1, 2, 3, 4, 5, 6, 7, 8')
];

// Inquiry validation rules

// Inquiry update validation (all fields optional)
const validateInquiryUpdate = [
  body('studentFirstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Student first name must be between 2 and 50 characters'),
  body('studentLastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Student last name must be between 2 and 50 characters'),
  body('studentDateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Valid student date of birth is required'),
  body('studentGender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Student gender must be one of: male, female, other'),
  body('parentFirstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Parent first name must be between 2 and 50 characters'),
  body('parentLastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Parent last name must be between 2 and 50 characters'),
  body('parentPhone')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('Parent phone must be between 10 and 15 characters'),
  body('parentEmail')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Valid parent email is required'),
  body('desiredClass')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Desired class is required'),
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'follow-up', 'interested', 'not-interested', 'admitted', 'cancelled'])
    .withMessage('Invalid status')
];

// Bonafide Certificate validation rules
const validateBonafideCertificateUpdate = [
  body('purpose')
    .optional()
    .isIn(['scholarship', 'passport', 'visa', 'bank_account', 'employment', 'admission', 'other'])
    .withMessage('Purpose must be one of: scholarship, passport, visa, bank_account, employment, admission, other'),
  body('purposeDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Purpose description must not exceed 500 characters'),
  body('issuedDate')
    .optional()
    .isISO8601()
    .withMessage('Valid issued date is required'),
  body('validUntil')
    .optional()
    .isISO8601()
    .withMessage('Valid until date must be in ISO format'),
  body('status')
    .optional()
    .isIn(['draft', 'issued', 'cancelled', 'expired'])
    .withMessage('Status must be one of: draft, issued, cancelled, expired'),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Remarks must not exceed 1000 characters')
];

// Leaving Certificate validation rules
const validateLeavingCertificateUpdate = [
  body('leavingDate')
    .optional()
    .isISO8601()
    .withMessage('Valid leaving date is required'),
  body('reasonForLeaving')
    .optional()
    .isIn(['transfer', 'completion', 'withdrawal', 'expulsion', 'migration', 'other'])
    .withMessage('Reason for leaving must be one of: transfer, completion, withdrawal, expulsion, migration, other'),
  body('reasonDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason description must not exceed 500 characters'),
  body('lastClassAttended')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last class attended must not exceed 50 characters'),
  body('academicYear')
    .optional()
    .trim()
    .isLength({ min: 9, max: 9 })
    .withMessage('Academic year must be in YYYY-YYYY format'),
  body('conduct')
    .optional()
    .isIn(['excellent', 'very_good', 'good', 'satisfactory', 'unsatisfactory'])
    .withMessage('Conduct must be one of: excellent, very_good, good, satisfactory, unsatisfactory'),
  body('attendancePercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Attendance percentage must be between 0 and 100'),
  body('feesPaid')
    .optional()
    .isBoolean()
    .withMessage('Fees paid must be a boolean value'),
  body('libraryBooksReturned')
    .optional()
    .isBoolean()
    .withMessage('Library books returned must be a boolean value'),
  body('noDuesCertificate')
    .optional()
    .isBoolean()
    .withMessage('No dues certificate must be a boolean value'),
  body('status')
    .optional()
    .isIn(['draft', 'issued', 'cancelled'])
    .withMessage('Status must be one of: draft, issued, cancelled'),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Remarks must not exceed 1000 characters')
];

// Classwork validation rules
const validateClasswork = [
  body('classId')
    .isUUID()
    .withMessage('Valid class ID is required'),
  body('subjectId')
    .isUUID()
    .withMessage('Valid subject ID is required'),
  body('teacherId')
    .isUUID()
    .withMessage('Valid teacher ID is required'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('type')
    .isIn(['assignment', 'project', 'homework', 'quiz', 'test', 'presentation', 'other'])
    .withMessage('Type must be one of: assignment, project, homework, quiz, test, presentation, other'),
  body('dueDate')
    .isISO8601()
    .withMessage('Valid due date is required'),
  body('maxMarks')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Max marks must be between 0 and 1000'),
  body('instructions')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Instructions must not exceed 2000 characters'),
  body('academicYear')
    .optional()
    .trim()
    .isLength({ min: 9, max: 9 })
    .withMessage('Academic year must be in YYYY-YYYY format'),
  body('semester')
    .optional()
    .isIn(['1', '2', '3', '4', '5', '6', '7', '8'])
    .withMessage('Semester must be between 1 and 8')
];

const validateClassworkUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('type')
    .optional()
    .isIn(['assignment', 'project', 'homework', 'quiz', 'test', 'presentation', 'other'])
    .withMessage('Type must be one of: assignment, project, homework, quiz, test, presentation, other'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Valid due date is required'),
  body('maxMarks')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Max marks must be between 0 and 1000'),
  body('instructions')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Instructions must not exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'closed', 'graded'])
    .withMessage('Status must be one of: draft, published, closed, graded'),
  body('academicYear')
    .optional()
    .trim()
    .isLength({ min: 9, max: 9 })
    .withMessage('Academic year must be in YYYY-YYYY format'),
  body('semester')
    .optional()
    .isIn(['1', '2', '3', '4', '5', '6', '7', '8'])
    .withMessage('Semester must be between 1 and 8')
];

const validateSubmission = [
  body('submissionText')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Submission text must not exceed 5000 characters')
];

const validateGrading = [
  body('marksObtained')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Marks obtained must be between 0 and 1000'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Feedback must not exceed 1000 characters'),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Remarks must not exceed 500 characters')
];

// Transport Fee validation rules
const validateTransportFeeUpdate = [
  body('vehicleId')
    .optional()
    .isUUID()
    .withMessage('Valid vehicle ID is required'),
  body('route')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Route must be between 3 and 200 characters'),
  body('pickupPoint')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Pickup point must be between 3 and 200 characters'),
  body('dropPoint')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Drop point must be between 3 and 200 characters'),
  body('distance')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Distance must be between 0 and 1000 km'),
  body('monthlyFee')
    .optional()
    .isFloat({ min: 0, max: 100000 })
    .withMessage('Monthly fee must be between 0 and 100000'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended', 'cancelled'])
    .withMessage('Status must be one of: active, inactive, suspended, cancelled'),
  body('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'overdue', 'partial'])
    .withMessage('Payment status must be one of: pending, paid, overdue, partial'),
  body('academicYear')
    .optional()
    .trim()
    .isLength({ min: 9, max: 9 })
    .withMessage('Academic year must be in YYYY-YYYY format'),
  body('semester')
    .optional()
    .isIn(['1', '2', '3', '4', '5', '6', '7', '8'])
    .withMessage('Semester must be between 1 and 8'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required'),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Remarks must not exceed 1000 characters')
];


const validateExamSchedule = [
  body('examId')
    .isUUID()
    .withMessage('Exam ID must be a valid UUID'),
  body('subjectId')
    .isUUID()
    .withMessage('Subject ID must be a valid UUID'),
  body('classId')
    .isUUID()
    .withMessage('Class ID must be a valid UUID'),
  body('examDate')
    .isISO8601()
    .withMessage('Exam date must be a valid date'),
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  body('duration')
    .isInt({ min: 1, max: 480 })
    .withMessage('Duration must be between 1 and 480 minutes'),
  body('maxMarks')
    .optional()
    .isFloat({ min: 1, max: 1000 })
    .withMessage('Max marks must be between 1 and 1000'),
  body('passingMarks')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Passing marks must be between 0 and 1000'),
  body('venue')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Venue must not exceed 255 characters'),
  body('roomNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Room number must not exceed 50 characters'),
  body('invigilatorId')
    .optional()
    .isUUID()
    .withMessage('Invigilator ID must be a valid UUID')
];

// Mark Distribution validation rules
const validateMarkDistribution = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('classId')
    .isUUID()
    .withMessage('Class ID must be a valid UUID'),
  body('subjectId')
    .optional()
    .isUUID()
    .withMessage('Subject ID must be a valid UUID'),
  body('academicYear')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Academic year must be between 4 and 20 characters'),
  body('semester')
    .optional()
    .isIn(['1', '2', '3', '4', '5', '6', '7', '8'])
    .withMessage('Semester must be between 1 and 8'),
  body('theoryMarks')
    .isInt({ min: 0, max: 1000 })
    .withMessage('Theory marks must be between 0 and 1000'),
  body('practicalMarks')
    .isInt({ min: 0, max: 1000 })
    .withMessage('Practical marks must be between 0 and 1000'),
  body('internalMarks')
    .isInt({ min: 0, max: 1000 })
    .withMessage('Internal marks must be between 0 and 1000'),
  body('projectMarks')
    .isInt({ min: 0, max: 1000 })
    .withMessage('Project marks must be between 0 and 1000'),
  body('assignmentMarks')
    .isInt({ min: 0, max: 1000 })
    .withMessage('Assignment marks must be between 0 and 1000'),
  body('attendanceMarks')
    .isInt({ min: 0, max: 1000 })
    .withMessage('Attendance marks must be between 0 and 1000'),
  body('totalMarks')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Total marks must be between 1 and 1000'),
  body('gradeSystem')
    .optional()
    .isIn(['percentage', 'absolute', 'relative'])
    .withMessage('Grade system must be one of: percentage, absolute, relative'),
  body('passingPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Passing percentage must be between 0 and 100'),
  body('theoryWeightage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Theory weightage must be between 0 and 100'),
  body('practicalWeightage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Practical weightage must be between 0 and 100'),
  body('internalWeightage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Internal weightage must be between 0 and 100'),
  body('projectWeightage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Project weightage must be between 0 and 100'),
  body('assignmentWeightage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Assignment weightage must be between 0 and 100'),
  body('attendanceWeightage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Attendance weightage must be between 0 and 100'),
  body('allowGraceMarks')
    .optional()
    .isBoolean()
    .withMessage('Allow grace marks must be a boolean value'),
  body('graceMarksLimit')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Grace marks limit must be between 0 and 50'),
  body('roundingMethod')
    .optional()
    .isIn(['round', 'ceil', 'floor', 'truncate'])
    .withMessage('Rounding method must be one of: round, ceil, floor, truncate')
];

const validateMarkDistributionUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('academicYear')
    .optional()
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Academic year must be between 4 and 20 characters'),
  body('semester')
    .optional()
    .isIn(['1', '2', '3', '4', '5', '6', '7', '8'])
    .withMessage('Semester must be between 1 and 8'),
  body('theoryMarks')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Theory marks must be between 0 and 1000'),
  body('practicalMarks')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Practical marks must be between 0 and 1000'),
  body('internalMarks')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Internal marks must be between 0 and 1000'),
  body('projectMarks')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Project marks must be between 0 and 1000'),
  body('assignmentMarks')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Assignment marks must be between 0 and 1000'),
  body('attendanceMarks')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Attendance marks must be between 0 and 1000'),
  body('totalMarks')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Total marks must be between 1 and 1000'),
  body('gradeSystem')
    .optional()
    .isIn(['percentage', 'absolute', 'relative'])
    .withMessage('Grade system must be one of: percentage, absolute, relative'),
  body('passingPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Passing percentage must be between 0 and 100'),
  body('theoryWeightage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Theory weightage must be between 0 and 100'),
  body('practicalWeightage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Practical weightage must be between 0 and 100'),
  body('internalWeightage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Internal weightage must be between 0 and 100'),
  body('projectWeightage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Project weightage must be between 0 and 100'),
  body('assignmentWeightage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Assignment weightage must be between 0 and 100'),
  body('attendanceWeightage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Attendance weightage must be between 0 and 100'),
  body('allowGraceMarks')
    .optional()
    .isBoolean()
    .withMessage('Allow grace marks must be a boolean value'),
  body('graceMarksLimit')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Grace marks limit must be between 0 and 50'),
  body('roundingMethod')
    .optional()
    .isIn(['round', 'ceil', 'floor', 'truncate'])
    .withMessage('Rounding method must be one of: round, ceil, floor, truncate')
];

const validateGradeCalculation = [
  body('classId')
    .isUUID()
    .withMessage('Class ID must be a valid UUID'),
  body('subjectId')
    .optional()
    .isUUID()
    .withMessage('Subject ID must be a valid UUID'),
  body('academicYear')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Academic year must be between 4 and 20 characters'),
  body('semester')
    .optional()
    .isIn(['1', '2', '3', '4', '5', '6', '7', '8'])
    .withMessage('Semester must be between 1 and 8'),
  body('studentIds')
    .optional()
    .isArray()
    .withMessage('Student IDs must be an array'),
  body('studentIds.*')
    .optional()
    .isUUID()
    .withMessage('Each student ID must be a valid UUID')
];

// Attendance Report validation rules
const validateAttendanceReport = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('reportType')
    .isIn(['monthly', 'quarterly', 'yearly', 'custom', 'class_wise', 'student_wise', 'teacher_wise'])
    .withMessage('Report type must be one of: monthly, quarterly, yearly, custom, class_wise, student_wise, teacher_wise'),
  body('academicYear')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Academic year must be between 4 and 20 characters'),
  body('startDate')
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('endDate')
    .isISO8601()
    .withMessage('Valid end date is required'),
  body('classId')
    .optional()
    .isUUID()
    .withMessage('Class ID must be a valid UUID'),
  body('studentId')
    .optional()
    .isUUID()
    .withMessage('Student ID must be a valid UUID'),
  body('teacherId')
    .optional()
    .isUUID()
    .withMessage('Teacher ID must be a valid UUID'),
  body('filters')
    .optional()
    .isObject()
    .withMessage('Filters must be an object')
];

// Cheque validation rules
const validateCheque = [
  body('chequeNumber')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Cheque number must be between 1 and 50 characters'),
  body('bankName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Bank name must be between 2 and 100 characters'),
  body('branchName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Branch name must be between 2 and 100 characters'),
  body('accountNumber')
    .trim()
    .isLength({ min: 5, max: 30 })
    .withMessage('Account number must be between 5 and 30 characters'),
  body('accountHolderName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Account holder name must be between 2 and 100 characters'),
  body('amount')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Amount must be a valid decimal number'),
  body('issueDate')
    .isISO8601()
    .withMessage('Valid issue date is required'),
  body('dueDate')
    .isISO8601()
    .withMessage('Valid due date is required'),
  body('paymentType')
    .isIn(['fee_payment', 'transport_payment', 'other'])
    .withMessage('Payment type must be one of: fee_payment, transport_payment, other'),
  body('studentId')
    .optional()
    .isUUID()
    .withMessage('Student ID must be a valid UUID'),
  body('academicYear')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Academic year must be between 4 and 20 characters'),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Remarks must not exceed 1000 characters')
];

// Transaction Log validation rules
const validateTransactionLog = [
  body('transactionType')
    .isIn(['fee_payment', 'transport_payment', 'refund', 'adjustment', 'cheque_cleared', 'cheque_bounced', 'other'])
    .withMessage('Transaction type must be one of: fee_payment, transport_payment, refund, adjustment, cheque_cleared, cheque_bounced, other'),
  body('paymentMethod')
    .isIn(['cash', 'cheque', 'online', 'card', 'bank_transfer', 'upi'])
    .withMessage('Payment method must be one of: cash, cheque, online, card, bank_transfer, upi'),
  body('amount')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Amount must be a valid decimal number'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters'),
  body('studentId')
    .optional()
    .isUUID()
    .withMessage('Student ID must be a valid UUID'),
  body('academicYear')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Academic year must be between 4 and 20 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('referenceNumber')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Reference number must not exceed 100 characters')
];

// Notice validation rules
const validateNotice = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  body('type')
    .isIn(['notice', 'circular', 'announcement', 'event', 'holiday', 'exam_notice', 'fee_notice', 'other'])
    .withMessage('Type must be one of: notice, circular, announcement, event, holiday, exam_notice, fee_notice, other'),
  body('priority')
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  body('targetAudience')
    .isIn(['all', 'students', 'teachers', 'parents', 'staff', 'specific_class', 'specific_student'])
    .withMessage('Target audience must be one of: all, students, teachers, parents, staff, specific_class, specific_student'),
  body('classId')
    .optional()
    .isUUID()
    .withMessage('Class ID must be a valid UUID'),
  body('studentId')
    .optional()
    .isUUID()
    .withMessage('Student ID must be a valid UUID'),
  body('academicYear')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Academic year must be between 4 and 20 characters'),
  body('publishDate')
    .optional()
    .isISO8601()
    .withMessage('Valid publish date is required'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Valid expiry date is required')
];


// Circular validation rules
const validateCircular = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  body('circularType')
    .isIn(['administrative', 'academic', 'disciplinary', 'policy', 'procedure', 'announcement', 'reminder', 'update'])
    .withMessage('Circular type must be one of: administrative, academic, disciplinary, policy, procedure, announcement, reminder, update'),
  body('priority')
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  body('targetAudience')
    .isIn(['all', 'students', 'teachers', 'parents', 'staff', 'specific_class', 'specific_student'])
    .withMessage('Target audience must be one of: all, students, teachers, parents, staff, specific_class, specific_student'),
  body('classId')
    .optional()
    .isUUID()
    .withMessage('Class ID must be a valid UUID'),
  body('studentId')
    .optional()
    .isUUID()
    .withMessage('Student ID must be a valid UUID'),
  body('academicYear')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Academic year must be between 4 and 20 characters'),
  body('publishDate')
    .optional()
    .isISO8601()
    .withMessage('Valid publish date is required'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Valid expiry date is required'),
  body('effectiveDate')
    .optional()
    .isISO8601()
    .withMessage('Valid effective date is required'),
  body('acknowledgmentDeadline')
    .optional()
    .isISO8601()
    .withMessage('Valid acknowledgment deadline is required')
];

// Hall Ticket validation rules
const validateHallTicket = [
  body('studentId')
    .isUUID()
    .withMessage('Student ID must be a valid UUID'),
  body('examId')
    .isUUID()
    .withMessage('Exam ID must be a valid UUID'),
  body('examScheduleId')
    .optional()
    .isUUID()
    .withMessage('Exam Schedule ID must be a valid UUID'),
  body('classId')
    .isUUID()
    .withMessage('Class ID must be a valid UUID'),
  body('ticketNumber')
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('Ticket number must be between 5 and 50 characters'),
  body('status')
    .isIn(['generated', 'printed', 'distributed', 'used', 'cancelled'])
    .withMessage('Status must be one of: generated, printed, distributed, used, cancelled')
];

// Book validation rules
const validateBook = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Title must be between 2 and 255 characters'),
  body('author')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Author must be between 2 and 255 characters'),
  body('isbn')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('ISBN must be between 10 and 20 characters'),
  body('category')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category must be between 2 and 100 characters'),
  body('publisher')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Publisher must be between 2 and 255 characters'),
  body('publicationYear')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Publication year must be a valid year'),
  body('totalCopies')
    .isInt({ min: 1 })
    .withMessage('Total copies must be at least 1'),
  body('availableCopies')
    .isInt({ min: 0 })
    .withMessage('Available copies cannot be negative'),
  body('status')
    .isIn(['available', 'unavailable', 'damaged', 'lost'])
    .withMessage('Status must be one of: available, unavailable, damaged, lost')
];

// Book Loan validation rules
const validateBookLoan = [
  body('bookId')
    .isUUID()
    .withMessage('Book ID must be a valid UUID'),
  body('studentId')
    .isUUID()
    .withMessage('Student ID must be a valid UUID'),
  body('dueDate')
    .isISO8601()
    .withMessage('Valid due date is required'),
  body('issuedBy')
    .isUUID()
    .withMessage('Issued by must be a valid UUID')
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateChangePassword,
  validateStudent,
  validateStudentWithUser,
  validateStudentUpdate,
  validateTeacher,
  validateTeacherWithUser,
  validateTeacherUpdate,
  validateClass,
  validateSubject,
  validateAttendance,
  validateGrade,
  validateFee,
  validateInquiry,
  validateInquiryUpdate,
  validateAffidavit,
  validateAffidavitUpdate,
  validateBulkSMS,
  validateBulkSMSUpdate,
  validateTimetable,
  validateTimetableUpdate,
  validateBonafideCertificate,
  validateBonafideCertificateUpdate,
  validateLeavingCertificate,
  validateLeavingCertificateUpdate,
  validateClasswork,
  validateClassworkUpdate,
  validateSubmission,
  validateGrading,
  validateTransportFee,
  validateTransportFeeUpdate,
  validateTransportPayment,
  validateExam,
  validateExamUpdate,
  validateExamSchedule,
  validateCourse,
  validateLesson,
  validateQuiz,
  validateQuizQuestion,
  validateForum,
  validateForumPost,
  validateAnnouncement,
  validateEvent,
  validateTransactionReport,
  validateUserCreation,
  validateUserUpdate,
  validatePasswordChange,
  validateBulkUserCreation,
  validateRolePermission,
  validateMarkDistribution,
  validateMarkDistributionUpdate,
  validateGradeCalculation,
  validateAttendanceReport,
  validateCheque,
  validateTransactionLog,
  validateNotice,
  validateEvent,
  validateCircular,
  validateHallTicket,
  validateBook,
  validateBookLoan,
  validateVehicle,
  validateTransportFee,
  validateTransportPayment,
  validateBonafideCertificate,
  validateLeavingCertificate,
  validateAffidavit,
  validateBulkSMS,
  validateMessage,
  validateNotification,
  validateInquiry,
  validateUUID,
  validatePagination
};

// Class-Teacher Assignment validation rules
const validateClassTeacherAssignment = [
  body('classId')
    .isUUID()
    .withMessage('Class ID must be a valid UUID'),
  body('teacherId')
    .isUUID()
    .withMessage('Teacher ID must be a valid UUID'),
  body('subjectId')
    .optional()
    .isUUID()
    .withMessage('Subject ID must be a valid UUID'),
  body('role')
    .optional()
    .isIn(['class_teacher', 'subject_teacher'])
    .withMessage('Role must be either class_teacher or subject_teacher'),
  body('academicYear')
    .optional()
    .isLength({ min: 4, max: 20 })
    .withMessage('Academic year must be between 4 and 20 characters')
];

const validateBulkClassTeacherAssignment = [
  body('assignments')
    .isArray({ min: 1 })
    .withMessage('Assignments must be a non-empty array'),
  body('assignments.*.classId')
    .isUUID()
    .withMessage('Each assignment must have a valid class ID'),
  body('assignments.*.teacherId')
    .isUUID()
    .withMessage('Each assignment must have a valid teacher ID'),
  body('assignments.*.subjectId')
    .optional()
    .isUUID()
    .withMessage('Subject ID must be a valid UUID'),
  body('assignments.*.role')
    .optional()
    .isIn(['class_teacher', 'subject_teacher'])
    .withMessage('Role must be either class_teacher or subject_teacher'),
  body('assignments.*.academicYear')
    .optional()
    .isLength({ min: 4, max: 20 })
    .withMessage('Academic year must be between 4 and 20 characters')
];





