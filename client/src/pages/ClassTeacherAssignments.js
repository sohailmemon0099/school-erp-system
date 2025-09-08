import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Edit, Trash2, Save, X, AlertCircle, CheckCircle, User, BookOpen, GraduationCap } from 'lucide-react';

const ClassTeacherAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [academicYear, setAcademicYear] = useState('2024-2025');

  // Form state
  const [formData, setFormData] = useState({
    classId: '',
    teacherId: '',
    subjectId: '',
    role: 'subject_teacher',
    academicYear: '2024-2025'
  });

  // Fetch assignments
  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/class-teacher-assignments?academicYear=${academicYear}&search=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.data.assignments || []);
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch assignments' });
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setMessage({ type: 'error', text: 'Error fetching assignments' });
    } finally {
      setLoading(false);
    }
  }, [academicYear, searchTerm]);

  // Fetch classes
  const fetchClasses = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching classes with token:', token ? 'exists' : 'missing');
      const response = await fetch('/api/classes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Classes API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Classes data received:', data.data.classes?.length, 'classes');
        setClasses(data.data.classes || []);
      } else {
        console.error('Failed to fetch classes, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  }, []);

  // Fetch teachers
  const fetchTeachers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching teachers with token:', token ? 'exists' : 'missing');
      const response = await fetch('/api/users?role=teacher&limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Teachers API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Teachers data received:', data.data.users?.length, 'teachers');
        setTeachers(data.data.users || []);
      } else {
        console.error('Failed to fetch teachers, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  }, []);

  // Fetch subjects
  const fetchSubjects = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching subjects with token:', token ? 'exists' : 'missing');
      const response = await fetch('/api/subjects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Subjects API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Subjects data received:', data.data.subjects?.length, 'subjects');
        setSubjects(data.data.subjects || []);
      } else {
        console.error('Failed to fetch subjects, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    console.log('Initializing data...');
    fetchAssignments();
    fetchClasses();
    fetchTeachers();
    fetchSubjects();
  }, [fetchAssignments, fetchClasses, fetchTeachers, fetchSubjects]);

  // Debug state changes
  useEffect(() => {
    console.log('Current state - Teachers:', teachers.length, 'Classes:', classes.length, 'Subjects:', subjects.length);
  }, [teachers, classes, subjects]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle create/edit assignment
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const url = modalType === 'create' 
        ? '/api/class-teacher-assignments'
        : `/api/class-teacher-assignments/${selectedAssignment.id}`;
      
      const method = modalType === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Assignment ${modalType === 'create' ? 'created' : 'updated'} successfully` });
        setShowModal(false);
        setFormData({
          classId: '',
          teacherId: '',
          subjectId: '',
          role: 'subject_teacher',
          academicYear: '2024-2025'
        });
        fetchAssignments();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to save assignment' });
      }
    } catch (error) {
      console.error('Error saving assignment:', error);
      setMessage({ type: 'error', text: 'Error saving assignment' });
    } finally {
      setSaving(false);
    }
  };

  // Handle edit assignment
  const handleEdit = (assignment) => {
    setSelectedAssignment(assignment);
    setModalType('edit');
    setFormData({
      classId: assignment.classId,
      teacherId: assignment.teacherId,
      subjectId: assignment.subjectId || '',
      role: assignment.role,
      academicYear: assignment.academicYear
    });
    setShowModal(true);
  };

  // Handle delete assignment
  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/class-teacher-assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Assignment deleted successfully' });
        fetchAssignments();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to delete assignment' });
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setMessage({ type: 'error', text: 'Error deleting assignment' });
    }
  };

  // Handle toggle active status
  const handleToggleStatus = async (assignment) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/class-teacher-assignments/${assignment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isActive: !assignment.isActive
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Assignment ${assignment.isActive ? 'deactivated' : 'activated'} successfully` });
        fetchAssignments();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to update assignment' });
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      setMessage({ type: 'error', text: 'Error updating assignment' });
    }
  };

  // Get class name by ID
  const getClassName = (classId) => {
    const classObj = classes.find(c => c.id === classId);
    return classObj ? `${classObj.name} - ${classObj.section}` : 'Unknown Class';
  };

  // Get teacher name by ID
  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown Teacher';
  };

  // Get subject name by ID
  const getSubjectName = (subjectId) => {
    if (!subjectId) return 'All Subjects';
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Users className="h-8 w-8 mr-3 text-blue-600" />
          Class-Teacher Assignments
        </h1>
        <p className="text-gray-600 mt-2">Manage class assignments for teachers</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-md flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2025-2026">2025-2026</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by class, teacher, or subject..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setModalType('create');
                setSelectedAssignment(null);
                setFormData({
                  classId: '',
                  teacherId: '',
                  subjectId: '',
                  role: 'subject_teacher',
                  academicYear: academicYear
                });
                setShowModal(true);
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Assignment
            </button>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Assignments</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading assignments...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <GraduationCap className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getClassName(assignment.classId)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {assignment.academicYear}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-green-600 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {getTeacherName(assignment.teacherId)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 text-purple-600 mr-2" />
                        <div className="text-sm text-gray-900">
                          {getSubjectName(assignment.subjectId)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        assignment.role === 'class_teacher' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {assignment.role === 'class_teacher' ? 'Class Teacher' : 'Subject Teacher'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(assignment)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          assignment.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {assignment.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(assignment)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(assignment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {assignments.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No assignments found for the selected academic year.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalType === 'create' ? 'Add Assignment' : 'Edit Assignment'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class *
                    </label>
                    <select
                      name="classId"
                      value={formData.classId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} - {cls.section}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teacher *
                    </label>
                    <select
                      name="teacherId"
                      value={formData.teacherId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <select
                      name="subjectId"
                      value={formData.subjectId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Subjects (Class Teacher)</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="subject_teacher">Subject Teacher</option>
                      <option value="class_teacher">Class Teacher</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Academic Year *
                    </label>
                    <select
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="2024-2025">2024-2025</option>
                      <option value="2023-2024">2023-2024</option>
                      <option value="2025-2026">2025-2026</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {modalType === 'create' ? 'Create' : 'Update'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassTeacherAssignments;
