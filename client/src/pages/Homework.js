import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Plus,
  Filter,
  Search
} from 'lucide-react';

const Homework = () => {
  const { user } = useAuth();
  const [homework, setHomework] = useState([
    {
      id: 1,
      subject: 'Mathematics',
      title: 'Algebra Problems',
      description: 'Complete exercises 1-20 from chapter 5. Show all working steps.',
      dueDate: '2025-09-08',
      status: 'pending',
      priority: 'high',
      teacher: 'Mr. Smith',
      assignedDate: '2025-09-05',
      attachments: ['algebra_worksheet.pdf']
    },
    {
      id: 2,
      subject: 'English',
      title: 'Essay Writing',
      description: 'Write a 500-word essay on climate change. Include introduction, body paragraphs, and conclusion.',
      dueDate: '2025-09-10',
      status: 'completed',
      priority: 'medium',
      teacher: 'Ms. Johnson',
      assignedDate: '2025-09-03',
      attachments: ['essay_guidelines.pdf']
    },
    {
      id: 3,
      subject: 'Science',
      title: 'Lab Report',
      description: 'Complete lab report for chemistry experiment on acids and bases.',
      dueDate: '2025-09-12',
      status: 'pending',
      priority: 'high',
      teacher: 'Dr. Brown',
      assignedDate: '2025-09-06',
      attachments: ['lab_template.docx']
    },
    {
      id: 4,
      subject: 'History',
      title: 'Research Project',
      description: 'Research and present on the causes of World War I.',
      dueDate: '2025-09-15',
      status: 'in_progress',
      priority: 'medium',
      teacher: 'Prof. Davis',
      assignedDate: '2025-09-01',
      attachments: ['research_guidelines.pdf', 'timeline_template.xlsx']
    },
    {
      id: 5,
      subject: 'Geography',
      title: 'Map Study',
      description: 'Study and label all countries in Europe on the provided map.',
      dueDate: '2025-09-09',
      status: 'pending',
      priority: 'low',
      teacher: 'Ms. Wilson',
      assignedDate: '2025-09-04',
      attachments: ['europe_map.pdf']
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredHomework = homework.filter(item => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateStatus = (dueDate, status) => {
    const days = getDaysUntilDue(dueDate);
    if (status === 'completed') return 'completed';
    if (days < 0) return 'overdue';
    if (days === 0) return 'due_today';
    if (days === 1) return 'due_tomorrow';
    return 'upcoming';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Homework</h1>
            <p className="text-gray-600">Manage your assignments and track your progress</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Pending Assignments</p>
              <p className="text-2xl font-bold text-yellow-600">
                {homework.filter(h => h.status === 'pending').length}
              </p>
            </div>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search homework..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Homework List */}
      <div className="space-y-4">
        {filteredHomework.map((item) => {
          const dueDateStatus = getDueDateStatus(item.dueDate, item.status);
          const daysUntilDue = getDaysUntilDue(item.dueDate);
          
          return (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(item.priority)}`}>
                      {item.priority} priority
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {item.subject}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Due: {item.dueDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {item.teacher}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{item.description}</p>

                  {item.attachments && item.attachments.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-600 mb-2">Attachments:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.attachments.map((attachment, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {attachment}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    {dueDateStatus === 'overdue' && (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Overdue by {Math.abs(daysUntilDue)} days</span>
                      </div>
                    )}
                    {dueDateStatus === 'due_today' && (
                      <div className="flex items-center gap-1 text-orange-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Due today!</span>
                      </div>
                    )}
                    {dueDateStatus === 'due_tomorrow' && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Due tomorrow</span>
                      </div>
                    )}
                    {dueDateStatus === 'upcoming' && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Due in {daysUntilDue} days</span>
                      </div>
                    )}
                    {item.status === 'completed' && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {item.status === 'pending' && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Start Assignment
                    </button>
                  )}
                  {item.status === 'in_progress' && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Mark Complete
                    </button>
                  )}
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredHomework.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No homework found</h3>
          <p className="text-gray-600">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'You have no homework assignments at the moment.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Homework;
