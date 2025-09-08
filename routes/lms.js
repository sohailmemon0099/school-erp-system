const express = require('express');
const router = express.Router();
const lmsController = require('../controllers/lmsController');
const auth = require('../middleware/auth');
const { validateCourse, validateLesson, validateQuiz, validateQuizQuestion } = require('../middleware/validation');

// Course Management Routes
router.get('/courses', auth.protect, lmsController.getCourses);
router.get('/courses/:id', auth.protect, lmsController.getCourseById);
router.post('/courses', auth.protect, validateCourse, lmsController.createCourse);
router.put('/courses/:id', auth.protect, validateCourse, lmsController.updateCourse);
router.delete('/courses/:id', auth.protect, lmsController.deleteCourse);

// Lesson Management Routes
router.get('/courses/:courseId/lessons', auth.protect, lmsController.getCourseLessons);
router.post('/lessons', auth.protect, validateLesson, lmsController.createLesson);
router.put('/lessons/:id', auth.protect, validateLesson, lmsController.updateLesson);
router.delete('/lessons/:id', auth.protect, lmsController.deleteLesson);

// Course Enrollment Routes
router.post('/enrollments', auth.protect, lmsController.enrollStudent);
router.get('/students/:studentId/enrollments', auth.protect, lmsController.getStudentEnrollments);
router.put('/enrollments/:id/progress', auth.protect, lmsController.updateEnrollmentProgress);

// Quiz Management Routes
router.get('/courses/:courseId/quizzes', auth.protect, lmsController.getCourseQuizzes);
router.post('/quizzes', auth.protect, validateQuiz, lmsController.createQuiz);
router.get('/quizzes/:quizId/questions', auth.protect, lmsController.getQuizQuestions);
router.post('/quiz-attempts', auth.protect, lmsController.submitQuizAttempt);
router.get('/students/:studentId/quiz-attempts', auth.protect, lmsController.getStudentQuizAttempts);

module.exports = router;
