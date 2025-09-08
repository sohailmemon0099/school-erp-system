const { sequelize, RolePermission } = require('../models');

const initializeRolePermissions = async () => {
  try {
    console.log('🔄 Initializing role permissions...');

    // Default permissions for each role
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

    const roles = ['admin', 'teacher', 'student', 'clark', 'parent', 'staff'];
    const results = [];

    for (const role of roles) {
      const permissions = defaultPermissions[role];
      
      const [rolePermission, created] = await RolePermission.upsert({
        role,
        permissions,
        isActive: true
      }, {
        returning: true
      });

      results.push({
        role,
        created,
        permissionCount: Object.keys(permissions).length
      });

      console.log(`✅ ${created ? 'Created' : 'Updated'} permissions for ${role} role (${Object.keys(permissions).length} features)`);
    }

    console.log('🎉 Role permissions initialized successfully!');
    console.log('\n📊 Summary:');
    results.forEach(result => {
      console.log(`   ${result.role}: ${result.created ? 'Created' : 'Updated'} (${result.permissionCount} features)`);
    });

  } catch (error) {
    console.error('❌ Error initializing role permissions:', error);
    throw error;
  }
};

// Run the initialization if this script is executed directly
if (require.main === module) {
  initializeRolePermissions()
    .then(() => {
      console.log('✅ Role permissions initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Role permissions initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeRolePermissions };
