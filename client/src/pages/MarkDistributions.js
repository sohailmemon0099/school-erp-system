import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
  Eye,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Settings,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import markDistributionService from '../services/markDistributionService';
import classService from '../services/classService';
import subjectService from '../services/subjectService';
import { format } from 'date-fns';

const MarkDistributions = () => {
  const [distributions, setDistributions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    classId: '',
    subjectId: '',
    academicYear: '2024-2025',
    semester: '',
    theoryMarks: 0,
    practicalMarks: 0,
    internalMarks: 0,
    projectMarks: 0,
    assignmentMarks: 0,
    attendanceMarks: 0,
    totalMarks: 100,
    gradeSystem: 'percentage',
    passingPercentage: 35,
    theoryWeightage: 0,
    practicalWeightage: 0,
    internalWeightage: 0,
    projectWeightage: 0,
    assignmentWeightage: 0,
    attendanceWeightage: 0,
    allowGraceMarks: false,
    graceMarksLimit: 0,
    roundingMethod: 'round'
  });

  const fetchDistributions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        classId: selectedClass,
        subjectId: selectedSubject,
        academicYear
      };
      
      const response = await markDistributionService.getMarkDistributions(params);
      setDistributions(response.data);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      toast.error('Failed to fetch mark distributions');
      console.error('Error fetching distributions:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedClass, selectedSubject, academicYear]);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await classService.getClasses();
      console.log('Classes response:', response);
      setClasses(response.data?.classes || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await subjectService.getSubjects();
      console.log('Subjects response:', response);
      setSubjects(response.data?.subjects || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    }
  }, []);

  useEffect(() => {
    fetchDistributions();
  }, [fetchDistributions]);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, [fetchClasses, fetchSubjects]);

  const handleAddDistribution = async (e) => {
    e.preventDefault();
    try {
      await markDistributionService.createMarkDistribution(formData);
      toast.success('Mark distribution created successfully');
      setShowAddModal(false);
      resetForm();
      fetchDistributions();
    } catch (error) {
      toast.error(error.message || 'Failed to create mark distribution');
    }
  };

  const handleEditDistribution = async (e) => {
    e.preventDefault();
    try {
      await markDistributionService.updateMarkDistribution(selectedDistribution.id, formData);
      toast.success('Mark distribution updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchDistributions();
    } catch (error) {
      toast.error(error.message || 'Failed to update mark distribution');
    }
  };

  const handleDeleteDistribution = async (id) => {
    if (window.confirm('Are you sure you want to delete this mark distribution?')) {
      try {
        await markDistributionService.deleteMarkDistribution(id);
        toast.success('Mark distribution deleted successfully');
        fetchDistributions();
      } catch (error) {
        toast.error(error.message || 'Failed to delete mark distribution');
      }
    }
  };

  const handleCalculateGrades = async () => {
    try {
      const data = {
        classId: selectedDistribution.classId,
        subjectId: selectedDistribution.subjectId,
        academicYear: selectedDistribution.academicYear,
        semester: selectedDistribution.semester
      };
      
      await markDistributionService.calculateGrades(data);
      toast.success('Grades calculated successfully');
      setShowCalculateModal(false);
    } catch (error) {
      toast.error(error.message || 'Failed to calculate grades');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      classId: '',
      subjectId: '',
      academicYear: '2024-2025',
      semester: '',
      theoryMarks: 0,
      practicalMarks: 0,
      internalMarks: 0,
      projectMarks: 0,
      assignmentMarks: 0,
      attendanceMarks: 0,
      totalMarks: 100,
      gradeSystem: 'percentage',
      passingPercentage: 35,
      theoryWeightage: 0,
      practicalWeightage: 0,
      internalWeightage: 0,
      projectWeightage: 0,
      assignmentWeightage: 0,
      attendanceWeightage: 0,
      allowGraceMarks: false,
      graceMarksLimit: 0,
      roundingMethod: 'round'
    });
  };

  const openEditModal = (distribution) => {
    setSelectedDistribution(distribution);
    setFormData({
      name: distribution.name,
      description: distribution.description || '',
      classId: distribution.classId,
      subjectId: distribution.subjectId || '',
      academicYear: distribution.academicYear,
      semester: distribution.semester || '',
      theoryMarks: distribution.theoryMarks,
      practicalMarks: distribution.practicalMarks,
      internalMarks: distribution.internalMarks,
      projectMarks: distribution.projectMarks,
      assignmentMarks: distribution.assignmentMarks,
      attendanceMarks: distribution.attendanceMarks,
      totalMarks: distribution.totalMarks,
      gradeSystem: distribution.gradeSystem,
      passingPercentage: distribution.passingPercentage,
      theoryWeightage: distribution.theoryWeightage,
      practicalWeightage: distribution.practicalWeightage,
      internalWeightage: distribution.internalWeightage,
      projectWeightage: distribution.projectWeightage,
      assignmentWeightage: distribution.assignmentWeightage,
      attendanceWeightage: distribution.attendanceWeightage,
      allowGraceMarks: distribution.allowGraceMarks,
      graceMarksLimit: distribution.graceMarksLimit,
      roundingMethod: distribution.roundingMethod
    });
    setShowEditModal(true);
  };

  const openDetailsModal = (distribution) => {
    setSelectedDistribution(distribution);
    setShowDetailsModal(true);
  };

  const openCalculateModal = (distribution) => {
    setSelectedDistribution(distribution);
    setShowCalculateModal(true);
  };

  const calculateTotalMarks = () => {
    const total = formData.theoryMarks + formData.practicalMarks + formData.internalMarks + 
                 formData.projectMarks + formData.assignmentMarks + formData.attendanceMarks;
    setFormData(prev => ({ ...prev, totalMarks: total }));
  };

  const calculateTotalWeightage = () => {
    const total = formData.theoryWeightage + formData.practicalWeightage + formData.internalWeightage + 
                 formData.projectWeightage + formData.assignmentWeightage + formData.attendanceWeightage;
    return total;
  };

  useEffect(() => {
    calculateTotalMarks();
  }, [formData.theoryMarks, formData.practicalMarks, formData.internalMarks, 
      formData.projectMarks, formData.assignmentMarks, formData.attendanceMarks]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mark Distributions</h1>
          <p className="text-gray-600 mt-1">Manage grade calculation systems and mark distributions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Distribution
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search distributions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Classes</option>
              {classes && classes.length > 0 ? classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} {cls.section}
                </option>
              )) : <option value="">No classes available</option>}
            </select>
          </div>
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Subjects</option>
              {subjects && subjects.length > 0 ? subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              )) : <option value="">No subjects available</option>}
            </select>
          </div>
          <div>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2025-2026">2025-2026</option>
            </select>
          </div>
          <div>
            <button
              onClick={fetchDistributions}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Distributions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Passing %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Academic Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : distributions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No mark distributions found
                  </td>
                </tr>
              ) : (
                distributions.map((distribution) => (
                  <tr key={distribution.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {distribution.name}
                        </div>
                        {distribution.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {distribution.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {distribution.class ? `${distribution.class.name} ${distribution.class.section}` : 'All Classes'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {distribution.subject ? distribution.subject.name : 'All Subjects'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {distribution.totalMarks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {distribution.passingPercentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {distribution.academicYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openDetailsModal(distribution)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(distribution)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openCalculateModal(distribution)}
                          className="text-green-600 hover:text-green-900"
                          title="Calculate Grades"
                        >
                          <Calculator className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDistribution(distribution.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
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
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {showAddModal ? 'Add Mark Distribution' : 'Edit Mark Distribution'}
              </h3>
              
              <form onSubmit={showAddModal ? handleAddDistribution : handleEditDistribution}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class *
                    </label>
                    <select
                      required
                      value={formData.classId}
                      onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Class</option>
                      {classes && classes.length > 0 ? classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} {cls.section}
                        </option>
                      )) : <option value="">No classes available</option>}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <select
                      value={formData.subjectId}
                      onChange={(e) => setFormData(prev => ({ ...prev, subjectId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Subjects</option>
                      {subjects && subjects.length > 0 ? subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      )) : <option value="">No subjects available</option>}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Year *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.academicYear}
                      onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Component Marks */}
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Component Marks</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Theory Marks
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.theoryMarks}
                        onChange={(e) => setFormData(prev => ({ ...prev, theoryMarks: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Practical Marks
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.practicalMarks}
                        onChange={(e) => setFormData(prev => ({ ...prev, practicalMarks: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Internal Marks
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.internalMarks}
                        onChange={(e) => setFormData(prev => ({ ...prev, internalMarks: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Marks
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.projectMarks}
                        onChange={(e) => setFormData(prev => ({ ...prev, projectMarks: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assignment Marks
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.assignmentMarks}
                        onChange={(e) => setFormData(prev => ({ ...prev, assignmentMarks: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Attendance Marks
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.attendanceMarks}
                        onChange={(e) => setFormData(prev => ({ ...prev, attendanceMarks: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Marks: {formData.totalMarks}
                    </label>
                  </div>
                </div>

                {/* Weightages */}
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-900 mb-2">
                    Component Weightages (Total: {calculateTotalWeightage()}%)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Theory Weightage (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.theoryWeightage}
                        onChange={(e) => setFormData(prev => ({ ...prev, theoryWeightage: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Practical Weightage (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.practicalWeightage}
                        onChange={(e) => setFormData(prev => ({ ...prev, practicalWeightage: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Internal Weightage (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.internalWeightage}
                        onChange={(e) => setFormData(prev => ({ ...prev, internalWeightage: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Weightage (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.projectWeightage}
                        onChange={(e) => setFormData(prev => ({ ...prev, projectWeightage: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assignment Weightage (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.assignmentWeightage}
                        onChange={(e) => setFormData(prev => ({ ...prev, assignmentWeightage: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Attendance Weightage (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.attendanceWeightage}
                        onChange={(e) => setFormData(prev => ({ ...prev, attendanceWeightage: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Grade Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Passing Percentage
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.passingPercentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, passingPercentage: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rounding Method
                    </label>
                    <select
                      value={formData.roundingMethod}
                      onChange={(e) => setFormData(prev => ({ ...prev, roundingMethod: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="round">Round</option>
                      <option value="ceil">Ceiling</option>
                      <option value="floor">Floor</option>
                      <option value="truncate">Truncate</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="allowGraceMarks"
                    checked={formData.allowGraceMarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, allowGraceMarks: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allowGraceMarks" className="ml-2 block text-sm text-gray-900">
                    Allow Grace Marks
                  </label>
                </div>

                {formData.allowGraceMarks && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grace Marks Limit
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={formData.graceMarksLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, graceMarksLimit: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {showAddModal ? 'Create' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedDistribution && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Mark Distribution Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedDistribution.name}</h4>
                  {selectedDistribution.description && (
                    <p className="text-gray-600 mt-1">{selectedDistribution.description}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Class:</span>
                    <p className="text-sm text-gray-900">
                      {selectedDistribution.class ? `${selectedDistribution.class.name} ${selectedDistribution.class.section}` : 'All Classes'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Subject:</span>
                    <p className="text-sm text-gray-900">
                      {selectedDistribution.subject ? selectedDistribution.subject.name : 'All Subjects'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Academic Year:</span>
                    <p className="text-sm text-gray-900">{selectedDistribution.academicYear}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Total Marks:</span>
                    <p className="text-sm text-gray-900">{selectedDistribution.totalMarks}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Passing Percentage:</span>
                    <p className="text-sm text-gray-900">{selectedDistribution.passingPercentage}%</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Grade System:</span>
                    <p className="text-sm text-gray-900 capitalize">{selectedDistribution.gradeSystem}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Component Marks:</h5>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>Theory: {selectedDistribution.theoryMarks}</div>
                    <div>Practical: {selectedDistribution.practicalMarks}</div>
                    <div>Internal: {selectedDistribution.internalMarks}</div>
                    <div>Project: {selectedDistribution.projectMarks}</div>
                    <div>Assignment: {selectedDistribution.assignmentMarks}</div>
                    <div>Attendance: {selectedDistribution.attendanceMarks}</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Component Weightages:</h5>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>Theory: {selectedDistribution.theoryWeightage}%</div>
                    <div>Practical: {selectedDistribution.practicalWeightage}%</div>
                    <div>Internal: {selectedDistribution.internalWeightage}%</div>
                    <div>Project: {selectedDistribution.projectWeightage}%</div>
                    <div>Assignment: {selectedDistribution.assignmentWeightage}%</div>
                    <div>Attendance: {selectedDistribution.attendanceWeightage}%</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calculate Grades Modal */}
      {showCalculateModal && selectedDistribution && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Calculate Grades
              </h3>
              
              <div className="mb-4">
                <p className="text-gray-600">
                  Are you sure you want to calculate grades for the following distribution?
                </p>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p><strong>Name:</strong> {selectedDistribution.name}</p>
                  <p><strong>Class:</strong> {selectedDistribution.class ? `${selectedDistribution.class.name} ${selectedDistribution.class.section}` : 'All Classes'}</p>
                  <p><strong>Subject:</strong> {selectedDistribution.subject ? selectedDistribution.subject.name : 'All Subjects'}</p>
                  <p><strong>Academic Year:</strong> {selectedDistribution.academicYear}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCalculateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCalculateGrades}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  Calculate Grades
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkDistributions;
