const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const Student = require('./Student');
const Teacher = require('./Teacher');
const Class = require('./Class');
const Subject = require('./Subject');
const Attendance = require('./Attendance');
const Grade = require('./Grade');
const Fee = require('./Fee');
const FeeStructure = require('./FeeStructure');
const FeePayment = require('./FeePayment');
const Exam = require('./Exam');
const ExamResult = require('./ExamResult');
const Parent = require('./Parent');
const StudentParent = require('./StudentParent');
const Message = require('./Message');
const Inventory = require('./Inventory');
const Hostel = require('./Hostel');
const HostelRoom = require('./HostelRoom');
const HostelAllocation = require('./HostelAllocation');
const Cafeteria = require('./Cafeteria');
const Meal = require('./Meal');
const MealOrder = require('./MealOrder');
const Notification = require('./Notification');
const Event = require('./Event');
const Book = require('./Book');
const BookLoan = require('./BookLoan');
const Vehicle = require('./Vehicle');
const Inquiry = require('./Inquiry');
const Affidavit = require('./Affidavit');
const BulkSMS = require('./BulkSMS');
const Timetable = require('./Timetable');
const BonafideCertificate = require('./BonafideCertificate');
const LeavingCertificate = require('./LeavingCertificate');
const Classwork = require('./Classwork');
const ClassworkSubmission = require('./ClassworkSubmission');
const TransportFee = require('./TransportFee');
const TransportPayment = require('./TransportPayment');
const ExamSchedule = require('./ExamSchedule');
const HallTicket = require('./HallTicket');
const MarkDistribution = require('./MarkDistribution');
const GradeCalculation = require('./GradeCalculation');
const AttendanceReport = require('./AttendanceReport');
const Cheque = require('./Cheque');
const TransactionLog = require('./TransactionLog');
const Notice = require('./Notice');
const SchoolEvent = require('./Event');
const Circular = require('./Circular');
const NoticeView = require('./NoticeView');
const CircularAcknowledgment = require('./CircularAcknowledgment');
const Course = require('./Course');
const Lesson = require('./Lesson');
const CourseEnrollment = require('./CourseEnrollment');
const Quiz = require('./Quiz');
const QuizQuestion = require('./QuizQuestion');
const QuizAttempt = require('./QuizAttempt');
const Forum = require('./Forum');
const ForumPost = require('./ForumPost');
const PostLike = require('./PostLike');
const Announcement = require('./Announcement');
const AnnouncementView = require('./AnnouncementView');
const EventAttendance = require('./EventAttendance');
const TransactionReport = require('./TransactionReport');
const RolePermission = require('./RolePermission');
const ClassTeacherAssignment = require('./ClassTeacherAssignment');

// Initialize the ClassTeacherAssignment model
const classTeacherAssignmentModel = ClassTeacherAssignment(sequelize);

// Define associations

// User associations
User.hasOne(Student, { foreignKey: 'userId', as: 'student' });
User.hasOne(Teacher, { foreignKey: 'userId', as: 'teacher' });

// Student associations
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Student.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Student.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendances' });
Student.hasMany(Grade, { foreignKey: 'studentId', as: 'grades' });
Student.hasMany(Fee, { foreignKey: 'studentId', as: 'fees' });
Student.hasMany(Affidavit, { foreignKey: 'studentId', as: 'affidavits' });
Student.hasMany(BonafideCertificate, { foreignKey: 'studentId', as: 'bonafideCertificates' });
Student.hasMany(LeavingCertificate, { foreignKey: 'studentId', as: 'leavingCertificates' });
Student.hasMany(ClassworkSubmission, { foreignKey: 'studentId', as: 'classworkSubmissions' });
Student.hasMany(TransportFee, { foreignKey: 'studentId', as: 'transportFees' });
Student.hasMany(TransportPayment, { foreignKey: 'studentId', as: 'transportPayments' });
Student.belongsTo(Inquiry, { foreignKey: 'id', as: 'inquiry' });

// Teacher associations
Teacher.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Teacher.belongsToMany(Class, { 
  through: 'TeacherClasses', 
  foreignKey: 'teacherId', 
  as: 'classes' 
});
Teacher.belongsToMany(Subject, { 
  through: 'TeacherSubjects', 
  foreignKey: 'teacherId', 
  as: 'subjects' 
});

