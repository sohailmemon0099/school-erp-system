const { RolePermission } = require('../models');
const { validationResult } = require('express-validator');

// Get all role permissions
const getAllRolePermissions = async (req, res) => {
  try {
    const rolePermissions = await RolePermission.findAll({
      order: [['role', 'ASC']]
    });

    res.json({
      status: 'success',
      data: { rolePermissions }
    });
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch role permissions' });
  }
};

// Get role permission by role
const getRolePermissionByRole = async (req, res) => {
  try {
    const { role } = req.params;

    const rolePermission = await RolePermission.findOne({
      where: { role }
    });

    if (!rolePermission) {
      return res.status(404).json({ status: 'error', message: 'Role permission not found' });
    }

    res.json({
      status: 'success',
      data: { rolePermission }
    });
  } catch (error) {
    console.error('Error fetching role permission:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch role permission' });
  }
};

// Create or update role permission
const upsertRolePermission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { role, permissions, isActive = true } = req.body;

    const [rolePermission, created] = await RolePermission.upsert({
      role,
      permissions,
      isActive
    }, {
      returning: true
    });

    res.json({
      status: 'success',
      message: created ? 'Role permission created successfully' : 'Role permission updated successfully',
      data: { rolePermission }
    });
  } catch (error) {
    console.error('Error upserting role permission:', error);
    res.status(500).json({ status: 'error', message: 'Failed to save role permission' });
  }
};

// Delete role permission
const deleteRolePermission = async (req, res) => {
  try {
    const { role } = req.params;

    const rolePermission = await RolePermission.findOne({ where: { role } });
    if (!rolePermission) {
      return res.status(404).json({ status: 'error', message: 'Role permission not found' });
    }

    await rolePermission.destroy();

    res.json({
      status: 'success',
      message: 'Role permission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting role permission:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete role permission' });
  }
};

// Get default permissions for a role
const getDefaultPermissions = (role) => {
  const defaultPermissions = {
    admin: {
      dashboard: { view: true },
      students: { view: true, create: true, update: true, delete: true },
      teachers: { view: true, create: true, update: true, delete: true },
      classes: { view: true, create: true, update: true, delete: true },
      subjects: { view: true, create: true, update: true, delete: true },
      attendance: { view: true, create: true, update: true, delete: true },
      grades: { view: true, create: true, update: true, delete: true },
      fees: { view: true, create: true, update: true, delete: true },
      reports: { view: true, export: true },
      examSchedules: { view: true, create: true, update: true, delete: true },
      hallTickets: { view: true, create: true, update: true, delete: true },
      library: { view: true, create: true, update: true, delete: true },
      transport: { view: true, create: true, update: true, delete: true },
      certificates: { view: true, create: true, update: true, delete: true },
      communication: { view: true, create: true, update: true, delete: true },
      health: { view: true, create: true, update: true, delete: true },
      admission: { view: true, create: true, update: true, delete: true },
      lms: { view: true, create: true, update: true, delete: true },
      social: { view: true, create: true, update: true, delete: true },
      transactionReports: { view: true, create: true, update: true, delete: true },
      userManagement: { view: true, create: true, update: true, delete: true },
      rolePermissions: { view: true, create: true, update: true, delete: true }
    },
    teacher: {
      dashboard: { view: true },
      students: { view: true },
      classes: { view: true },
      subjects: { view: true },
      attendance: { view: true, create: true, update: true },
      grades: { view: true, create: true, update: true },
      examSchedules: { view: true, create: true, update: true },
      hallTickets: { view: true },
      library: { view: true },
      lms: { view: true, create: true, update: true },
      social: { view: true, create: true, update: true }
    },
    student: {
      dashboard: { view: true },
      attendance: { view: true },
      grades: { view: true },
      fees: { view: true },
      examSchedules: { view: true },
      hallTickets: { view: true },
      library: { view: true },
      lms: { view: true },
      social: { view: true }
    },
    clark: {
      dashboard: { view: true },
      students: { view: true, create: true, update: true },
      teachers: { view: true, create: true, update: true },
      classes: { view: true, create: true, update: true },
      subjects: { view: true, create: true, update: true },
      attendance: { view: true, create: true, update: true },
      grades: { view: true, create: true, update: true },
      fees: { view: true, create: true, update: true },
      reports: { view: true, export: true },
      examSchedules: { view: true, create: true, update: true },
      hallTickets: { view: true, create: true, update: true },
      library: { view: true, create: true, update: true },
      transport: { view: true, create: true, update: true },
      certificates: { view: true, create: true, update: true },
      communication: { view: true, create: true, update: true },
      admission: { view: true, create: true, update: true },
      transactionReports: { view: true, create: true, update: true }
    },
    parent: {
      dashboard: { view: true },
      attendance: { view: true },
      grades: { view: true },
      fees: { view: true },
      examSchedules: { view: true },
      hallTickets: { view: true },
      library: { view: true },
      transport: { view: true },
      social: { view: true }
    },
    staff: {
      dashboard: { view: true },
      students: { view: true },
      teachers: { view: true },
      classes: { view: true },
      subjects: { view: true },
      attendance: { view: true },
      grades: { view: true },
      fees: { view: true },
      reports: { view: true },
      examSchedules: { view: true },
      hallTickets: { view: true },
      library: { view: true },
      transport: { view: true },
      certificates: { view: true },
      communication: { view: true },
      admission: { view: true },
      transactionReports: { view: true }
    }
  };

  return defaultPermissions[role] || {};
};

