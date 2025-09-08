import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  User, 
  Clock, 
  Award,
  Calendar,
  Search,
  Filter
} from 'lucide-react';

const StudentSubjects = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([
    {
      id: 1,
      name: 'Mathematics',
      code: 'MATH101',
      description: 'Advanced Algebra and Geometry',
      credits: 4,
      teacher: 'Mr. Smith',
      class: '8th Grade - A',
      schedule: 'Mon, Wed, Fri - 9:00 AM',
      room: 'Room 101'
    },
    {
      id: 2,
      name: 'English Literature',
      code: 'ENG201',
      description: 'Classic and Modern Literature',
      credits: 3,
      teacher: 'Ms. Johnson',
      class: '8th Grade - A',
      schedule: 'Tue, Thu - 10:15 AM',
      room: 'Room 102'
    },
    {
      id: 3,
      name: 'Science',
      code: 'SCI301',
      description: 'Physics and Chemistry',
      credits: 4,
      teacher: 'Dr. Brown',
      class: '8th Grade - A',
      schedule: 'Mon, Wed - 11:30 AM',
      room: 'Lab 1'
    },
    {
      id: 4,
      name: 'History',
      code: 'HIS401',
      description: 'World History and Geography',
      credits: 3,
      teacher: 'Prof. Davis',
      class: '8th Grade - A',
      schedule: 'Tue, Thu - 1:30 PM',
      room: 'Room 103'
    },
    {
      id: 5,
      name: 'Physical Education',
      code: 'PE501',
      description: 'Sports and Physical Fitness',
      credits: 2,
      teacher: 'Coach Taylor',
      class: '8th Grade - A',
      schedule: 'Mon, Wed, Fri - 2:45 PM',
      room: 'Gymnasium'
    },
    {
      id: 6,
      name: 'Art',
      code: 'ART601',
      description: 'Drawing and Painting',
      credits: 2,
      teacher: 'Ms. Garcia',
      class: '8th Grade - A',
      schedule: 'Tue, Thu - 3:30 PM',
      room: 'Art Studio'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCredits, setFilterCredits] = useState('all');

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCredits = filterCredits === 'all' || 
                          (filterCredits === 'high' && subject.credits >= 4) ||
                          (filterCredits === 'medium' && subject.credits === 3) ||
                          (filterCredits === 'low' && subject.credits <= 2);
    
    return matchesSearch && matchesCredits;
  });

  const getSubjectColor = (credits) => {
    if (credits >= 4) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (credits === 3) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const totalCredits = subjects.reduce((sum, subject) => sum + subject.credits, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Subjects</h1>
            <p className="text-gray-600">View your enrolled subjects and course information</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Credits</p>
              <p className="text-2xl font-bold text-blue-600">{totalCredits}</p>
            </div>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Subjects</p>
              <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Credits</p>
              <p className="text-2xl font-bold text-gray-900">{totalCredits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Teachers</p>
              <p className="text-2xl font-bold text-gray-900">{new Set(subjects.map(s => s.teacher)).size}</p>
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
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterCredits}
              onChange={(e) => setFilterCredits(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Credits</option>
              <option value="high">High Credits (4+)</option>
              <option value="medium">Medium Credits (3)</option>
              <option value="low">Low Credits (1-2)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject) => (
          <div key={subject.id} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                <p className="text-sm text-gray-600">{subject.code}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSubjectColor(subject.credits)}`}>
                {subject.credits} credits
              </span>
            </div>

            <p className="text-gray-700 mb-4 text-sm">{subject.description}</p>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span>{subject.teacher}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{subject.schedule}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <BookOpen className="w-4 h-4 mr-2" />
                <span>{subject.room}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Class:</span>
                <span className="font-medium text-gray-900">{subject.class}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSubjects.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects found</h3>
          <p className="text-gray-600">
            {searchTerm || filterCredits !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'You are not enrolled in any subjects yet.'
            }
          </p>
        </div>
      )}

      {/* Subject Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Credit Distribution</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>High Credit Subjects (4+):</span>
                <span className="font-medium">{subjects.filter(s => s.credits >= 4).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Medium Credit Subjects (3):</span>
                <span className="font-medium">{subjects.filter(s => s.credits === 3).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Low Credit Subjects (1-2):</span>
                <span className="font-medium">{subjects.filter(s => s.credits <= 2).length}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Schedule Overview</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Monday Classes:</span>
                <span className="font-medium">{subjects.filter(s => s.schedule.includes('Mon')).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Tuesday Classes:</span>
                <span className="font-medium">{subjects.filter(s => s.schedule.includes('Tue')).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Wednesday Classes:</span>
                <span className="font-medium">{subjects.filter(s => s.schedule.includes('Wed')).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Thursday Classes:</span>
                <span className="font-medium">{subjects.filter(s => s.schedule.includes('Thu')).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Friday Classes:</span>
                <span className="font-medium">{subjects.filter(s => s.schedule.includes('Fri')).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSubjects;
