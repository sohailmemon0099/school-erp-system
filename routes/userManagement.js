const express = require('express');
const router = express.Router();
const userManagementController = require('../controllers/userManagementController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/permission');
const { 
  validateUserCreation, 
  validateUserUpdate, 
  validatePasswordChange,
  validateBulkUserCreation
} = require('../middleware/validation');

// Get all users with pagination and filtering
router.get('/', auth.protect, checkPermission('userManagement', 'view'), userManagementController.getAllUsers);

// Get user by ID
router.get('/:id', auth.protect, checkPermission('userManagement', 'view'), userManagementController.getUserById);

// Create new user
router.post('/', auth.protect, checkPermission('userManagement', 'create'), validateUserCreation, userManagementController.createUser);

// Update user
router.put('/:id', auth.protect, checkPermission('userManagement', 'update'), validateUserUpdate, userManagementController.updateUser);

// Delete user
router.delete('/:id', auth.protect, checkPermission('userManagement', 'delete'), userManagementController.deleteUser);

// Change user password
router.put('/:id/password', auth.protect, checkPermission('userManagement', 'update'), validatePasswordChange, userManagementController.changePassword);

// Toggle user status (activate/deactivate)
router.put('/:id/toggle-status', auth.protect, checkPermission('userManagement', 'update'), userManagementController.toggleUserStatus);

// Get user statistics
router.get('/stats/overview', auth.protect, checkPermission('userManagement', 'view'), userManagementController.getUserStatistics);

// Bulk create users
router.post('/bulk-create', auth.protect, checkPermission('userManagement', 'create'), validateBulkUserCreation, userManagementController.bulkCreateUsers);

module.exports = router;
