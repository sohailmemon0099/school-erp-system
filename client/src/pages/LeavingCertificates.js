import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  FileText, 
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { leavingCertificateService } from '../services/leavingCertificateService';
import studentService from '../services/studentService';

const LeavingCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({});

  const [formData, setFormData] = useState({
    studentId: '',
    leavingDate: new Date().toISOString().split('T')[0],
    reasonForLeaving: '',
    reasonDescription: '',
    lastClassAttended: '',
    academicYear: '2024-2025',
    conduct: 'good',
    attendancePercentage: '',
    feesPaid: false,
    libraryBooksReturned: false,
    noDuesCertificate: false,
    remarks: ''
  });

  const reasonOptions = [
    { value: 'transfer', label: 'Transfer to Another School' },
    { value: 'completion', label: 'Course Completion' },
    { value: 'withdrawal', label: 'Withdrawal' },
    { value: 'expulsion', label: 'Expulsion' },
    { value: 'migration', label: 'Migration' },
    { value: 'other', label: 'Other' }
  ];

  const conductOptions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'very_good', label: 'Very Good' },
    { value: 'good', label: 'Good' },
    { value: 'satisfactory', label: 'Satisfactory' },
    { value: 'unsatisfactory', label: 'Unsatisfactory' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { value: 'issued', label: 'Issued', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  const fetchCertificates = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(reasonFilter && { reasonForLeaving: reasonFilter })
      };
      
      const response = await leavingCertificateService.getLeavingCertificates(params);
      setCertificates(response.data.certificates);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, reasonFilter]);

  const fetchStudents = useCallback(async () => {
    try {
      const response = await studentService.getStudents({ limit: 1000 });
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await leavingCertificateService.getCertificateStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
    fetchStudents();
    fetchStats();
  }, [fetchCertificates, fetchStudents, fetchStats]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCertificate) {
        await leavingCertificateService.updateLeavingCertificate(editingCertificate.id, formData);
        toast.success('Certificate updated successfully');
      } else {
        await leavingCertificateService.createLeavingCertificate(formData);
        toast.success('Certificate created successfully');
      }
      
      setShowModal(false);
      setShowEditModal(false);
      setEditingCertificate(null);
      resetForm();
      fetchCertificates();
      fetchStats();
    } catch (error) {
      console.error('Error saving certificate:', error);
      toast.error(error.response?.data?.message || 'Failed to save certificate');
    }
  };

  const handleEdit = (certificate) => {
    setEditingCertificate(certificate);
    setFormData({
      studentId: certificate.studentId,
      leavingDate: certificate.leavingDate,
      reasonForLeaving: certificate.reasonForLeaving,
      reasonDescription: certificate.reasonDescription || '',
      lastClassAttended: certificate.lastClassAttended,
      academicYear: certificate.academicYear,
      conduct: certificate.conduct,
      attendancePercentage: certificate.attendancePercentage || '',
      feesPaid: certificate.feesPaid,
      libraryBooksReturned: certificate.libraryBooksReturned,
      noDuesCertificate: certificate.noDuesCertificate,
      remarks: certificate.remarks || ''
    });
    setShowEditModal(true);
  };

  const handleIssue = async (certificate) => {
    try {
      await leavingCertificateService.issueLeavingCertificate(certificate.id);
      toast.success('Certificate issued successfully');
      fetchCertificates();
      fetchStats();
    } catch (error) {
      console.error('Error issuing certificate:', error);
      toast.error(error.response?.data?.message || 'Failed to issue certificate');
    }
  };

  const handleDelete = async (certificate) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      try {
        await leavingCertificateService.deleteLeavingCertificate(certificate.id);
        toast.success('Certificate deleted successfully');
        fetchCertificates();
        fetchStats();
      } catch (error) {
        console.error('Error deleting certificate:', error);
        toast.error(error.response?.data?.message || 'Failed to delete certificate');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      leavingDate: new Date().toISOString().split('T')[0],
      reasonForLeaving: '',
      reasonDescription: '',
      lastClassAttended: '',
      academicYear: '2024-2025',
      conduct: 'good',
      attendancePercentage: '',
      feesPaid: false,
      libraryBooksReturned: false,
      noDuesCertificate: false,
      remarks: ''
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'issued': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : 'bg-gray-100 text-gray-800';
  };

  const canIssue = (certificate) => {
    return certificate.feesPaid && certificate.libraryBooksReturned && certificate.noDuesCertificate;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leaving Certificates</h1>
          <p className="text-gray-600">Manage student leaving certificates</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Certificate
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Certificates</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCertificates || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Issued</p>
              <p className="text-2xl font-bold text-gray-900">{stats.issuedCertificates || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingCertificates || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">This Year</p>
              <p className="text-2xl font-bold text-gray-900">{new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Reasons</option>
            {reasonOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setReasonFilter('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leaving Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No certificates found
                  </td>
                </tr>
              ) : (
                certificates.map((certificate) => (
                  <tr key={certificate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {certificate.certificateNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {certificate.student?.user?.firstName} {certificate.student?.user?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {certificate.student?.studentId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {reasonOptions.find(r => r.value === certificate.reasonForLeaving)?.label || certificate.reasonForLeaving}
                      </div>
                      {certificate.reasonDescription && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {certificate.reasonDescription}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(certificate.status)}`}>
                        {getStatusIcon(certificate.status)}
                        <span className="ml-1">
                          {statusOptions.find(s => s.value === certificate.status)?.label || certificate.status}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(certificate.leavingDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(certificate)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {certificate.status === 'draft' && (
                          <button
                            onClick={() => handleIssue(certificate)}
                            className={`${canIssue(certificate) ? 'text-green-600 hover:text-green-900' : 'text-gray-400 cursor-not-allowed'}`}
                            title={canIssue(certificate) ? "Issue Certificate" : "Cannot issue - requirements not met"}
                            disabled={!canIssue(certificate)}
                          >
                            {canIssue(certificate) ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(certificate)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                          disabled={certificate.status === 'issued'}
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
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCertificate ? 'Edit Certificate' : 'Add New Certificate'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student *
                    </label>
                    <select
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Student</option>
                      {students.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.user?.firstName} {student.user?.lastName} ({student.studentId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Leaving Date *
                    </label>
                    <input
                      type="date"
                      value={formData.leavingDate}
                      onChange={(e) => setFormData({ ...formData, leavingDate: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Leaving *
                    </label>
                    <select
                      value={formData.reasonForLeaving}
                      onChange={(e) => setFormData({ ...formData, reasonForLeaving: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Reason</option>
                      {reasonOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Class Attended *
                    </label>
                    <input
                      type="text"
                      value={formData.lastClassAttended}
                      onChange={(e) => setFormData({ ...formData, lastClassAttended: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 10th Grade"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Year *
                    </label>
                    <input
                      type="text"
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="YYYY-YYYY"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Conduct
                    </label>
                    <select
                      value={formData.conduct}
                      onChange={(e) => setFormData({ ...formData, conduct: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {conductOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attendance Percentage
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.attendancePercentage}
                      onChange={(e) => setFormData({ ...formData, attendancePercentage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 85.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason Description
                  </label>
                  <textarea
                    value={formData.reasonDescription}
                    onChange={(e) => setFormData({ ...formData, reasonDescription: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional details about the reason for leaving..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Requirements
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.feesPaid}
                        onChange={(e) => setFormData({ ...formData, feesPaid: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Fees Paid</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.libraryBooksReturned}
                        onChange={(e) => setFormData({ ...formData, libraryBooksReturned: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Library Books Returned</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.noDuesCertificate}
                        onChange={(e) => setFormData({ ...formData, noDuesCertificate: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">No Dues Certificate</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional remarks..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setShowEditModal(false);
                      setEditingCertificate(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingCertificate ? 'Update' : 'Create'}
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

export default LeavingCertificates;
