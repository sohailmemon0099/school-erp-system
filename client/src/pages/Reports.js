import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Download, Calendar, Users, BookOpen, DollarSign, TrendingUp } from 'lucide-react';
import reportService from '../services/reportService';
import toast from 'react-hot-toast';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalRevenue: 0
  });

  const loadDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reportService.getDashboardStats();
      setStats(response.data.stats || stats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Don't show error toast for stats, just use defaults
    } finally {
      setLoading(false);
    }
  }, [stats]);

  useEffect(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  const handleGenerateReport = async (reportType, format = 'pdf') => {
    try {
      setLoading(true);
      let response;
      
      if (format === 'pdf') {
        response = await reportService.generatePDFReport(reportType);
      } else {
        response = await reportService.generateExcelReport(reportType);
      }

      // Create blob and download
      const blob = new Blob([response], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`${reportType} report generated successfully`);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const reportCards = [
    {
      id: 'students',
      title: 'Student Reports',
      description: 'Generate individual student performance and attendance reports.',
      icon: Users,
      color: 'blue',
      reports: [
        { name: 'Student List', type: 'student-list' },
        { name: 'Student Performance', type: 'student-performance' },
        { name: 'Student Attendance', type: 'student-attendance' }
      ]
    },
    {
      id: 'attendance',
      title: 'Attendance Reports',
      description: 'Generate attendance summaries and detailed reports.',
      icon: Calendar,
      color: 'green',
      reports: [
        { name: 'Daily Attendance', type: 'daily-attendance' },
        { name: 'Monthly Summary', type: 'monthly-attendance' },
        { name: 'Class Attendance', type: 'class-attendance' }
      ]
    },
    {
      id: 'grades',
      title: 'Grade Reports',
      description: 'Generate academic performance and grade reports.',
      icon: BookOpen,
      color: 'purple',
      reports: [
        { name: 'Grade Summary', type: 'grade-summary' },
        { name: 'Subject Performance', type: 'subject-performance' },
        { name: 'Exam Results', type: 'exam-results' }
      ]
    },
    {
      id: 'fees',
      title: 'Fee Reports',
      description: 'Generate fee collection and outstanding reports.',
      icon: DollarSign,
      color: 'yellow',
      reports: [
        { name: 'Fee Collection', type: 'fee-collection' },
        { name: 'Outstanding Fees', type: 'outstanding-fees' },
        { name: 'Fee Summary', type: 'fee-summary' }
      ]
    },
    {
      id: 'classes',
      title: 'Class Reports',
      description: 'Generate class-wise reports and statistics.',
      icon: TrendingUp,
      color: 'indigo',
      reports: [
        { name: 'Class List', type: 'class-list' },
        { name: 'Class Performance', type: 'class-performance' },
        { name: 'Class Statistics', type: 'class-statistics' }
      ]
    },
    {
      id: 'teachers',
      title: 'Teacher Reports',
      description: 'Generate teacher performance and workload reports.',
      icon: Users,
      color: 'pink',
      reports: [
        { name: 'Teacher List', type: 'teacher-list' },
        { name: 'Teacher Workload', type: 'teacher-workload' },
        { name: 'Subject Assignment', type: 'subject-assignment' }
      ]
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      pink: 'bg-pink-100 text-pink-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Generate and download various reports</p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTeachers}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div key={card.id} className="card">
              <div className="flex items-center mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${getColorClasses(card.color)}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{card.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{card.description}</p>
              
              <div className="space-y-2">
                {card.reports.map((report) => (
                  <div key={report.type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{report.name}</span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleGenerateReport(report.type, 'pdf')}
                        className="btn btn-sm btn-secondary"
                        disabled={loading}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        PDF
                      </button>
                      <button
                        onClick={() => handleGenerateReport(report.type, 'excel')}
                        className="btn btn-sm btn-primary"
                        disabled={loading}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Excel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleGenerateReport('comprehensive', 'pdf')}
            className="btn btn-primary flex items-center justify-center"
            disabled={loading}
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Comprehensive Report
          </button>
          <button
            onClick={() => handleGenerateReport('monthly-summary', 'excel')}
            className="btn btn-secondary flex items-center justify-center"
            disabled={loading}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Monthly Summary
          </button>
          <button
            onClick={() => handleGenerateReport('academic-year', 'pdf')}
            className="btn btn-accent flex items-center justify-center"
            disabled={loading}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Academic Year Report
          </button>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
            <span>Generating report...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;