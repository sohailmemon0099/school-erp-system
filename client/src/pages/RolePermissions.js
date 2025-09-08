import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Save, 
  RefreshCw, 
  AlertCircle,
  Eye
} from 'lucide-react';

const RolePermissions = () => {
  const [rolePermissions, setRolePermissions] = useState([]);
  const [availableFeatures, setAvailableFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState('admin');
  const [permissions, setPermissions] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const roles = [
    { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-800', description: 'Full system access' },
    { value: 'teacher', label: 'Teacher', color: 'bg-blue-100 text-blue-800', description: 'Teaching and student management' },
    { value: 'student', label: 'Student', color: 'bg-green-100 text-green-800', description: 'Student portal access' },
    { value: 'clark', label: 'Clark', color: 'bg-purple-100 text-purple-800', description: 'Administrative support' },
    { value: 'parent', label: 'Parent', color: 'bg-yellow-100 text-yellow-800', description: 'Parent portal access' },
    { value: 'staff', label: 'Staff', color: 'bg-gray-100 text-gray-800', description: 'General staff access' }
  ];

  const permissionTypes = [
    { key: 'view', label: 'View', description: 'Can view this feature' },
    { key: 'create', label: 'Create', description: 'Can create new records' },
    { key: 'update', label: 'Update', description: 'Can modify existing records' },
    { key: 'delete', label: 'Delete', description: 'Can delete records' },
    { key: 'export', label: 'Export', description: 'Can export data' }
  ];

  useEffect(() => {
    fetchRolePermissions();
    fetchAvailableFeatures();
  }, []);

  useEffect(() => {
    if (rolePermissions.length > 0) {
      const currentRolePermission = rolePermissions.find(rp => rp.role === selectedRole);
      if (currentRolePermission) {
        setPermissions(currentRolePermission.permissions || {});
      } else {
        setPermissions({});
      }
    }
  }, [selectedRole, rolePermissions]);

  const fetchRolePermissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/role-permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRolePermissions(data.data.rolePermissions);
      }
    } catch (error) {
      console.error('Error fetching role permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableFeatures = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/role-permissions/features/available', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableFeatures(data.data.features);
      }
    } catch (error) {
      console.error('Error fetching available features:', error);
    }
  };

  const handlePermissionChange = (feature, permissionType, value) => {
    setPermissions(prev => ({
      ...prev,
      [feature]: {
        ...prev[feature],
        [permissionType]: value
      }
    }));
  };

  const handleFeatureToggle = (feature, value) => {
    const newPermissions = { ...permissions };
    if (value) {
      // Enable all permissions for this feature
      newPermissions[feature] = {
        view: true,
        create: false,
        update: false,
        delete: false,
        export: false
      };
    } else {
      // Remove all permissions for this feature
      delete newPermissions[feature];
    }
    setPermissions(newPermissions);
  };

  const handleSavePermissions = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/role-permissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: selectedRole,
          permissions: permissions,
          isActive: true
        })
      });

      if (response.ok) {
        setModalMessage('Permissions saved successfully!');
        setShowModal(true);
        fetchRolePermissions();
      } else {
        const error = await response.json();
        setModalMessage(`Error: ${error.message}`);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
      setModalMessage('Failed to save permissions');
      setShowModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleInitializeDefaults = async () => {
    if (!window.confirm('This will reset all role permissions to default values. Are you sure?')) {
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/role-permissions/initialize-defaults', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setModalMessage('Default permissions initialized successfully!');
        setShowModal(true);
        fetchRolePermissions();
      } else {
        const error = await response.json();
        setModalMessage(`Error: ${error.message}`);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error initializing defaults:', error);
      setModalMessage('Failed to initialize default permissions');
      setShowModal(true);
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.color : 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  const getRoleDescription = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.description : '';
  };

  const hasPermission = (feature, permissionType) => {
    return permissions[feature] && permissions[feature][permissionType] === true;
  };

  const hasAnyPermission = (feature) => {
    return permissions[feature] && Object.values(permissions[feature]).some(p => p === true);
  };

  const getPermissionCount = (role) => {
    const rolePermission = rolePermissions.find(rp => rp.role === role);
    if (!rolePermission || !rolePermission.permissions) return 0;
    return Object.keys(rolePermission.permissions).length;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="mr-2" />
            Role Permissions
          </h1>
          <p className="text-gray-600">Manage access permissions for different user roles</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleInitializeDefaults}
            disabled={saving}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
            Initialize Defaults
          </button>
          <button
            onClick={handleSavePermissions}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <Save className={`mr-2 h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
            Save Permissions
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Role Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Role</h3>
            <div className="space-y-3">
              {roles.map(role => {
                const permissionCount = getPermissionCount(role.value);
                const isSelected = selectedRole === role.value;
                
                return (
                  <button
                    key={role.value}
                    onClick={() => setSelectedRole(role.value)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(role.value)}`}>
                        {role.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {permissionCount} features
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Permissions Matrix */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Permissions for {getRoleLabel(selectedRole)}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {getRoleDescription(selectedRole)}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-center">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Create
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Update
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delete
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Export
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      All
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {availableFeatures.map((feature) => (
                    <tr key={feature.key} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {feature.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {feature.description}
                          </div>
                        </div>
                      </td>
                      {permissionTypes.map((permissionType) => (
                        <td key={permissionType.key} className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={hasPermission(feature.key, permissionType.key)}
                            onChange={(e) => handlePermissionChange(feature.key, permissionType.key, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            disabled={permissionType.key !== 'view' && !hasPermission(feature.key, 'view')}
                          />
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={hasAnyPermission(feature.key)}
                          onChange={(e) => handleFeatureToggle(feature.key, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Permission Legend */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Permission Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {permissionTypes.map((permissionType) => (
            <div key={permissionType.key} className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-4 w-4 border border-gray-300 rounded mt-0.5"></div>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">
                  {permissionType.label}
                </div>
                <div className="text-sm text-gray-500">
                  {permissionType.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Notification</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">{modalMessage}</p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePermissions;
