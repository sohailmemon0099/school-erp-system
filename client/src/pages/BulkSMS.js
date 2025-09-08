import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Send,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Calendar,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const BulkSMS = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [recipients, setRecipients] = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    recipientType: 'all_students',
    classId: '',
    recipientIds: [],
    scheduledAt: ''
  });

  const recipientTypes = [
    { value: 'all_students', label: 'All Students' },
    { value: 'all_teachers', label: 'All Teachers' },
    { value: 'specific_class', label: 'Specific Class' },
    { value: 'specific_students', label: 'Specific Students' },
    { value: 'custom_numbers', label: 'Custom Phone Numbers' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'text-gray-600 bg-gray-100' },
    { value: 'scheduled', label: 'Scheduled', color: 'text-blue-600 bg-blue-100' },
    { value: 'sending', label: 'Sending', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'sent', label: 'Sent', color: 'text-green-600 bg-green-100' },
    { value: 'failed', label: 'Failed', color: 'text-red-600 bg-red-100' },
    { value: 'cancelled', label: 'Cancelled', color: 'text-gray-600 bg-gray-100' }
  ];

  useEffect(() => {
    fetchCampaigns();
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bulk-sms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setCampaigns(data.data.campaigns);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setStudents(data.data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/classes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setClasses(data.data.classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchRecipients = async (recipientType, classId = null, recipientIds = null) => {
    setLoadingRecipients(true);
    try {
      const token = localStorage.getItem('token');
      let url = `/api/bulk-sms/recipients/preview?recipientType=${recipientType}`;
      
      if (classId) url += `&classId=${classId}`;
      if (recipientIds && recipientIds.length > 0) url += `&recipientIds=${recipientIds.join(',')}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setRecipients(data.data.recipients);
      }
    } catch (error) {
      console.error('Error fetching recipients:', error);
      toast.error('Failed to fetch recipients');
    } finally {
      setLoadingRecipients(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bulk-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Bulk SMS campaign created successfully');
        setShowModal(false);
        resetForm();
        fetchCampaigns();
      } else {
        toast.error(data.message || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  const handleSend = async (id) => {
    if (!window.confirm('Are you sure you want to send this SMS campaign?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bulk-sms/${id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        toast.success(data.message);
        fetchCampaigns();
      } else {
        toast.error(data.message || 'Failed to send campaign');
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast.error('Failed to send campaign');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bulk-sms/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Campaign deleted successfully');
        fetchCampaigns();
      } else {
        toast.error(data.message || 'Failed to delete campaign');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      recipientType: 'all_students',
      classId: '',
      recipientIds: [],
      scheduledAt: ''
    });
    setRecipients([]);
  };

  const openEditModal = (campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      title: campaign.title,
      message: campaign.message,
      recipientType: campaign.recipientType,
      classId: campaign.classId || '',
      recipientIds: campaign.recipientIds || [],
      scheduledAt: campaign.scheduledAt || ''
    });
    setShowEditModal(true);
  };

  const openPreviewModal = (campaign) => {
    setSelectedCampaign(campaign);
    setRecipients(campaign.recipientIds || []);
    setShowPreviewModal(true);
  };

  const handleRecipientTypeChange = (type) => {
    setFormData({ ...formData, recipientType: type, classId: '', recipientIds: [] });
    if (type === 'all_students' || type === 'all_teachers') {
      fetchRecipients(type);
    }
  };

  const handleClassChange = (classId) => {
    setFormData({ ...formData, classId });
    if (classId) {
      fetchRecipients('specific_class', classId);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'sending':
        return <Clock className="w-4 h-4" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.campaignId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bulk SMS Management</h1>
            <p className="text-gray-600">Send SMS messages to students, teachers, and parents</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent/Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {campaign.campaignId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {recipientTypes.find(t => t.value === campaign.recipientType)?.label}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusOptions.find(s => s.value === campaign.status)?.color}`}>
                      {getStatusIcon(campaign.status)}
                      <span className="ml-1">{statusOptions.find(s => s.value === campaign.status)?.label}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.sentCount || 0}/{campaign.totalRecipients || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openPreviewModal(campaign)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                        <>
                          <button
                            onClick={() => openEditModal(campaign)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSend(campaign.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Send"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                        <button
                          onClick={() => handleDelete(campaign.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Bulk SMS Campaign</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.message.length}/1600 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Type</label>
                <select
                  value={formData.recipientType}
                  onChange={(e) => handleRecipientTypeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {recipientTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {formData.recipientType === 'specific_class' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} {cls.section}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.recipientType === 'specific_students' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Students</label>
                  <select
                    multiple
                    value={formData.recipientIds}
                    onChange={(e) => {
                      const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData({ ...formData, recipientIds: selectedIds });
                      if (selectedIds.length > 0) {
                        fetchRecipients('specific_students', null, selectedIds);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    size="5"
                  >
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.user?.firstName} {student.user?.lastName} - {student.studentId}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Leave empty to send immediately
                </p>
              </div>

              {/* Recipients Preview */}
              {recipients.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipients Preview ({recipients.length} recipients)
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                    {recipients.slice(0, 10).map((recipient, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {recipient.name} - {recipient.phone}
                      </div>
                    ))}
                    {recipients.length > 10 && (
                      <div className="text-sm text-gray-500">
                        ... and {recipients.length - 10} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Campaign Preview</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Title:</h3>
                <p className="text-gray-700">{selectedCampaign?.title}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Message:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedCampaign?.message}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Recipients ({recipients.length}):</h3>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {recipients.map((recipient, index) => (
                    <div key={index} className="text-sm text-gray-600 py-1">
                      {recipient.name} - {recipient.phone}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkSMS;
