const { RolePermission } = require('../models');

// Middleware to check if user has permission for a specific feature
const checkPermission = (feature, permissionType = 'view') => {
  return async (req, res, next) => {
    try {
      // Skip permission check for admin users
      if (req.user.role === 'admin') {
        return next();
      }

      // Get role permissions
      const rolePermission = await RolePermission.findOne({
        where: { role: req.user.role }
      });

      if (!rolePermission || !rolePermission.permissions) {
        return res.status(403).json({
          status: 'error',
          message: 'No permissions configured for this role'
        });
      }

      const permissions = rolePermission.permissions;

      // Check if user has permission for the specific feature and permission type
      if (!permissions[feature] || !permissions[feature][permissionType]) {
        return res.status(403).json({
          status: 'error',
          message: `Access denied. You don't have ${permissionType} permission for ${feature}`
        });
      }

      next();
    } catch (error) {
      console.error('Error checking permissions:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error checking permissions'
      });
    }
  };
};

// Middleware to check multiple permissions (user needs ALL permissions)
const checkMultiplePermissions = (permissions) => {
  return async (req, res, next) => {
    try {
      // Skip permission check for admin users
      if (req.user.role === 'admin') {
        return next();
      }

      // Get role permissions
      const rolePermission = await RolePermission.findOne({
        where: { role: req.user.role }
      });

      if (!rolePermission || !rolePermission.permissions) {
        return res.status(403).json({
          status: 'error',
          message: 'No permissions configured for this role'
        });
      }

      const userPermissions = rolePermission.permissions;

      // Check if user has ALL required permissions
      for (const permission of permissions) {
        const { feature, permissionType = 'view' } = permission;
        
        if (!userPermissions[feature] || !userPermissions[feature][permissionType]) {
          return res.status(403).json({
            status: 'error',
            message: `Access denied. You don't have ${permissionType} permission for ${feature}`
          });
        }
      }

      next();
    } catch (error) {
      console.error('Error checking multiple permissions:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error checking permissions'
      });
    }
  };
};

// Middleware to check if user has ANY of the specified permissions
const checkAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      // Skip permission check for admin users
      if (req.user.role === 'admin') {
        return next();
      }

      // Get role permissions
      const rolePermission = await RolePermission.findOne({
        where: { role: req.user.role }
      });

      if (!rolePermission || !rolePermission.permissions) {
        return res.status(403).json({
          status: 'error',
          message: 'No permissions configured for this role'
        });
      }

      const userPermissions = rolePermission.permissions;

      // Check if user has ANY of the required permissions
      for (const permission of permissions) {
        const { feature, permissionType = 'view' } = permission;
        
        if (userPermissions[feature] && userPermissions[feature][permissionType]) {
          return next();
        }
      }

      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You don\'t have sufficient permissions'
      });
    } catch (error) {
      console.error('Error checking any permission:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error checking permissions'
      });
    }
  };
};

// Helper function to get user permissions (for frontend use)
const getUserPermissions = async (userId, userRole) => {
  try {
    // Admin has all permissions
    if (userRole === 'admin') {
      return {
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
      };
    }

    // Get role permissions from database
    const rolePermission = await RolePermission.findOne({
      where: { role: userRole }
    });

    return rolePermission ? rolePermission.permissions : {};
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return {};
  }
};

module.exports = {
  checkPermission,
  checkMultiplePermissions,
  checkAnyPermission,
  getUserPermissions
};
