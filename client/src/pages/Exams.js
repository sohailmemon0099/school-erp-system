import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import examService from '../services/examService';
// import studentService from '../services/studentService';
import classService from '../services/classService';
import subjectService from '../services/subjectService';
import { format } from 'date-fns';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [newExam, setNewExam] = useState({
    name: '',
    description: '',
    examType: 'unit_test',
    classId: '',
    subjectId: '',
    academicYear: '2024-2025',
    semester: '1',
    startDate: '',
    endDate: '',
    duration: 60,
    maxMarks: 100,
    passingMarks: 35,
    venue: '',
    instructions: '',
    hallTicketRequired: true,
    hallTicketReleaseDate: '',
    resultDeclarationDate: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    examType: '',
    status: '',
    classId: '',
    academicYear: '2024-2025'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalResults: 0,
  });

  const fetchExams = useCallback(async (page = pagination.page, limit = pagination.limit, search = searchTerm, filterParams = filters) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search,
        ...filterParams
      };
      const response = await examService.getExams(params);
      setExams(response.data.exams);
      setPagination({
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.pages,
        totalResults: response.data.pagination.total,
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch exams');
      toast.error(err.message || 'Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, filters]);

  const fetchClasses = useCallback(async () => {
    try {
      console.log('Fetching classes...');
      const response = await classService.getClasses({ limit: 1000 });
      console.log('Classes response:', response.data.classes?.length, 'classes');
      setClasses(response.data.classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await subjectService.getSubjects({ limit: 1000 });
      setSubjects(response.data.subjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  }, []);

  useEffect(() => {
    fetchExams();
    fetchClasses();
    fetchSubjects();
  }, [fetchExams, fetchClasses, fetchSubjects]);

  // Debug classes state
  useEffect(() => {
    console.log('Classes state updated:', classes.length, 'classes');
    if (classes.length > 0) {
      console.log('First class:', classes[0]);
    }
  }, [classes]);

  const handleAddExam = async () => {
    try {
      console.log('Creating exam with data:', newExam);
      console.log('Subject ID being sent:', newExam.subjectId);
      console.log('Available subjects:', subjects.map(s => ({ id: s.id, name: s.name })));
      
      // Validate subject ID if provided
      if (newExam.subjectId && !subjects.find(s => s.id === newExam.subjectId)) {
        console.error('Invalid subject ID:', newExam.subjectId);
        toast.error('Please select a valid subject');
        return;
      }
      
      const result = await examService.createExam(newExam);
      console.log('Exam creation result:', result);
      toast.success('Exam created successfully!');
      setShowAddModal(false);
      setNewExam({
        name: '',
        description: '',
        examType: 'unit_test',
        classId: '',
        subjectId: '',
        academicYear: '2024-2025',
        semester: '1',
        startDate: '',
        endDate: '',
        duration: 60,
        maxMarks: 100,
        passingMarks: 35,
        venue: '',
        instructions: '',
        hallTicketRequired: true,
        hallTicketReleaseDate: '',
        resultDeclarationDate: ''
      });
      fetchExams();
    } catch (err) {
      console.error('Exam creation error:', err);
      console.error('Error details:', err.response?.data);
      toast.error(err.response?.data?.message || 'Failed to create exam');
    }
  };

  const handleEditExam = (exam) => {
    setCurrentExam({
      ...exam,
      startDate: exam.startDate ? format(new Date(exam.startDate), 'yyyy-MM-dd\'T\'HH:mm') : '',
      endDate: exam.endDate ? format(new Date(exam.endDate), 'yyyy-MM-dd\'T\'HH:mm') : '',
      hallTicketReleaseDate: exam.hallTicketReleaseDate ? format(new Date(exam.hallTicketReleaseDate), 'yyyy-MM-dd\'T\'HH:mm') : '',
      resultDeclarationDate: exam.resultDeclarationDate ? format(new Date(exam.resultDeclarationDate), 'yyyy-MM-dd\'T\'HH:mm') : '',
    });
    setShowEditModal(true);
  };

  const handleUpdateExam = async () => {
    try {
      await examService.updateExam(currentExam.id, currentExam);
      toast.success('Exam updated successfully!');
      setShowEditModal(false);
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update exam');
    }
  };

  const handleDeleteExam = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await examService.deleteExam(id);
        toast.success('Exam deleted successfully!');
        fetchExams();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete exam');
      }
    }
  };

  const handleViewDetails = (exam) => {
    setCurrentExam(exam);
    setShowDetailsModal(true);
  };

  const getClassName = (classId) => {
    const classItem = classes.find(c => c.id === classId);
    return classItem ? `${classItem.name} - ${classItem.section}` : 'N/A';
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'N/A';
  };

  const handlePageChange = (newPage) => {
    fetchExams(newPage, pagination.limit, searchTerm, filters);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    fetchExams(1, pagination.limit, e.target.value, filters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchExams(1, pagination.limit, searchTerm, newFilters);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExamTypeColor = (type) => {
    switch (type) {
      case 'unit_test': return 'bg-purple-100 text-purple-800';
      case 'mid_term': return 'bg-blue-100 text-blue-800';
      case 'final_exam': return 'bg-red-100 text-red-800';
      case 'quarterly': return 'bg-green-100 text-green-800';
      case 'half_yearly': return 'bg-yellow-100 text-yellow-800';
      case 'annual': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && exams.length === 0) {
    return <div className="flex justify-center items-center h-screen text-lg font-semibold">Loading Exams...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-lg font-semibold text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <BookOpen className="mr-3" /> Exam Management
      </h1>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search exams..."
              className="form-input mt-1 block w-64 rounded-md border-gray-300 shadow-sm pl-10"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          <select
            className="form-select mt-1 block rounded-md border-gray-300 shadow-sm"
            value={filters.examType}
            onChange={(e) => handleFilterChange('examType', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="unit_test">Unit Test</option>
            <option value="mid_term">Mid Term</option>
            <option value="final_exam">Final Exam</option>
            <option value="quarterly">Quarterly</option>
            <option value="half_yearly">Half Yearly</option>
            <option value="annual">Annual</option>
          </select>
          <select
            className="form-select mt-1 block rounded-md border-gray-300 shadow-sm"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="mr-2" /> Add New Exam
        </button>
      </div>

      {exams.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">No exams found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exam.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getExamTypeColor(exam.examType)}`}>
                      {exam.examType.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getClassName(exam.classId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getSubjectName(exam.subjectId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {exam.startDate ? format(new Date(exam.startDate), 'MMM dd, yyyy HH:mm') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.duration} min</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(exam.status)}`}>
                      {exam.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleViewDetails(exam)} className="text-blue-600 hover:text-blue-900 mr-3">
                      <Eye className="inline-block w-5 h-5" />
                    </button>
                    <button onClick={() => handleEditExam(exam)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                      <Edit className="inline-block w-5 h-5" />
                    </button>
                    <button onClick={() => handleDeleteExam(exam.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="inline-block w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.totalResults)}</span> of{' '}
                <span className="font-medium">{pagination.totalResults}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pagination.page === i + 1
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </nav>
      )}

      {/* Add Exam Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Exam</h2>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              console.log('Form submitted, calling handleAddExam');
              handleAddExam(); 
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Exam Name</label>
                  <input
                    type="text"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={newExam.name}
                    onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Exam Type</label>
                  <select
                    className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={newExam.examType}
                    onChange={(e) => setNewExam({ ...newExam, examType: e.target.value })}
                    required
                  >
                    <option value="unit_test">Unit Test</option>
                    <option value="mid_term">Mid Term</option>
                    <option value="final_exam">Final Exam</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="half_yearly">Half Yearly</option>
                    <option value="annual">Annual</option>
                    <option value="competitive">Competitive</option>
                    <option value="entrance">Entrance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Class</label>
                  <select
                    className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={newExam.classId}
                    onChange={(e) => {
                      console.log('Class selected:', e.target.value);
                      setNewExam({ ...newExam, classId: e.target.value });
                    }}
                    required
                  >
                    <option value="">Select Class ({classes.length} available)</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name} - {cls.section}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject (Optional)</label>
                  <select
                    className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={newExam.subjectId}
                    onChange={(e) => {
                      console.log('Subject selected:', e.target.value);
                      setNewExam({ ...newExam, subjectId: e.target.value });
                    }}
                  >
                    <option value="">Select Subject ({subjects.length} available)</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                  <input
                    type="text"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={newExam.academicYear}
                    onChange={(e) => setNewExam({ ...newExam, academicYear: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Semester</label>
                  <select
                    className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={newExam.semester}
                    onChange={(e) => setNewExam({ ...newExam, semester: e.target.value })}
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="3">Semester 3</option>
                    <option value="4">Semester 4</option>
                    <option value="5">Semester 5</option>
                    <option value="6">Semester 6</option>
                    <option value="7">Semester 7</option>
                    <option value="8">Semester 8</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={newExam.startDate}
                    onChange={(e) => setNewExam({ ...newExam, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={newExam.endDate}
                    onChange={(e) => setNewExam({ ...newExam, endDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                  <input
                    type="number"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={newExam.duration}
                    onChange={(e) => setNewExam({ ...newExam, duration: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Marks</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={newExam.maxMarks}
                    onChange={(e) => setNewExam({ ...newExam, maxMarks: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Passing Marks</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={newExam.passingMarks}
                    onChange={(e) => setNewExam({ ...newExam, passingMarks: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Venue</label>
                  <input
                    type="text"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={newExam.venue}
                    onChange={(e) => setNewExam({ ...newExam, venue: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hall Ticket Required</label>
                  <select
                    className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={newExam.hallTicketRequired}
                    onChange={(e) => setNewExam({ ...newExam, hallTicketRequired: e.target.value === 'true' })}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hall Ticket Release Date</label>
                  <input
                    type="datetime-local"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={newExam.hallTicketReleaseDate}
                    onChange={(e) => setNewExam({ ...newExam, hallTicketReleaseDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Result Declaration Date</label>
                  <input
                    type="datetime-local"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={newExam.resultDeclarationDate}
                    onChange={(e) => setNewExam({ ...newExam, resultDeclarationDate: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="form-textarea mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    rows="3"
                    value={newExam.description}
                    onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Instructions</label>
                  <textarea
                    className="form-textarea mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    rows="4"
                    value={newExam.instructions}
                    onChange={(e) => setNewExam({ ...newExam, instructions: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  onClick={() => console.log('Create Exam button clicked')}
                >
                  Create Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Exam Modal */}
      {showEditModal && currentExam && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Exam</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateExam(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Exam Name</label>
                  <input
                    type="text"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={currentExam.name}
                    onChange={(e) => setCurrentExam({ ...currentExam, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Exam Type</label>
                  <select
                    className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={currentExam.examType}
                    onChange={(e) => setCurrentExam({ ...currentExam, examType: e.target.value })}
                    required
                  >
                    <option value="unit_test">Unit Test</option>
                    <option value="mid_term">Mid Term</option>
                    <option value="final_exam">Final Exam</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="half_yearly">Half Yearly</option>
                    <option value="annual">Annual</option>
                    <option value="competitive">Competitive</option>
                    <option value="entrance">Entrance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={currentExam.status}
                    onChange={(e) => setCurrentExam({ ...currentExam, status: e.target.value })}
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                  <input
                    type="text"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={currentExam.academicYear}
                    onChange={(e) => setCurrentExam({ ...currentExam, academicYear: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={currentExam.startDate}
                    onChange={(e) => setCurrentExam({ ...currentExam, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={currentExam.endDate}
                    onChange={(e) => setCurrentExam({ ...currentExam, endDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                  <input
                    type="number"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={currentExam.duration}
                    onChange={(e) => setCurrentExam({ ...currentExam, duration: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Marks</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={currentExam.maxMarks}
                    onChange={(e) => setCurrentExam({ ...currentExam, maxMarks: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Passing Marks</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={currentExam.passingMarks}
                    onChange={(e) => setCurrentExam({ ...currentExam, passingMarks: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Venue</label>
                  <input
                    type="text"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={currentExam.venue || ''}
                    onChange={(e) => setCurrentExam({ ...currentExam, venue: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hall Ticket Required</label>
                  <select
                    className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={currentExam.hallTicketRequired}
                    onChange={(e) => setCurrentExam({ ...currentExam, hallTicketRequired: e.target.value === 'true' })}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hall Ticket Release Date</label>
                  <input
                    type="datetime-local"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={currentExam.hallTicketReleaseDate || ''}
                    onChange={(e) => setCurrentExam({ ...currentExam, hallTicketReleaseDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Result Declaration Date</label>
                  <input
                    type="datetime-local"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={currentExam.resultDeclarationDate || ''}
                    onChange={(e) => setCurrentExam({ ...currentExam, resultDeclarationDate: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="form-textarea mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    rows="3"
                    value={currentExam.description || ''}
                    onChange={(e) => setCurrentExam({ ...currentExam, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Instructions</label>
                  <textarea
                    className="form-textarea mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    rows="4"
                    value={currentExam.instructions || ''}
                    onChange={(e) => setCurrentExam({ ...currentExam, instructions: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Update Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exam Details Modal */}
      {showDetailsModal && currentExam && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Exam Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {currentExam.name}</p>
                  <p><span className="font-medium">Type:</span> {currentExam.examType.replace('_', ' ').toUpperCase()}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(currentExam.status)}`}>
                      {currentExam.status.toUpperCase()}
                    </span>
                  </p>
                  <p><span className="font-medium">Class:</span> {getClassName(currentExam.classId)}</p>
                  <p><span className="font-medium">Subject:</span> {getSubjectName(currentExam.subjectId)}</p>
                  <p><span className="font-medium">Academic Year:</span> {currentExam.academicYear}</p>
                  <p><span className="font-medium">Semester:</span> {currentExam.semester}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Schedule & Details</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Start Date:</span> {currentExam.startDate ? format(new Date(currentExam.startDate), 'MMM dd, yyyy HH:mm') : 'N/A'}</p>
                  <p><span className="font-medium">End Date:</span> {currentExam.endDate ? format(new Date(currentExam.endDate), 'MMM dd, yyyy HH:mm') : 'N/A'}</p>
                  <p><span className="font-medium">Duration:</span> {currentExam.duration} minutes</p>
                  <p><span className="font-medium">Max Marks:</span> {currentExam.maxMarks}</p>
                  <p><span className="font-medium">Passing Marks:</span> {currentExam.passingMarks}</p>
                  <p><span className="font-medium">Venue:</span> {currentExam.venue || 'N/A'}</p>
                  <p><span className="font-medium">Hall Ticket Required:</span> {currentExam.hallTicketRequired ? 'Yes' : 'No'}</p>
                </div>
              </div>
              {currentExam.description && (
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{currentExam.description}</p>
                </div>
              )}
              {currentExam.instructions && (
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{currentExam.instructions}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;
