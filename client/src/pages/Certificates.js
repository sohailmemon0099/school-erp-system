import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  CheckCircle,
  XCircle
} from 'lucide-react';

const Certificates = () => {
  const [activeTab, setActiveTab] = useState('bonafide');
  const [bonafideCertificates, setBonafideCertificates] = useState([]);
  const [leavingCertificates, setLeavingCertificates] = useState([]);
  const [affidavits, setAffidavits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  const fetchBonafideCertificates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/certificates/bonafide');
      const data = await response.json();
      if (data.success) {
        setBonafideCertificates(data.data);
      }
    } catch (error) {
      console.error('Error fetching bonafide certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeavingCertificates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/certificates/leaving');
      const data = await response.json();
      if (data.success) {
        setLeavingCertificates(data.data);
      }
    } catch (error) {
      console.error('Error fetching leaving certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAffidavits = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/certificates/affidavits');
      const data = await response.json();
      if (data.success) {
        setAffidavits(data.data);
      }
    } catch (error) {
      console.error('Error fetching affidavits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'bonafide') {
      fetchBonafideCertificates();
    } else if (activeTab === 'leaving') {
      fetchLeavingCertificates();
    } else if (activeTab === 'affidavits') {
      fetchAffidavits();
    }
  }, [activeTab]);

  const tabs = [
    { id: 'bonafide', label: 'Bonafide Certificates', icon: FileText },
    { id: 'leaving', label: 'Leaving Certificates', icon: FileText },
    { id: 'affidavits', label: 'Affidavits', icon: FileText }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'issued':
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'issued':
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderBonafideCertificates = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Bonafide Certificates</h2>
        <button
          onClick={() => {
            setModalType('bonafide');
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Issue Certificate
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
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
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Certificate No.</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Purpose</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Issued Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Valid Until</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bonafideCertificates.map((certificate) => (
                  <tr key={certificate.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{certificate.certificateNumber}</td>
                    <td className="py-3 px-4">
                      {certificate.student?.user?.firstName} {certificate.student?.user?.lastName}
                    </td>
                    <td className="py-3 px-4 capitalize">{certificate.purpose.replace('_', ' ')}</td>
                    <td className="py-3 px-4">{new Date(certificate.issuedDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{new Date(certificate.validUntil).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(certificate.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(certificate.status)}`}>
                          {certificate.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-yellow-600 hover:bg-yellow-50 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLeavingCertificates = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Leaving Certificates</h2>
        <button
          onClick={() => {
            setModalType('leaving');
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Issue Certificate
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Certificate No.</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Leaving Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Reason</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Class</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leavingCertificates.map((certificate) => (
                  <tr key={certificate.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{certificate.certificateNumber}</td>
                    <td className="py-3 px-4">
                      {certificate.student?.user?.firstName} {certificate.student?.user?.lastName}
                    </td>
                    <td className="py-3 px-4">{new Date(certificate.leavingDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 capitalize">{certificate.reasonForLeaving.replace('_', ' ')}</td>
                    <td className="py-3 px-4">{certificate.lastClassAttended}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(certificate.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(certificate.status)}`}>
                          {certificate.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-yellow-600 hover:bg-yellow-50 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAffidavits = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Affidavits</h2>
        <button
          onClick={() => {
            setModalType('affidavit');
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Affidavit
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Document No.</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Issued Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Valid Until</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {affidavits.map((affidavit) => (
                  <tr key={affidavit.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{affidavit.documentNumber}</td>
                    <td className="py-3 px-4">
                      {affidavit.student?.user?.firstName} {affidavit.student?.user?.lastName}
                    </td>
                    <td className="py-3 px-4 capitalize">{affidavit.type.replace('_', ' ')}</td>
                    <td className="py-3 px-4">{new Date(affidavit.issuedDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      {affidavit.validUntil ? new Date(affidavit.validUntil).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(affidavit.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(affidavit.status)}`}>
                          {affidavit.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-yellow-600 hover:bg-yellow-50 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Certificate & Document Management</h1>
        <p className="text-gray-600">Manage bonafide certificates, leaving certificates, and affidavits</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'bonafide' && renderBonafideCertificates()}
      {activeTab === 'leaving' && renderLeavingCertificates()}
      {activeTab === 'affidavits' && renderAffidavits()}
    </div>
  );
};

export default Certificates;
