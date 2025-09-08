const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');
const { validateBook, validateBookLoan } = require('../middleware/validation');

// Book routes
router.get('/', auth.protect, bookController.getBooks);
router.get('/:id', auth.protect, bookController.getBookById);
router.post('/', auth.protect, validateBook, bookController.createBook);
router.put('/:id', auth.protect, validateBook, bookController.updateBook);
router.delete('/:id', auth.protect, bookController.deleteBook);

// Book loan routes
router.get('/loans/all', auth.protect, bookController.getBookLoans);
router.post('/loans/issue', auth.protect, validateBookLoan, bookController.issueBook);
router.put('/loans/:id/return', auth.protect, bookController.returnBook);
router.get('/loans/overdue', auth.protect, bookController.getOverdueBooks);

module.exports = router;
