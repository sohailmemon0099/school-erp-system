const { Course, Lesson, CourseEnrollment, Quiz, QuizQuestion, QuizAttempt, Student, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// Course Management

// Get all courses
const getCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, level, isActive } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { courseCode: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (category) where.category = category;
    if (level) where.level = level;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const courses = await Course.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        courses: courses.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(courses.count / limit),
          totalItems: courses.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch courses' });
  }
};

// Get course by ID
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Lesson,
          as: 'lessons',
          attributes: ['id', 'title', 'lessonType', 'duration', 'order'],
          order: [['order', 'ASC']]
        }
      ]
    });

    if (!course) {
      return res.status(404).json({ status: 'error', message: 'Course not found' });
    }

    res.json({
      status: 'success',
      data: { course }
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch course' });
  }
};

// Create new course
const createCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const courseData = { ...req.body, createdBy: req.user.id };
    const course = await Course.create(courseData);

    const createdCourse = await Course.findByPk(course.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Course created successfully',
      data: { course: createdCourse }
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create course' });
  }
};

// Update course
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ status: 'error', message: 'Course not found' });
    }

    await course.update(req.body);

    const updatedCourse = await Course.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.json({
      status: 'success',
      message: 'Course updated successfully',
      data: { course: updatedCourse }
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update course' });
  }
};

// Delete course
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ status: 'error', message: 'Course not found' });
    }

    // Check if course has enrollments
    const enrollments = await CourseEnrollment.count({
      where: { courseId: id }
    });

    if (enrollments > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete course with active enrollments'
      });
    }

    await course.destroy();

    res.json({
      status: 'success',
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete course' });
  }
};

// Lesson Management

// Get lessons for a course
const getCourseLessons = async (req, res) => {
  try {
    const { courseId } = req.params;

    const lessons = await Lesson.findAll({
      where: { courseId, isActive: true },
      order: [['order', 'ASC']]
    });

    res.json({
      status: 'success',
      data: { lessons }
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch lessons' });
  }
};

// Create lesson
const createLesson = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const lessonData = { ...req.body, createdBy: req.user.id };
    const lesson = await Lesson.create(lessonData);

    res.status(201).json({
      status: 'success',
      message: 'Lesson created successfully',
      data: { lesson }
    });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create lesson' });
  }
};

// Update lesson
const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
      return res.status(404).json({ status: 'error', message: 'Lesson not found' });
    }

    await lesson.update(req.body);

    res.json({
      status: 'success',
      message: 'Lesson updated successfully',
      data: { lesson }
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update lesson' });
  }
};

// Delete lesson
const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
      return res.status(404).json({ status: 'error', message: 'Lesson not found' });
    }

    await lesson.destroy();

    res.json({
      status: 'success',
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete lesson' });
  }
};

// Course Enrollment

// Enroll student in course
const enrollStudent = async (req, res) => {
  try {
    const { courseId, studentId } = req.body;

    // Check if already enrolled
    const existingEnrollment = await CourseEnrollment.findOne({
      where: { courseId, studentId }
    });

    if (existingEnrollment) {
      return res.status(400).json({
        status: 'error',
        message: 'Student is already enrolled in this course'
      });
    }

    const enrollment = await CourseEnrollment.create({
      courseId,
      studentId,
      enrolledAt: new Date()
    });

    res.status(201).json({
      status: 'success',
      message: 'Student enrolled successfully',
      data: { enrollment }
    });
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({ status: 'error', message: 'Failed to enroll student' });
  }
};

// Get student enrollments
const getStudentEnrollments = async (req, res) => {
  try {
    const { studentId } = req.params;

    const enrollments = await CourseEnrollment.findAll({
      where: { studentId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'courseCode', 'category', 'level', 'duration']
        }
      ],
      order: [['enrolledAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: { enrollments }
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch enrollments' });
  }
};

// Update enrollment progress
const updateEnrollmentProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, status } = req.body;

    const enrollment = await CourseEnrollment.findByPk(id);
    if (!enrollment) {
      return res.status(404).json({ status: 'error', message: 'Enrollment not found' });
    }

    const updateData = { progress };
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    await enrollment.update(updateData);

    res.json({
      status: 'success',
      message: 'Enrollment progress updated successfully',
      data: { enrollment }
    });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update enrollment' });
  }
};

// Quiz Management

// Get quizzes for a course
const getCourseQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;

    const quizzes = await Quiz.findAll({
      where: { courseId, isActive: true },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: { quizzes }
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch quizzes' });
  }
};

// Create quiz
const createQuiz = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const quizData = { ...req.body, createdBy: req.user.id };
    const quiz = await Quiz.create(quizData);

    res.status(201).json({
      status: 'success',
      message: 'Quiz created successfully',
      data: { quiz }
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create quiz' });
  }
};

// Get quiz questions
const getQuizQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;

    const questions = await QuizQuestion.findAll({
      where: { quizId, isActive: true },
      order: [['order', 'ASC']]
    });

    res.json({
      status: 'success',
      data: { questions }
    });
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch quiz questions' });
  }
};

// Submit quiz attempt
const submitQuizAttempt = async (req, res) => {
  try {
    const { quizId, studentId, answers } = req.body;

    // Get quiz details
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({ status: 'error', message: 'Quiz not found' });
    }

    // Get quiz questions
    const questions = await QuizQuestion.findAll({
      where: { quizId, isActive: true }
    });

    // Calculate score
    let score = 0;
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    questions.forEach(question => {
      const studentAnswer = answers[question.id];
      if (studentAnswer && studentAnswer.toString().toLowerCase() === question.correctAnswer.toLowerCase()) {
        score += question.marks;
      }
    });

    const percentage = (score / totalMarks) * 100;

    // Create or update quiz attempt
    const attempt = await QuizAttempt.create({
      quizId,
      studentId,
      completedAt: new Date(),
      score,
      totalMarks,
      percentage,
      status: 'completed',
      answers
    });

    res.json({
      status: 'success',
      message: 'Quiz submitted successfully',
      data: { 
        attempt,
        score,
        totalMarks,
        percentage,
        passed: percentage >= quiz.passingMarks
      }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ status: 'error', message: 'Failed to submit quiz' });
  }
};

// Get student quiz attempts
const getStudentQuizAttempts = async (req, res) => {
  try {
    const { studentId } = req.params;

    const attempts = await QuizAttempt.findAll({
      where: { studentId },
      include: [
        {
          model: Quiz,
          as: 'quiz',
          attributes: ['id', 'title', 'totalMarks', 'passingMarks']
        }
      ],
      order: [['completedAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: { attempts }
    });
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch quiz attempts' });
  }
};

module.exports = {
  // Course Management
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  
  // Lesson Management
  getCourseLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  
  // Enrollment Management
  enrollStudent,
  getStudentEnrollments,
  updateEnrollmentProgress,
  
  // Quiz Management
  getCourseQuizzes,
  createQuiz,
  getQuizQuestions,
  submitQuizAttempt,
  getStudentQuizAttempts
};
