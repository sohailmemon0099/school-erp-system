const express = require('express');
const router = express.Router();
const rolePermissionController = require('../controllers/rolePermissionController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/permission');
const { validateRolePermission } = require('../middleware/validation');

// Get all role permissions
router.get('/', auth.protect, checkPermission('rolePermissions', 'view'), rolePermissionController.getAllRolePermissions);

// Get role permission by role
router.get('/:role', auth.protect, checkPermission('rolePermissions', 'view'), rolePermissionController.getRolePermissionByRole);

// Create or update role permission
router.post('/', auth.protect, checkPermission('rolePermissions', 'create'), validateRolePermission, rolePermissionController.upsertRolePermission);

// Update role permission
router.put('/:role', auth.protect, checkPermission('rolePermissions', 'update'), validateRolePermission, rolePermissionController.upsertRolePermission);

// Delete role permission
router.delete('/:role', auth.protect, checkPermission('rolePermissions', 'delete'), rolePermissionController.deleteRolePermission);

// Initialize default role permissions
router.post('/initialize-defaults', auth.protect, checkPermission('rolePermissions', 'create'), rolePermissionController.initializeDefaultRolePermissions);

// Get available features/modules
router.get('/features/available', auth.protect, checkPermission('rolePermissions', 'view'), rolePermissionController.getAvailableFeatures);

module.exports = router;
