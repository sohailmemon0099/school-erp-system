const express = require('express');
const router = express.Router();
const markDistributionController = require('../controllers/markDistributionController');
const { protect: auth } = require('../middleware/auth');
const { validateMarkDistribution, validateMarkDistributionUpdate, validateGradeCalculation } = require('../middleware/validation');

// Mark Distribution routes
router.get('/', auth, markDistributionController.getMarkDistributions);
router.get('/stats', auth, markDistributionController.getMarkDistributionStats);
router.get('/:id', auth, markDistributionController.getMarkDistributionById);
router.post('/', auth, validateMarkDistribution, markDistributionController.createMarkDistribution);
router.put('/:id', auth, validateMarkDistributionUpdate, markDistributionController.updateMarkDistribution);
router.delete('/:id', auth, markDistributionController.deleteMarkDistribution);

// Grade Calculation routes
router.post('/calculate-grades', auth, validateGradeCalculation, markDistributionController.calculateGrades);
router.get('/grade-calculations', auth, markDistributionController.getGradeCalculations);

module.exports = router;
