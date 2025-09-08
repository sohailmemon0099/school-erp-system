import React, { useState, useEffect } from 'react';
import { Award, Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import gradeService from '../services/gradeService';
import studentService from '../services/studentService';
import subjectService from '../services/subjectService';
import toast from 'react-hot-toast';

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    subjectId: '',
    examType: '',
    marks: '',
    maxMarks: '',
    grade: '',
    remarks: ''
  });

  // Load data
  useEffect(() => {
    loadGrades();
    loadStudents();
    loadSubjects();
  }, []);

  const loadGrades = async () => {
    try {
      setLoading(true);
      const response = await gradeService.getGrades();
      setGrades(response.data.grades || []);
    } catch (error) {
      console.error('Error loading grades:', error);
      toast.error('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await studentService.getStudents();
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await subjectService.getSubjects();
      setSubjects(response.data.subjects || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const handleAddGrade = async (e) => {
    e.preventDefault();
    try {
      await gradeService.createGrade(formData);
      toast.success('Grade added successfully');
      setShowAddModal(false);
      resetForm();
      loadGrades();
    } catch (error) {
      console.error('Error adding grade:', error);
      toast.error(error.response?.data?.message || 'Failed to add grade');
    }
  };

  const handleEditGrade = async (e) => {
    e.preventDefault();
    try {
      await gradeService.updateGrade(selectedGrade.id, formData);
      toast.success('Grade updated successfully');
      setShowEditModal(false);
      resetForm();
      loadGrades();
    } catch (error) {
      console.error('Error updating grade:', error);
      toast.error(error.response?.data?.message || 'Failed to update grade');
    }
  };

  const handleDeleteGrade = async (id) => {
    if (window.confirm('Are you sure you want to delete this grade record?')) {
      try {
        await gradeService.deleteGrade(id);
        toast.success('Grade record deleted successfully');
        loadGrades();
      } catch (error) {
        console.error('Error deleting grade:', error);
        toast.error('Failed to delete grade record');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      subjectId: '',
      examType: '',
      marks: '',
      maxMarks: '',
      grade: '',
      remarks: ''
    });
  };

  const openEditModal = (gradeRecord) => {
    setSelectedGrade(gradeRecord);
    setFormData({
      studentId: gradeRecord.studentId || '',
      subjectId: gradeRecord.subjectId || '',
      examType: gradeRecord.examType || '',
      marks: gradeRecord.marks || '',
      maxMarks: gradeRecord.maxMarks || '',
      grade: gradeRecord.grade || '',
      remarks: gradeRecord.remarks || ''
    });
    setShowEditModal(true);
  };

  const filteredGrades = grades.filter(grade =>
    grade.student?.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grade.student?.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grade.student?.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grade.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grade.examType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculatePercentage = (marks, maxMarks) => {
    if (!marks || !maxMarks) return 0;
    return Math.round((parseFloat(marks) / parseFloat(maxMarks)) * 100);
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
          <p className="text-gray-600">Manage student grades and exam results</p>
        </div>
        <button 
          className="btn btn-primary flex items-center"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Grade
        </button>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search grades..."
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
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Exam Type</th>
                  <th>Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-500">
                      <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No grade records found. Add your first grade to get started.</p>
                    </td>
                  </tr>
                ) : (
                  filteredGrades.map((grade) => {
                    const percentage = calculatePercentage(grade.marks, grade.maxMarks);
                    return (
                      <tr key={grade.id}>
                        <td>
                          {grade.student?.user?.firstName} {grade.student?.user?.lastName}
                          <br />
                          <small className="text-gray-500">{grade.student?.studentId}</small>
                        </td>
                        <td>{grade.subject?.name}</td>
                        <td>{grade.examType}</td>
                        <td>
                          {grade.marks} / {grade.maxMarks}
                        </td>
                        <td>
                          <span className={`font-semibold ${getGradeColor(percentage)}`}>
                            {percentage}%
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-primary">
                            {grade.grade || 'N/A'}
                          </span>
                        </td>
                        <td>{new Date(grade.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="flex space-x-2">
                            <button className="btn btn-sm btn-secondary">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => openEditModal(grade)}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteGrade(grade.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Grade Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Grade</h2>
            <form onSubmit={handleAddGrade} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                  <select
                    className="input w-full"
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.user?.firstName} {student.user?.lastName} ({student.studentId})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <select
                    className="input w-full"
                    value={formData.subjectId}
                    onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type *</label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.examType}
                  onChange={(e) => setFormData({...formData, examType: e.target.value})}
                  placeholder="e.g., Mid-term, Final, Quiz"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marks *</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={formData.marks}
                    onChange={(e) => setFormData({...formData, marks: e.target.value})}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks *</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={formData.maxMarks}
                    onChange={(e) => setFormData({...formData, maxMarks: e.target.value})}
                    required
                    min="1"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.grade}
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                    placeholder="e.g., A+, A, B+"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  className="input w-full"
                  rows="3"
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  placeholder="Optional remarks..."
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
                  Add Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Grade Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Edit Grade</h2>
            <form onSubmit={handleEditGrade} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                  <select
                    className="input w-full"
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.user?.firstName} {student.user?.lastName} ({student.studentId})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <select
                    className="input w-full"
                    value={formData.subjectId}
                    onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type *</label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.examType}
                  onChange={(e) => setFormData({...formData, examType: e.target.value})}
                  placeholder="e.g., Mid-term, Final, Quiz"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marks *</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={formData.marks}
                    onChange={(e) => setFormData({...formData, marks: e.target.value})}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks *</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={formData.maxMarks}
                    onChange={(e) => setFormData({...formData, maxMarks: e.target.value})}
                    required
                    min="1"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.grade}
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                    placeholder="e.g., A+, A, B+"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  className="input w-full"
                  rows="3"
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  placeholder="Optional remarks..."
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
                  Update Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grades;