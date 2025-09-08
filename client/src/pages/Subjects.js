
import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import subjectService from '../services/subjectService';
import classService from '../services/classService';
import toast from 'react-hot-toast';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    credits: '',
    classId: ''
  });

  // Load data
  useEffect(() => {
    loadSubjects();
    loadClasses();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const response = await subjectService.getSubjects();
      setSubjects(response.data.subjects || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const response = await classService.getClasses();
      setClasses(response.data.classes || []);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      await subjectService.createSubject(formData);
      toast.success('Subject added successfully');
      setShowAddModal(false);
      resetForm();
      loadSubjects();
    } catch (error) {
      console.error('Error adding subject:', error);
      toast.error(error.response?.data?.message || 'Failed to add subject');
    }
  };

  const handleEditSubject = async (e) => {
    e.preventDefault();
    try {
      const response = await subjectService.updateSubject(selectedSubject.id, formData);
      console.log('Update response:', response);
      
      // Force immediate UI update
      setRefreshKey(prev => prev + 1);
      
      // Update the subjects list immediately with the new data
      setSubjects(prevSubjects => 
        prevSubjects.map(subject => 
          subject.id === selectedSubject.id 
            ? { ...subject, ...formData, updatedAt: new Date().toISOString() }
            : subject
        )
      );
      
      toast.success('Subject updated successfully');
      setShowEditModal(false);
      resetForm();
      
      // Also reload from server to ensure data consistency
      setTimeout(async () => {
        await loadSubjects();
      }, 100);
      
      console.log('Subject updated and UI refreshed');
    } catch (error) {
      console.error('Error updating subject:', error);
      toast.error(error.response?.data?.message || 'Failed to update subject');
    }
  };

  const handleDeleteSubject = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await subjectService.deleteSubject(id);
        toast.success('Subject deleted successfully');
        loadSubjects();
      } catch (error) {
        console.error('Error deleting subject:', error);
        toast.error('Failed to delete subject');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      credits: '',
      classId: ''
    });
  };

  const openEditModal = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name || '',
      code: subject.code || '',
      description: subject.description || '',
      credits: subject.credits || '',
      classId: subject.classId || ''
    });
    setShowEditModal(true);
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-600">Manage subject information and curriculum</p>
        </div>
        <button 
          className="btn btn-primary flex items-center"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Subject
        </button>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search subjects..."
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
                  <th>Subject Code</th>
                  <th>Subject Name</th>
                  <th>Description</th>
                  <th>Credits</th>
                  <th>Class</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No subjects found. Add your first subject to get started.</p>
                    </td>
                  </tr>
                ) : (
                  filteredSubjects.map((subject) => (
                    <tr key={subject.id}>
                      <td>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {subject.code}
                        </span>
                      </td>
                      <td className="font-medium">{subject.name}</td>
                      <td className="max-w-xs truncate">{subject.description || 'N/A'}</td>
                      <td>{subject.credits || 'N/A'}</td>
                      <td>{subject.class?.name || 'N/A'}</td>
                      <td>
                        <span className={`badge ${subject.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {subject.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button className="btn btn-sm btn-secondary">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => openEditModal(subject)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteSubject(subject.id)}
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

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add New Subject</h2>
            <form onSubmit={handleAddSubject} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code *</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="input w-full"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Subject description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={formData.credits}
                    onChange={(e) => setFormData({...formData, credits: e.target.value})}
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    className="input w-full"
                    value={formData.classId}
                    onChange={(e) => setFormData({...formData, classId: e.target.value})}
                  >
                    <option value="">Select Class (Optional)</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} {cls.section}
                      </option>
                    ))}
                  </select>
                </div>
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
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Edit Subject</h2>
            <form onSubmit={handleEditSubject} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code *</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="input w-full"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Subject description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={formData.credits}
                    onChange={(e) => setFormData({...formData, credits: e.target.value})}
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    className="input w-full"
                    value={formData.classId}
                    onChange={(e) => setFormData({...formData, classId: e.target.value})}
                  >
                    <option value="">Select Class (Optional)</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} {cls.section}
                      </option>
                    ))}
                  </select>
                </div>
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
                  Update Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;