// Initialize default role permissions
const initializeDefaultRolePermissions = async (req, res) => {
  try {
    const roles = ['admin', 'teacher', 'student', 'clark', 'parent', 'staff'];
    const results = [];

    for (const role of roles) {
      const defaultPermissions = getDefaultPermissions(role);
      
      const [rolePermission, created] = await RolePermission.upsert({
        role,
        permissions: defaultPermissions,
        isActive: true
      }, {
        returning: true
      });

      results.push({
        role,
        created,
        permissions: rolePermission.permissions
      });
    }

    res.json({
      status: 'success',
      message: 'Default role permissions initialized successfully',
      data: { results }
    });
  } catch (error) {
    console.error('Error initializing default role permissions:', error);
    res.status(500).json({ status: 'error', message: 'Failed to initialize default role permissions' });
  }
};

// Get available features/modules
const getAvailableFeatures = async (req, res) => {
  try {
    const features = [
      { key: 'dashboard', name: 'Dashboard', description: 'Main dashboard overview' },
      { key: 'students', name: 'Student Management', description: 'Manage student records' },
      { key: 'teachers', name: 'Teacher Management', description: 'Manage teacher records' },
      { key: 'classes', name: 'Class Management', description: 'Manage classes and sections' },
      { key: 'subjects', name: 'Subject Management', description: 'Manage subjects and curriculum' },
      { key: 'attendance', name: 'Attendance Management', description: 'Track student attendance' },
      { key: 'grades', name: 'Grade Management', description: 'Manage student grades and results' },
      { key: 'fees', name: 'Fee Management', description: 'Manage fee collection and payments' },
      { key: 'reports', name: 'Reports & Analytics', description: 'Generate various reports' },
      { key: 'examSchedules', name: 'Exam Schedules', description: 'Manage exam schedules' },
      { key: 'hallTickets', name: 'Hall Tickets', description: 'Generate and manage hall tickets' },
      { key: 'library', name: 'Library Management', description: 'Manage library books and loans' },
      { key: 'transport', name: 'Transport Management', description: 'Manage transport routes and vehicles' },
      { key: 'certificates', name: 'Certificates & Documents', description: 'Generate certificates and documents' },
      { key: 'communication', name: 'Communication', description: 'Send messages and notifications' },
      { key: 'health', name: 'Health & Wellness', description: 'Manage health records' },
      { key: 'admission', name: 'Admission & CRM', description: 'Manage admissions and inquiries' },
      { key: 'lms', name: 'Digital Learning (LMS)', description: 'Learning management system' },
      { key: 'social', name: 'Social Network', description: 'Internal social networking' },
      { key: 'transactionReports', name: 'Transaction Reports', description: 'Financial transaction reports' },
      { key: 'userManagement', name: 'User Management', description: 'Manage system users' },
      { key: 'rolePermissions', name: 'Role Permissions', description: 'Manage role-based access control' }
    ];

    res.json({
      status: 'success',
      data: { features }
    });
  } catch (error) {
    console.error('Error fetching available features:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch available features' });
  }
};

module.exports = {
  getAllRolePermissions,
  getRolePermissionByRole,
  upsertRolePermission,
  deleteRolePermission,
  initializeDefaultRolePermissions,
  getAvailableFeatures,
  getDefaultPermissions
};
