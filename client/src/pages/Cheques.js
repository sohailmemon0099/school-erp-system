import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Building2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import chequeService from '../services/chequeService';
import studentService from '../services/studentService';
import { format } from 'date-fns';

const Cheques = () => {
  const [cheques, setCheques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentType, setSelectedPaymentType] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2024-2025');
  const [selectedBankName, setSelectedBankName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedCheque, setSelectedCheque] = useState(null);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({});

  // Form state for creating cheques
  const [formData, setFormData] = useState({
    chequeNumber: '',
    bankName: '',
    branchName: '',
    accountNumber: '',
    accountHolderName: '',
    amount: '',
    issueDate: '',
    dueDate: '',
    paymentType: 'fee_payment',
    studentId: '',
    academicYear: '2024-2025',
    remarks: ''
  });

  // Status update form
  const [statusFormData, setStatusFormData] = useState({
    status: '',
    bouncedReason: '',
    remarks: ''
  });

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'yellow', icon: Clock },
    { value: 'cleared', label: 'Cleared', color: 'green', icon: CheckCircle },
    { value: 'bounced', label: 'Bounced', color: 'red', icon: XCircle },
    { value: 'cancelled', label: 'Cancelled', color: 'gray', icon: AlertTriangle },
    { value: 'expired', label: 'Expired', color: 'orange', icon: AlertTriangle }
  ];

  const paymentTypes = [
    { value: 'fee_payment', label: 'Fee Payment' },
    { value: 'transport_payment', label: 'Transport Payment' },
    { value: 'other', label: 'Other' }
  ];

  const academicYears = ['2023-2024', '2024-2025', '2025-2026'];

  // Load data
  const loadCheques = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: selectedStatus,
        paymentType: selectedPaymentType,
        academicYear: selectedAcademicYear,
        bankName: selectedBankName
      };

      const response = await chequeService.getCheques(params);
      setCheques(response.data.cheques);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      toast.error('Failed to load cheques');
      console.error('Error loading cheques:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedStatus, selectedPaymentType, selectedAcademicYear, selectedBankName]);

  const loadStats = useCallback(async () => {
    try {
      const response = await chequeService.getChequeStats({
        academicYear: selectedAcademicYear
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [selectedAcademicYear]);

  const loadStudents = useCallback(async () => {
    try {
      const response = await studentService.getStudents({ limit: 100 });
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  }, []);

  useEffect(() => {
    loadCheques();
  }, [loadCheques]);

  useEffect(() => {
    loadStats();
    loadStudents();
  }, [loadStats, loadStudents]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle filters
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'status':
        setSelectedStatus(value);
        break;
      case 'paymentType':
        setSelectedPaymentType(value);
        break;
      case 'academicYear':
        setSelectedAcademicYear(value);
        break;
      case 'bankName':
        setSelectedBankName(value);
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedPaymentType('');
    setSelectedAcademicYear('2024-2025');
    setSelectedBankName('');
    setCurrentPage(1);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle status form changes
  const handleStatusInputChange = (e) => {
    const { name, value } = e.target;
    setStatusFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create cheque
  const handleCreateCheque = async (e) => {
    e.preventDefault();
    try {
      await chequeService.createCheque(formData);
      toast.success('Cheque created successfully');
      setShowCreateModal(false);
      setFormData({
        chequeNumber: '',
        bankName: '',
        branchName: '',
        accountNumber: '',
        accountHolderName: '',
        amount: '',
        issueDate: '',
        dueDate: '',
        paymentType: 'fee_payment',
        studentId: '',
        academicYear: '2024-2025',
        remarks: ''
      });
      loadCheques();
    } catch (error) {
      toast.error(error.message || 'Failed to create cheque');
    }
  };

  // View cheque
  const handleViewCheque = async (cheque) => {
    try {
      const response = await chequeService.getChequeById(cheque.id);
      setSelectedCheque(response.data.cheque);
      setShowViewModal(true);
    } catch (error) {
      toast.error('Failed to load cheque details');
    }
  };

  // Update cheque status
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await chequeService.updateChequeStatus(selectedCheque.id, statusFormData);
      toast.success('Cheque status updated successfully');
      setShowStatusModal(false);
      setStatusFormData({
        status: '',
        bouncedReason: '',
        remarks: ''
      });
      loadCheques();
    } catch (error) {
      toast.error(error.message || 'Failed to update cheque status');
    }
  };

  // Delete cheque
  const handleDeleteCheque = async (cheque) => {
    if (window.confirm('Are you sure you want to delete this cheque?')) {
      try {
        await chequeService.deleteCheque(cheque.id);
        toast.success('Cheque deleted successfully');
        loadCheques();
      } catch (error) {
        toast.error('Failed to delete cheque');
      }
    }
  };

  // Open status modal
  const openStatusModal = (cheque) => {
    setSelectedCheque(cheque);
    setStatusFormData({
      status: cheque.status,
      bouncedReason: '',
      remarks: ''
    });
    setShowStatusModal(true);
  };

  // Pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cheque Management</h1>
          <p className="text-gray-600">Manage and track cheque payments</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Cheque
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CreditCard className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Cheques</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCheques || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cleared</p>
              <p className="text-2xl font-bold text-gray-900">{stats.clearedCheques || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingCheques || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bounced</p>
              <p className="text-2xl font-bold text-gray-900">{stats.bouncedCheques || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Amount Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalAmount || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cleared Amount</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.clearedAmount || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.pendingAmount || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bounced Amount</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.bouncedAmount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search cheques..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
            <select
              value={selectedPaymentType}
              onChange={(e) => handleFilterChange('paymentType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {paymentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => handleFilterChange('academicYear', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
            <input
              type="text"
              placeholder="Bank name..."
              value={selectedBankName}
              onChange={(e) => handleFilterChange('bankName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Cheques Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading cheques...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cheque Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bank Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cheques.map((cheque) => {
                    const statusInfo = getStatusInfo(cheque.status);
                    const StatusIcon = statusInfo.icon;
                    const isExpired = new Date(cheque.dueDate) < new Date() && cheque.status === 'pending';
                    
                    return (
                      <tr key={cheque.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{cheque.chequeNumber}</div>
                            <div className="text-sm text-gray-500">{cheque.accountHolderName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{cheque.bankName}</div>
                            <div className="text-sm text-gray-500">{cheque.branchName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">₹{cheque.amount}</div>
                          <div className="text-sm text-gray-500">{paymentTypes.find(t => t.value === cheque.paymentType)?.label}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">Issue: {format(new Date(cheque.issueDate), 'MMM dd, yyyy')}</div>
                            <div className={`text-sm ${isExpired ? 'text-red-600' : 'text-gray-500'}`}>
                              Due: {format(new Date(cheque.dueDate), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {cheque.student ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {cheque.student.user.firstName} {cheque.student.user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{cheque.student.user.email}</div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewCheque(cheque)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Cheque"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openStatusModal(cheque)}
                              className="text-green-600 hover:text-green-900"
                              title="Update Status"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCheque(cheque)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Cheque"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
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
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => handlePageChange(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === i + 1
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
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
          </>
        )}
      </div>

      {/* Create Cheque Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Cheque</h3>
              <form onSubmit={handleCreateCheque} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cheque Number</label>
                    <input
                      type="text"
                      name="chequeNumber"
                      value={formData.chequeNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter cheque number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter bank name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                  <input
                    type="text"
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter branch name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter account number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder</label>
                    <input
                      type="text"
                      name="accountHolderName"
                      value={formData.accountHolderName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter account holder name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                    <input
                      type="date"
                      name="issueDate"
                      value={formData.issueDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                  <select
                    name="paymentType"
                    value={formData.paymentType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {paymentTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                  <select
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Student (Optional)</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.user.firstName} {student.user.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter remarks (optional)"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                  >
                    Create Cheque
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Cheque Modal */}
      {showViewModal && selectedCheque && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Cheque Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cheque Number</label>
                    <p className="text-sm text-gray-900">{selectedCheque.chequeNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                    <p className="text-sm text-gray-900">{selectedCheque.bankName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Branch Name</label>
                    <p className="text-sm text-gray-900">{selectedCheque.branchName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Number</label>
                    <p className="text-sm text-gray-900">{selectedCheque.accountNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Holder</label>
                    <p className="text-sm text-gray-900">{selectedCheque.accountHolderName}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <p className="text-sm text-gray-900">₹{selectedCheque.amount}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Issue Date</label>
                    <p className="text-sm text-gray-900">{format(new Date(selectedCheque.issueDate), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                    <p className="text-sm text-gray-900">{format(new Date(selectedCheque.dueDate), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getStatusInfo(selectedCheque.status).color}-100 text-${getStatusInfo(selectedCheque.status).color}-800`}>
                      {getStatusInfo(selectedCheque.status).label}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Type</label>
                    <p className="text-sm text-gray-900">{paymentTypes.find(t => t.value === selectedCheque.paymentType)?.label}</p>
                  </div>
                </div>
              </div>
              {selectedCheque.remarks && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Remarks</label>
                  <p className="text-sm text-gray-900">{selectedCheque.remarks}</p>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => openStatusModal(selectedCheque)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700"
                >
                  Update Status
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedCheque && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Cheque Status</h3>
              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={statusFormData.status}
                    onChange={handleStatusInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
                {statusFormData.status === 'bounced' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bounced Reason</label>
                    <textarea
                      name="bouncedReason"
                      value={statusFormData.bouncedReason}
                      onChange={handleStatusInputChange}
                      rows={3}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter bounced reason"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                    name="remarks"
                    value={statusFormData.remarks}
                    onChange={handleStatusInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter remarks (optional)"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700"
                  >
                    Update Status
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

export default Cheques;
