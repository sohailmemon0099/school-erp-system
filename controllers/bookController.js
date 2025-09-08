const { Book, BookLoan, Student, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// Get all books
const getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, status, isAvailable } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { author: { [Op.iLike]: `%${search}%` } },
        { isbn: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (category) where.category = category;
    if (status) where.status = status;
    if (isAvailable !== undefined) where.isAvailable = isAvailable === 'true';

    const books = await Book.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['title', 'ASC']]
    });

    res.json({
      status: 'success',
      data: {
        books: books.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(books.count / limit),
          totalItems: books.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch books' });
  }
};

// Get book by ID
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findByPk(id);

    if (!book) {
      return res.status(404).json({ status: 'error', message: 'Book not found' });
    }

    res.json({
      status: 'success',
      data: { book }
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch book' });
  }
};

// Create new book
const createBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const bookData = req.body;
    const book = await Book.create(bookData);

    res.status(201).json({
      status: 'success',
      message: 'Book created successfully',
      data: { book }
    });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create book' });
  }
};

// Update book
const updateBook = async (req, res) => {
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

    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({ status: 'error', message: 'Book not found' });
    }

    await book.update(req.body);

    res.json({
      status: 'success',
      message: 'Book updated successfully',
      data: { book }
    });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update book' });
  }
};

// Delete book
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({ status: 'error', message: 'Book not found' });
    }

    // Check if book has active loans
    const activeLoans = await BookLoan.count({
      where: { bookId: id, status: 'borrowed' }
    });

    if (activeLoans > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete book with active loans'
      });
    }

    await book.destroy();

    res.json({
      status: 'success',
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete book' });
  }
};

// Get book loans
const getBookLoans = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, studentId, bookId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (studentId) where.studentId = studentId;
    if (bookId) where.bookId = bookId;

    const bookLoans = await BookLoan.findAndCountAll({
      where,
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'title', 'author', 'isbn', 'category']
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId'],
          include: [{
            model: require('../models').User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: User,
          as: 'issuer',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        bookLoans: bookLoans.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(bookLoans.count / limit),
          totalItems: bookLoans.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching book loans:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch book loans' });
  }
};

// Issue book to student
const issueBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { bookId, studentId, dueDate, issuedBy } = req.body;

    // Check if book is available
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ status: 'error', message: 'Book not found' });
    }

    if (!book.isAvailable) {
      return res.status(400).json({ status: 'error', message: 'Book is not available' });
    }

    // Check if student already has this book
    const existingLoan = await BookLoan.findOne({
      where: { bookId, studentId, status: 'borrowed' }
    });

    if (existingLoan) {
      return res.status(400).json({ status: 'error', message: 'Student already has this book' });
    }

    // Create book loan
    const bookLoan = await BookLoan.create({
      bookId,
      studentId,
      dueDate,
      issuedBy,
      status: 'borrowed',
      issuedAt: new Date()
    });

    // Update book availability
    await book.update({ isAvailable: false });

    const createdLoan = await BookLoan.findByPk(bookLoan.id, {
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'title', 'author', 'isbn']
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId'],
          include: [{
            model: require('../models').User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Book issued successfully',
      data: { bookLoan: createdLoan }
    });
  } catch (error) {
    console.error('Error issuing book:', error);
    res.status(500).json({ status: 'error', message: 'Failed to issue book' });
  }
};

// Return book
const returnBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { returnedBy, condition, notes } = req.body;

    const bookLoan = await BookLoan.findByPk(id, {
      include: [
        {
          model: Book,
          as: 'book'
        }
      ]
    });

    if (!bookLoan) {
      return res.status(404).json({ status: 'error', message: 'Book loan not found' });
    }

    if (bookLoan.status !== 'borrowed') {
      return res.status(400).json({ status: 'error', message: 'Book is not currently borrowed' });
    }

    // Update book loan
    await bookLoan.update({
      status: 'returned',
      returnedAt: new Date(),
      returnedBy,
      condition,
      notes
    });

    // Update book availability
    await bookLoan.book.update({ isAvailable: true });

    const updatedLoan = await BookLoan.findByPk(id, {
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'title', 'author', 'isbn']
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId'],
          include: [{
            model: require('../models').User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        }
      ]
    });

    res.json({
      status: 'success',
      message: 'Book returned successfully',
      data: { bookLoan: updatedLoan }
    });
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ status: 'error', message: 'Failed to return book' });
  }
};

// Get overdue books
const getOverdueBooks = async (req, res) => {
  try {
    const overdueLoans = await BookLoan.findAll({
      where: {
        status: 'borrowed',
        dueDate: {
          [Op.lt]: new Date()
        }
      },
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'title', 'author', 'isbn']
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId'],
          include: [{
            model: require('../models').User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'phone']
          }]
        }
      ],
      order: [['dueDate', 'ASC']]
    });

    res.json({
      status: 'success',
      data: { overdueLoans }
    });
  } catch (error) {
    console.error('Error fetching overdue books:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch overdue books' });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBookLoans,
  issueBook,
  returnBook,
  getOverdueBooks
};