// Class associations
Class.hasMany(Student, { foreignKey: 'classId', as: 'students' });
Class.belongsToMany(Teacher, { 
  through: 'TeacherClasses', 
  foreignKey: 'classId', 
  as: 'teachers' 
});
Class.hasMany(Attendance, { foreignKey: 'classId', as: 'attendances' });

// Subject associations
Subject.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Subject.belongsToMany(Teacher, { 
  through: 'TeacherSubjects', 
  foreignKey: 'subjectId', 
  as: 'teachers' 
});
Subject.hasMany(Attendance, { foreignKey: 'subjectId', as: 'attendances' });
Subject.hasMany(Grade, { foreignKey: 'subjectId', as: 'grades' });
Subject.hasMany(Classwork, { foreignKey: 'subjectId', as: 'classworks' });

// Attendance associations
Attendance.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Attendance.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Attendance.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

// Grade associations
Grade.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Grade.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

// Fee associations
Fee.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// FeeStructure associations
FeeStructure.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
FeeStructure.hasMany(FeePayment, { foreignKey: 'feeStructureId', as: 'payments' });

// FeePayment associations
FeePayment.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
FeePayment.belongsTo(FeeStructure, { foreignKey: 'feeStructureId', as: 'feeStructure' });
FeePayment.belongsTo(User, { foreignKey: 'collectedBy', as: 'collector' });

// Exam associations
Exam.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
Exam.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Exam.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Exam.hasMany(ExamResult, { foreignKey: 'examId', as: 'results' });
Exam.hasMany(ExamSchedule, { foreignKey: 'examId', as: 'schedules' });
Exam.hasMany(HallTicket, { foreignKey: 'examId', as: 'hallTickets' });

// ExamSchedule associations
ExamSchedule.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });
ExamSchedule.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
ExamSchedule.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
ExamSchedule.belongsTo(Teacher, { foreignKey: 'invigilatorId', as: 'invigilator' });
ExamSchedule.hasMany(ExamResult, { foreignKey: 'examScheduleId', as: 'results' });
ExamSchedule.hasMany(HallTicket, { foreignKey: 'examScheduleId', as: 'hallTickets' });

// ExamResult associations
ExamResult.belongsTo(Exam, { foreignKey: 'examId', as: 'examInfo' });
ExamResult.belongsTo(ExamSchedule, { foreignKey: 'examScheduleId', as: 'examSchedule' });
ExamResult.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
ExamResult.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
ExamResult.belongsTo(User, { foreignKey: 'gradedBy', as: 'grader' });

// HallTicket associations
HallTicket.belongsTo(Exam, { foreignKey: 'examId', as: 'examInfo' });
HallTicket.belongsTo(ExamSchedule, { foreignKey: 'examScheduleId', as: 'examSchedule' });
HallTicket.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
HallTicket.belongsTo(User, { foreignKey: 'generatedBy', as: 'generator' });

// Parent associations
Parent.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Parent.belongsToMany(Student, { through: StudentParent, foreignKey: 'parentId', as: 'students' });

// StudentParent associations
StudentParent.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
StudentParent.belongsTo(Parent, { foreignKey: 'parentId', as: 'parent' });

// Message associations
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });
Message.belongsTo(Message, { foreignKey: 'replyTo', as: 'parentMessage' });

// Inventory associations
Inventory.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedUser' });

// Hostel associations
Hostel.belongsTo(User, { foreignKey: 'wardenId', as: 'warden' });
Hostel.hasMany(HostelRoom, { foreignKey: 'hostelId', as: 'rooms' });
Hostel.hasMany(HostelAllocation, { foreignKey: 'hostelId', as: 'allocations' });

// HostelRoom associations
HostelRoom.belongsTo(Hostel, { foreignKey: 'hostelId', as: 'hostel' });
HostelRoom.hasMany(HostelAllocation, { foreignKey: 'roomId', as: 'allocations' });

// HostelAllocation associations
HostelAllocation.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
HostelAllocation.belongsTo(Hostel, { foreignKey: 'hostelId', as: 'hostel' });
HostelAllocation.belongsTo(HostelRoom, { foreignKey: 'roomId', as: 'room' });
HostelAllocation.belongsTo(User, { foreignKey: 'allocatedBy', as: 'allocator' });

// Cafeteria associations
Cafeteria.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });
Cafeteria.hasMany(Meal, { foreignKey: 'cafeteriaId', as: 'meals' });

// Meal associations
Meal.belongsTo(Cafeteria, { foreignKey: 'cafeteriaId', as: 'cafeteria' });
Meal.hasMany(MealOrder, { foreignKey: 'mealId', as: 'orders' });

