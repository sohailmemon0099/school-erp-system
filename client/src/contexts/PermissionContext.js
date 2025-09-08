import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const PermissionContext = createContext();

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        // If user is not authenticated, clear permissions
        if (!isAuthenticated || !user) {
          setPermissions({});
          setUserRole(null);
          setLoading(false);
          return;
        }

        // Use the user data from AuthContext instead of making API call
        if (user && user.role) {
          console.log('User role from AuthContext:', user.role);
          setUserRole(user.role);

          // Set permissions based on role (client-side mapping)
          const rolePermissions = getRolePermissions(user.role);
          console.log('Role permissions:', rolePermissions);
          setPermissions(rolePermissions);
          setLoading(false);
          return;
        }

        // Fallback to API call only if user data is not available
        const token = localStorage.getItem('token');
        if (!token) {
          setPermissions({});
          setUserRole(null);
          setLoading(false);
          return;
        }

        // Get user info from token
        const userResponse = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          const userRole = userData.data.user.role;
          console.log('User role from API:', userRole);
          setUserRole(userRole);

          // Set permissions based on role (client-side mapping)
          const rolePermissions = getRolePermissions(userRole);
          console.log('Role permissions:', rolePermissions);
          setPermissions(rolePermissions);
        } else {
          // If token is invalid, clear permissions
          setPermissions({});
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setPermissions({});
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPermissions();
  }, [user?.id, isAuthenticated]); // Only depend on user ID, not the entire user object

  // Client-side role permissions mapping
  const getRolePermissions = (role) => {
    try {
      const permissions = {
      admin: {
        dashboard: { view: true, create: true, update: true, delete: true, export: true },
        students: { view: true, create: true, update: true, delete: true, export: true },
        teachers: { view: true, create: true, update: true, delete: true, export: true },
        classes: { view: true, create: true, update: true, delete: true, export: true },
        subjects: { view: true, create: true, update: true, delete: true, export: true },
        attendance: { view: true, create: true, update: true, delete: true, export: true },
        grades: { view: true, create: true, update: true, delete: true, export: true },
        fees: { view: true, create: true, update: true, delete: true, export: true },
        reports: { view: true, create: true, update: true, delete: true, export: true },
        examSchedules: { view: true, create: true, update: true, delete: true, export: true },
        hallTickets: { view: true, create: true, update: true, delete: true, export: true },
        library: { view: true, create: true, update: true, delete: true, export: true },
        transport: { view: true, create: true, update: true, delete: true, export: true },
        certificates: { view: true, create: true, update: true, delete: true, export: true },
        communication: { view: true, create: true, update: true, delete: true, export: true },
        health: { view: true, create: true, update: true, delete: true, export: true },
        admission: { view: true, create: true, update: true, delete: true, export: true },
        lms: { view: true, create: true, update: true, delete: true, export: true },
        social: { view: true, create: true, update: true, delete: true, export: true },
        transactionReports: { view: true, create: true, update: true, delete: true, export: true },
        userManagement: { view: true, create: true, update: true, delete: true, export: true },
        rolePermissions: { view: true, create: true, update: true, delete: true, export: true }
      },
      teacher: {
        dashboard: { view: true },
        lms: { view: true, create: true, update: true },
        grades: { view: true, create: true, update: true },
        social: { view: true, create: true, update: true },
        classes: { view: true },
        library: { view: true },
        students: { view: true },
        subjects: { view: true },
        attendance: { view: true, create: true, update: true },
        hallTickets: { view: true },
        examSchedules: { view: true, create: true, update: true },
        exams: { view: true, create: true, update: true },
        timetable: { view: true },
        classworks: { view: true, create: true, update: true },
        markDistributions: { view: true, create: true, update: true },
        attendanceReports: { view: true },
        // Explicitly deny access to modules teachers shouldn't see
        teachers: { view: false, create: false, update: false, delete: false, export: false },
        transport: { view: false, create: false, update: false, delete: false, export: false },
        certificates: { view: false, create: false, update: false, delete: false, export: false },
        communication: { view: false, create: false, update: false, delete: false, export: false },
        health: { view: false, create: false, update: false, delete: false, export: false },
        admission: { view: false, create: false, update: false, delete: false, export: false },
        fees: { view: false, create: false, update: false, delete: false, export: false },
        cheques: { view: false, create: false, update: false, delete: false, export: false },
        transactionLogs: { view: false, create: false, update: false, delete: false, export: false },
        reports: { view: false, create: false, update: false, delete: false, export: false },
        transactionReports: { view: false, create: false, update: false, delete: false, export: false },
        userManagement: { view: false, create: false, update: false, delete: false, export: false },
        rolePermissions: { view: false, create: false, update: false, delete: false, export: false },
        classTeacherAssignments: { view: false, create: false, update: false, delete: false, export: false }
      },
      student: {
        lms: { view: true },
        fees: { view: true },
        grades: { view: true },
        social: { view: true },
        library: { view: true },
        dashboard: { view: true },
        attendance: { view: true },
        hallTickets: { view: true },
        examSchedules: { view: true }
      },
      clark: {
        fees: { view: true, create: true, update: true },
        grades: { view: true, create: true, update: true },
        classes: { view: true, create: true, update: true },
        library: { view: true, create: true, update: true },
        reports: { view: true, export: true },
        students: { view: true, create: true, update: true },
        subjects: { view: true, create: true, update: true },
        teachers: { view: true, create: true, update: true },
        admission: { view: true, create: true, update: true },
        dashboard: { view: true },
        transport: { view: true, create: true, update: true },
        attendance: { view: true, create: true, update: true },
        hallTickets: { view: true, create: true, update: true },
        certificates: { view: true, create: true, update: true },
        communication: { view: true, create: true, update: true },
        examSchedules: { view: true, create: true, update: true },
        transactionReports: { view: true, create: true, update: true }
      },
      parent: {
        fees: { view: true },
        grades: { view: true },
        social: { view: true },
        library: { view: true },
        dashboard: { view: true },
        transport: { view: true },
        attendance: { view: true },
        hallTickets: { view: true },
        examSchedules: { view: true }
      },
      staff: {
        fees: { view: true },
        grades: { view: true },
        classes: { view: true },
        library: { view: true },
        reports: { view: true },
        students: { view: true },
        subjects: { view: true },
        teachers: { view: true },
        admission: { view: true },
        dashboard: { view: true },
        transport: { view: true },
        attendance: { view: true },
        hallTickets: { view: true },
        certificates: { view: true },
        communication: { view: true },
        examSchedules: { view: true },
        transactionReports: { view: true }
      }
    };

      return permissions[role] || {};
    } catch (error) {
      console.error('Error in getRolePermissions:', error);
      return {};
    }
  };

  const hasPermission = (module, action = 'view') => {
    if (!permissions[module]) return false;
    return permissions[module][action] === true;
  };

  const canView = (module) => {
    try {
      return hasPermission(module, 'view');
    } catch (error) {
      console.error('Error in canView:', error);
      return false;
    }
  };
  const canCreate = (module) => {
    try {
      return hasPermission(module, 'create');
    } catch (error) {
      console.error('Error in canCreate:', error);
      return false;
    }
  };
  const canUpdate = (module) => {
    try {
      return hasPermission(module, 'update');
    } catch (error) {
      console.error('Error in canUpdate:', error);
      return false;
    }
  };
  const canDelete = (module) => {
    try {
      return hasPermission(module, 'delete');
    } catch (error) {
      console.error('Error in canDelete:', error);
      return false;
    }
  };
  const canExport = (module) => {
    try {
      return hasPermission(module, 'export');
    } catch (error) {
      console.error('Error in canExport:', error);
      return false;
    }
  };

  const refreshPermissions = () => {
    if (user && isAuthenticated) {
      const rolePermissions = getRolePermissions(user.role);
      setPermissions(rolePermissions);
      setUserRole(user.role);
    }
  };

  const value = {
    permissions,
    userRole,
    loading,
    hasPermission,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    canExport,
    refreshPermissions
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};
