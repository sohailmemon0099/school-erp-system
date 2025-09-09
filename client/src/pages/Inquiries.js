import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Phone, Mail, UserCheck } from 'lucide-react';
import inquiryService from '../services/inquiryService';
import classService from '../services/classService';
import toast from 'react-hot-toast';

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [formData, setFormData] = useState({
    // Student Information
    studentFirstName: '',
    studentLastName: '',
    studentDateOfBirth: '',
    studentGender: '',
    studentBloodGroup: '',
    studentPreviousSchool: '',
    studentPreviousClass: '',
    
    // Parent Information
    parentFirstName: '',
    parentLastName: '',
    parentPhone: '',
    parentEmail: '',
    parentOccupation: '',
    parentAddress: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    
    // Academic Information
    desiredClass: '',
    desiredAcademicYear: '2024-2025',
    preferredSubjects: '',
    
    // Inquiry Details
    inquirySource: 'walk-in',
    inquiryNotes: '',
    status: 'new'
  });

  // Load inquiries and classes
  useEffect(() => {
    loadInquiries();
    loadClasses();
  }, []);

  const loadInquiries = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Inquiries Component: Starting to load inquiries...');
      console.log('🔍 Inquiries Component: Search term:', searchTerm);
      console.log('🔍 Inquiries Component: Status filter:', statusFilter);
      
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      
      console.log('🔍 Inquiries Component: API params:', params);
      const response = await inquiryService.getInquiries(params);
      console.log('✅ Inquiries Component: API response:', response);
      
      const inquiriesData = response.data.inquiries || [];
      console.log('📊 Inquiries Component: Setting inquiries:', inquiriesData.length, 'items');
      setInquiries(inquiriesData);
    } catch (error) {
      console.error('❌ Inquiries Component: Error loading inquiries:', error);
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  const loadClasses = async () => {
    try {
      const response = await classService.getClasses();
      setClasses(response.data.classes || []);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const handleAddInquiry = async (e) => {
    e.preventDefault();
    try {
      await inquiryService.createInquiry(formData);
      toast.success('Inquiry created successfully');
      setShowAddModal(false);
      resetForm();
      loadInquiries();
    } catch (error) {
      console.error('Error adding inquiry:', error);
      toast.error(error.response?.data?.message || 'Failed to add inquiry');
    }
  };


  const handleDeleteInquiry = async (id) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      try {
        await inquiryService.deleteInquiry(id);
        toast.success('Inquiry deleted successfully');
        loadInquiries();
      } catch (error) {
        console.error('Error deleting inquiry:', error);
        toast.error('Failed to delete inquiry');
      }
    }
  };

  const handleConvertToStudent = async (e) => {
    e.preventDefault();
    try {
      const convertData = {
        classId: formData.classId,
        transportRoute: formData.transportRoute || null
      };
      
      await inquiryService.convertInquiryToStudent(selectedInquiry.id, convertData);
      toast.success('Inquiry converted to student successfully');
      setShowConvertModal(false);
      resetForm();
      loadInquiries();
    } catch (error) {
      console.error('Error converting inquiry:', error);
      toast.error(error.response?.data?.message || 'Failed to convert inquiry');
    }
  };

  const resetForm = () => {
    setFormData({
      studentFirstName: '',
      studentLastName: '',
      studentDateOfBirth: '',
      studentGender: '',
      studentBloodGroup: '',
      studentPreviousSchool: '',
      studentPreviousClass: '',
      parentFirstName: '',
      parentLastName: '',
      parentPhone: '',
      parentEmail: '',
      parentOccupation: '',
      parentAddress: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      desiredClass: '',
      desiredAcademicYear: '2024-2025',
      preferredSubjects: '',
      inquirySource: 'walk-in',
      inquiryNotes: '',
      status: 'new'
    });
  };

  const handleEditInquiry = (inquiry) => {
    setSelectedInquiry(inquiry);
    setFormData({
      studentFirstName: inquiry.studentFirstName || '',
      studentLastName: inquiry.studentLastName || '',
      studentDateOfBirth: inquiry.studentDateOfBirth || '',
      studentGender: inquiry.studentGender || '',
      studentBloodGroup: inquiry.studentBloodGroup || '',
      studentPreviousSchool: inquiry.studentPreviousSchool || '',
      studentPreviousClass: inquiry.studentPreviousClass || '',
      parentFirstName: inquiry.parentFirstName || '',
      parentLastName: inquiry.parentLastName || '',
      parentPhone: inquiry.parentPhone || '',
      parentEmail: inquiry.parentEmail || '',
      parentOccupation: inquiry.parentOccupation || '',
      parentAddress: inquiry.parentAddress || '',
      emergencyContactName: inquiry.emergencyContactName || '',
      emergencyContactPhone: inquiry.emergencyContactPhone || '',
      emergencyContactRelation: inquiry.emergencyContactRelation || '',
      desiredClass: inquiry.desiredClass || '',
      desiredAcademicYear: inquiry.desiredAcademicYear || '2024-2025',
      preferredSubjects: inquiry.preferredSubjects || '',
      inquirySource: inquiry.inquirySource || 'walk-in',
      inquiryNotes: inquiry.inquiryNotes || '',
      status: inquiry.status || 'new'
    });
    setShowEditModal(true);
  };

  const handleUpdateInquiry = async (e) => {
    e.preventDefault();
    try {
      await inquiryService.updateInquiry(selectedInquiry.id, formData);
      toast.success('Inquiry updated successfully');
      setShowEditModal(false);
      resetForm();
      loadInquiries();
    } catch (error) {
      console.error('Error updating inquiry:', error);
      toast.error(error.response?.data?.message || 'Failed to update inquiry');
    }
  };


  const openConvertModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setFormData({
      classId: '',
      transportRoute: ''
    });
    setShowConvertModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-yellow-100 text-yellow-800',
      'follow-up': 'bg-orange-100 text-orange-800',
      'interested': 'bg-green-100 text-green-800',
      'not-interested': 'bg-red-100 text-red-800',
      'admitted': 'bg-purple-100 text-purple-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquiry Management</h1>
          <p className="text-gray-600">Manage student inquiries and admissions</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Inquiry
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search inquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="follow-up">Follow-up</option>
            <option value="interested">Interested</option>
            <option value="not-interested">Not Interested</option>
            <option value="admitted">Admitted</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inquiry ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Desired Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    Loading inquiries...
                  </td>
                </tr>
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No inquiries found
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {inquiry.inquiryId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {inquiry.studentFirstName} {inquiry.studentLastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {inquiry.studentGender} • {formatDate(inquiry.studentDateOfBirth)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {inquiry.parentFirstName} {inquiry.parentLastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {inquiry.parentOccupation || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{inquiry.parentPhone}</span>
                      </div>
                      {inquiry.parentEmail && (
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{inquiry.parentEmail}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{inquiry.desiredClass}</div>
                      <div className="text-sm text-gray-500">{inquiry.desiredAcademicYear}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inquiry.status)}`}>
                        {inquiry.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(inquiry.inquiryDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditInquiry(inquiry)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Inquiry"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {inquiry.status === 'interested' && !inquiry.admissionConfirmed && (
                          <button
                            onClick={() => openConvertModal(inquiry)}
                            className="text-green-600 hover:text-green-900"
                            title="Convert to Student"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteInquiry(inquiry.id)}
                          className="text-red-600 hover:text-red-900"
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
      </div>

      {/* Add Inquiry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Inquiry</h2>
            <form onSubmit={handleAddInquiry} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Student Information */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold mb-2">Student Information</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentFirstName}
                    onChange={(e) => setFormData({...formData, studentFirstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentLastName}
                    onChange={(e) => setFormData({...formData, studentLastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.studentDateOfBirth}
                    onChange={(e) => setFormData({...formData, studentDateOfBirth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    required
                    value={formData.studentGender}
                    onChange={(e) => setFormData({...formData, studentGender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Group
                  </label>
                  <input
                    type="text"
                    value={formData.studentBloodGroup}
                    onChange={(e) => setFormData({...formData, studentBloodGroup: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Previous School
                  </label>
                  <input
                    type="text"
                    value={formData.studentPreviousSchool}
                    onChange={(e) => setFormData({...formData, studentPreviousSchool: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Previous Class
                  </label>
                  <input
                    type="text"
                    value={formData.studentPreviousClass}
                    onChange={(e) => setFormData({...formData, studentPreviousClass: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Parent Information */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold mb-2">Parent Information</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.parentFirstName}
                    onChange={(e) => setFormData({...formData, parentFirstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.parentLastName}
                    onChange={(e) => setFormData({...formData, parentLastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Email
                  </label>
                  <input
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Occupation
                  </label>
                  <input
                    type="text"
                    value={formData.parentOccupation}
                    onChange={(e) => setFormData({...formData, parentOccupation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Address *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.parentAddress}
                    onChange={(e) => setFormData({...formData, parentAddress: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Academic Information */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold mb-2">Academic Information</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Desired Class *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.desiredClass}
                    onChange={(e) => setFormData({...formData, desiredClass: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.desiredAcademicYear}
                    onChange={(e) => setFormData({...formData, desiredAcademicYear: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Subjects
                  </label>
                  <textarea
                    rows={2}
                    value={formData.preferredSubjects}
                    onChange={(e) => setFormData({...formData, preferredSubjects: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Inquiry Details */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold mb-2">Inquiry Details</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inquiry Source
                  </label>
                  <select
                    value={formData.inquirySource}
                    onChange={(e) => setFormData({...formData, inquirySource: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="walk-in">Walk-in</option>
                    <option value="phone">Phone</option>
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="social-media">Social Media</option>
                    <option value="advertisement">Advertisement</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="interested">Interested</option>
                    <option value="not-interested">Not Interested</option>
                    <option value="admitted">Admitted</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.inquiryNotes}
                    onChange={(e) => setFormData({...formData, inquiryNotes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Inquiry Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Inquiry</h2>
            <form onSubmit={handleUpdateInquiry} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Student Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Student Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.studentFirstName}
                      onChange={(e) => setFormData({...formData, studentFirstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.studentLastName}
                      onChange={(e) => setFormData({...formData, studentLastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={formData.studentDateOfBirth}
                      onChange={(e) => setFormData({...formData, studentDateOfBirth: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      value={formData.studentGender}
                      onChange={(e) => setFormData({...formData, studentGender: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Group
                    </label>
                    <input
                      type="text"
                      value={formData.studentBloodGroup}
                      onChange={(e) => setFormData({...formData, studentBloodGroup: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Previous School
                    </label>
                    <input
                      type="text"
                      value={formData.studentPreviousSchool}
                      onChange={(e) => setFormData({...formData, studentPreviousSchool: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Previous Class
                    </label>
                    <input
                      type="text"
                      value={formData.studentPreviousClass}
                      onChange={(e) => setFormData({...formData, studentPreviousClass: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Parent Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Parent Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.parentFirstName}
                      onChange={(e) => setFormData({...formData, parentFirstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.parentLastName}
                      onChange={(e) => setFormData({...formData, parentLastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Email
                    </label>
                    <input
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Occupation
                    </label>
                    <input
                      type="text"
                      value={formData.parentOccupation}
                      onChange={(e) => setFormData({...formData, parentOccupation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Address *
                    </label>
                    <textarea
                      value={formData.parentAddress}
                      onChange={(e) => setFormData({...formData, parentAddress: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Relation
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContactRelation}
                      onChange={(e) => setFormData({...formData, emergencyContactRelation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Desired Class *
                    </label>
                    <input
                      type="text"
                      value={formData.desiredClass}
                      onChange={(e) => setFormData({...formData, desiredClass: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Year *
                    </label>
                    <input
                      type="text"
                      value={formData.desiredAcademicYear}
                      onChange={(e) => setFormData({...formData, desiredAcademicYear: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Inquiry Source *
                    </label>
                    <select
                      value={formData.inquirySource}
                      onChange={(e) => setFormData({...formData, inquirySource: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="walk-in">Walk-in</option>
                      <option value="phone">Phone</option>
                      <option value="website">Website</option>
                      <option value="referral">Referral</option>
                      <option value="social-media">Social Media</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Subjects
                  </label>
                  <textarea
                    value={formData.preferredSubjects}
                    onChange={(e) => setFormData({...formData, preferredSubjects: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inquiry Notes
                  </label>
                  <textarea
                    value={formData.inquiryNotes}
                    onChange={(e) => setFormData({...formData, inquiryNotes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="interested">Interested</option>
                    <option value="admitted">Admitted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert to Student Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Convert to Student</h2>
            <form onSubmit={handleConvertToStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Class *
                </label>
                <select
                  required
                  value={formData.classId}
                  onChange={(e) => setFormData({...formData, classId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - {cls.section} ({cls.academicYear})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transport Route
                </label>
                <input
                  type="text"
                  value={formData.transportRoute}
                  onChange={(e) => setFormData({...formData, transportRoute: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowConvertModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Convert to Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inquiries;