// MealOrder associations
MealOrder.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
MealOrder.belongsTo(Meal, { foreignKey: 'mealId', as: 'meal' });
MealOrder.belongsTo(User, { foreignKey: 'deliveredBy', as: 'deliverer' });

// Affidavit associations
Affidavit.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Affidavit.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifiedByUser' });

// BulkSMS associations
BulkSMS.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
BulkSMS.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

// Timetable associations
Timetable.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Timetable.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
Timetable.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
Timetable.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// BonafideCertificate associations
BonafideCertificate.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
BonafideCertificate.belongsTo(User, { foreignKey: 'issuedBy', as: 'issuedByUser' });

// LeavingCertificate associations
LeavingCertificate.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
LeavingCertificate.belongsTo(User, { foreignKey: 'issuedBy', as: 'issuedByUser' });

// Classwork associations
Classwork.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Classwork.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
Classwork.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
Classwork.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Classwork.hasMany(ClassworkSubmission, { foreignKey: 'classworkId', as: 'submissions' });

// ClassworkSubmission associations
ClassworkSubmission.belongsTo(Classwork, { foreignKey: 'classworkId', as: 'classwork' });
ClassworkSubmission.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
ClassworkSubmission.belongsTo(User, { foreignKey: 'gradedBy', as: 'grader' });

// TransportFee associations
TransportFee.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
TransportFee.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
TransportFee.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
TransportFee.hasMany(TransportPayment, { foreignKey: 'transportFeeId', as: 'payments' });

// TransportPayment associations
TransportPayment.belongsTo(TransportFee, { foreignKey: 'transportFeeId', as: 'transportFee' });
TransportPayment.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
TransportPayment.belongsTo(User, { foreignKey: 'collectedBy', as: 'collector' });

// Inquiry associations
Inquiry.hasOne(Student, { foreignKey: 'id', as: 'student' });

// MarkDistribution associations
MarkDistribution.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
MarkDistribution.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
MarkDistribution.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
MarkDistribution.hasMany(GradeCalculation, { foreignKey: 'markDistributionId', as: 'gradeCalculations' });

// GradeCalculation associations
GradeCalculation.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
GradeCalculation.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
GradeCalculation.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
GradeCalculation.belongsTo(MarkDistribution, { foreignKey: 'markDistributionId', as: 'markDistribution' });
GradeCalculation.belongsTo(User, { foreignKey: 'calculatedBy', as: 'calculator' });

// AttendanceReport associations
AttendanceReport.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
AttendanceReport.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
AttendanceReport.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
AttendanceReport.belongsTo(User, { foreignKey: 'generatedBy', as: 'generator' });

// Cheque associations
Cheque.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Cheque.belongsTo(FeePayment, { foreignKey: 'feePaymentId', as: 'feePayment' });
Cheque.belongsTo(TransportPayment, { foreignKey: 'transportPaymentId', as: 'transportPayment' });
Cheque.belongsTo(User, { foreignKey: 'processedBy', as: 'processor' });

// TransactionLog associations
TransactionLog.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
TransactionLog.belongsTo(FeePayment, { foreignKey: 'feePaymentId', as: 'feePayment' });
TransactionLog.belongsTo(TransportPayment, { foreignKey: 'transportPaymentId', as: 'transportPayment' });
TransactionLog.belongsTo(Cheque, { foreignKey: 'chequeId', as: 'cheque' });
TransactionLog.belongsTo(User, { foreignKey: 'processedBy', as: 'processor' });

// Notice associations
Notice.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Notice.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Notice.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Notice.hasMany(NoticeView, { foreignKey: 'noticeId', as: 'views' });

// SchoolEvent associations
SchoolEvent.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
SchoolEvent.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
SchoolEvent.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });
SchoolEvent.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Circular associations
Circular.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Circular.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Circular.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Circular.hasMany(CircularAcknowledgment, { foreignKey: 'circularId', as: 'acknowledgments' });

// Additional associations for new features

// Book associations
Book.hasMany(BookLoan, { foreignKey: 'bookId', as: 'loans' });

// BookLoan associations
BookLoan.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });
BookLoan.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
BookLoan.belongsTo(User, { foreignKey: 'issuedBy', as: 'issuer' });
BookLoan.belongsTo(User, { foreignKey: 'returnedBy', as: 'returner' });

