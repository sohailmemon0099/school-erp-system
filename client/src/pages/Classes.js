import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import classService from '../services/classService';
import toast from 'react-hot-toast';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    capacity: '',
    roomNumber: '',
    academicYear: ''
  });

  // Load classes
  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const response = await classService.getClasses();
      setClasses(response.data.classes || []);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    try {
      console.log('Form data being sent:', formData);
      await classService.createClass(formData);
      toast.success('Class added successfully');
      setShowAddModal(false);
      resetForm();
      loadClasses();
    } catch (error) {
      console.error('Error adding class:', error);
      toast.error(error.response?.data?.message || 'Failed to add class');
    }
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    try {
      const response = await classService.updateClass(selectedClass.id, formData);
      console.log('Update response:', response);
      
      // Force immediate UI update
      setRefreshKey(prev => prev + 1);
      
      // Update the classes list immediately with the new data
      setClasses(prevClasses => 
        prevClasses.map(cls => 
          cls.id === selectedClass.id 
            ? { ...cls, ...formData, updatedAt: new Date().toISOString() }
            : cls
        )
      );
      
      toast.success('Class updated successfully');
      setShowEditModal(false);
      resetForm();
      
      // Also reload from server to ensure data consistency
      setTimeout(async () => {
        await loadClasses();
      }, 100);
      
      console.log('Class updated and UI refreshed');
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error(error.response?.data?.message || 'Failed to update class');
    }
  };

  const handleDeleteClass = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await classService.deleteClass(id);
        toast.success('Class deleted successfully');
        loadClasses();
      } catch (error) {
        console.error('Error deleting class:', error);
        toast.error('Failed to delete class');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      section: '',
      capacity: '',
      roomNumber: '',
      academicYear: ''
    });
  };

  const openEditModal = (classItem) => {
    setSelectedClass(classItem);
    setFormData({
      name: classItem.name || '',
      section: classItem.section || '',
      capacity: classItem.capacity || '',
      roomNumber: classItem.roomNumber || '',
      academicYear: classItem.academicYear || ''
    });
    setShowEditModal(true);
  };

  const filteredClasses = classes.filter(classItem =>
    classItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.academicYear?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-600">Manage class information and records</p>
        </div>
        <button 
          className="btn btn-primary flex items-center"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Class
        </button>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search classes..."
                className="pl-10 input w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-secondary flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <table key={refreshKey} className="table">
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Section</th>
                  <th>Capacity</th>
                  <th>Room Number</th>
                  <th>Academic Year</th>
                  <th>Students</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No classes found. Add your first class to get started.</p>
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map((classItem) => (
                    <tr key={classItem.id}>
                      <td>{classItem.name}</td>
                      <td>{classItem.section}</td>
                      <td>{classItem.capacity}</td>
                      <td>{classItem.roomNumber || 'N/A'}</td>
                      <td>{classItem.academicYear}</td>
                      <td>{classItem.students?.length || 0}</td>
                      <td>
                        <span className={`badge ${classItem.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {classItem.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button className="btn btn-sm btn-secondary">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => openEditModal(classItem)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteClass(classItem.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add New Class</h2>
            <form onSubmit={handleAddClass} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    required
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                  placeholder="e.g., 2024-2025"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Edit Class</h2>
            <form onSubmit={handleEditClass} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    required
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                  placeholder="e.g., 2024-2025"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;