// NoticeView associations
NoticeView.belongsTo(Notice, { foreignKey: 'noticeId', as: 'notice' });
NoticeView.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// CircularAcknowledgment associations
CircularAcknowledgment.belongsTo(Circular, { foreignKey: 'circularId', as: 'circular' });
CircularAcknowledgment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// LMS associations

// Course associations
Course.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Course.hasMany(Lesson, { foreignKey: 'courseId', as: 'lessons' });
Course.hasMany(CourseEnrollment, { foreignKey: 'courseId', as: 'enrollments' });
Course.hasMany(Quiz, { foreignKey: 'courseId', as: 'quizzes' });

// Lesson associations
Lesson.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Lesson.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// CourseEnrollment associations
CourseEnrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
CourseEnrollment.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Quiz associations
Quiz.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Quiz.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });
Quiz.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Quiz.hasMany(QuizQuestion, { foreignKey: 'quizId', as: 'questions' });
Quiz.hasMany(QuizAttempt, { foreignKey: 'quizId', as: 'quizAttempts' });

// QuizQuestion associations
QuizQuestion.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });

// QuizAttempt associations
QuizAttempt.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });
QuizAttempt.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Social Network associations

// Forum associations
Forum.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Forum.hasMany(ForumPost, { foreignKey: 'forumId', as: 'posts' });

// ForumPost associations
ForumPost.belongsTo(Forum, { foreignKey: 'forumId', as: 'forum' });
ForumPost.belongsTo(ForumPost, { foreignKey: 'parentPostId', as: 'parentPost' });
ForumPost.hasMany(ForumPost, { foreignKey: 'parentPostId', as: 'replies' });
ForumPost.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
ForumPost.hasMany(PostLike, { foreignKey: 'postId', as: 'likes' });

// PostLike associations
PostLike.belongsTo(ForumPost, { foreignKey: 'postId', as: 'post' });
PostLike.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Announcement associations
Announcement.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Announcement.hasMany(AnnouncementView, { foreignKey: 'announcementId', as: 'views' });

// AnnouncementView associations
AnnouncementView.belongsTo(Announcement, { foreignKey: 'announcementId', as: 'announcement' });
AnnouncementView.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Event associations
Event.belongsTo(User, { foreignKey: 'createdBy', as: 'eventCreator' });
Event.hasMany(EventAttendance, { foreignKey: 'eventId', as: 'attendees' });

// EventAttendance associations
EventAttendance.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
EventAttendance.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// TransactionReport associations
TransactionReport.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
TransactionReport.belongsTo(User, { foreignKey: 'processedBy', as: 'processor' });

// ClassTeacherAssignment associations
classTeacherAssignmentModel.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
classTeacherAssignmentModel.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });
classTeacherAssignmentModel.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
classTeacherAssignmentModel.belongsTo(User, { foreignKey: 'assignedBy', as: 'assignedByUser' });

// Reverse associations
Class.hasMany(classTeacherAssignmentModel, { foreignKey: 'classId', as: 'teacherAssignments' });
User.hasMany(classTeacherAssignmentModel, { foreignKey: 'teacherId', as: 'classAssignments' });
Subject.hasMany(classTeacherAssignmentModel, { foreignKey: 'subjectId', as: 'teacherAssignments' });

// Export all models and sequelize instance
module.exports = {
  sequelize,
  User,
  Student,
  Teacher,
  Class,
  Subject,
  Attendance,
  Grade,
  Fee,
  FeeStructure,
  FeePayment,
  Exam,
  ExamResult,
  Parent,
  StudentParent,
  Message,
  Inventory,
  Hostel,
  HostelRoom,
  HostelAllocation,
  Cafeteria,
  Meal,
  MealOrder,
  Notification,
  Event,
  Book,
  BookLoan,
  Vehicle,
  Inquiry,
  Affidavit,
  BulkSMS,
  Timetable,
  BonafideCertificate,
  LeavingCertificate,
  Classwork,
  ClassworkSubmission,
  TransportFee,
  TransportPayment,
  ExamSchedule,
  HallTicket,
  MarkDistribution,
  GradeCalculation,
  AttendanceReport,
  Cheque,
  TransactionLog,
  Notice,
  SchoolEvent,
  Circular,
  NoticeView,
  CircularAcknowledgment,
  Course,
  Lesson,
  CourseEnrollment,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  Forum,
  ForumPost,
  PostLike,
  Announcement,
  AnnouncementView,
  Event,
  EventAttendance,
  TransactionReport,
  RolePermission,
  ClassTeacherAssignment: classTeacherAssignmentModel
};
