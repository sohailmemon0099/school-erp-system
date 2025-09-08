import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Award,
  TrendingUp,
  Bell,
  Home,
  User,
  Calendar as CalendarIcon,
  FileText,
  GraduationCap
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    attendancePercentage: 85,
    totalSubjects: 6,
    completedAssignments: 12,
    pendingAssignments: 3,
    averageGrade: 8.5,
    totalClasses: 30,
    attendedClasses: 25
  });

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, type: 'assignment', title: 'Math Homework - Algebra', date: '2025-09-07', status: 'completed' },
    { id: 2, type: 'attendance', title: 'Present in English Class', date: '2025-09-06', status: 'present' },
    { id: 3, type: 'grade', title: 'Science Test - 85%', date: '2025-09-05', status: 'graded' },
    { id: 4, type: 'assignment', title: 'History Essay', date: '2025-09-04', status: 'pending' },
  ]);

  const [upcomingEvents, setUpcomingEvents] = useState([
    { id: 1, title: 'Math Test', date: '2025-09-10', type: 'exam' },
    { id: 2, title: 'Science Project Due', date: '2025-09-12', type: 'assignment' },
    { id: '3', title: 'School Holiday', date: '2025-09-15', type: 'holiday' },
    { id: 4, title: 'Parent-Teacher Meeting', date: '2025-09-18', type: 'meeting' },
  ]);

  const [homework, setHomework] = useState([
    { id: 1, subject: 'Mathematics', title: 'Algebra Problems', dueDate: '2025-09-08', status: 'pending', description: 'Complete exercises 1-20 from chapter 5' },
    { id: 2, subject: 'English', title: 'Essay Writing', dueDate: '2025-09-10', status: 'completed', description: 'Write a 500-word essay on climate change' },
    { id: 3, subject: 'Science', title: 'Lab Report', dueDate: '2025-09-12', status: 'pending', description: 'Complete lab report for chemistry experiment' },
  ]);

  const attendanceData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Attendance',
        data: [1, 1, 1, 0, 1, 0], // 1 = present, 0 = absent
        backgroundColor: ['#10B981', '#10B981', '#10B981', '#EF4444', '#10B981', '#EF4444'],
        borderColor: ['#10B981', '#10B981', '#10B981', '#EF4444', '#10B981', '#EF4444'],
        borderWidth: 1,
      },
    ],
  };

  const gradeData = {
    labels: ['Math', 'English', 'Science', 'History', 'Geography', 'Art'],
    datasets: [
      {
        label: 'Grades',
        data: [85, 92, 78, 88, 90, 95],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#EC4899',
        ],
        borderWidth: 0,
      },
    ],
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'present':
      case 'graded':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'absent':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'exam':
        return 'text-red-600 bg-red-100';
      case 'assignment':
        return 'text-blue-600 bg-blue-100';
      case 'holiday':
        return 'text-green-600 bg-green-100';
      case 'meeting':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600">Here's what's happening in your academic journey</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Current Grade</p>
              <p className="text-2xl font-bold text-blue-600">8th Grade</p>
            </div>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{stats.attendancePercentage}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Subjects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingAssignments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Grade</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageGrade}/10</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Homework Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Homework</h2>
            <BookOpen className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {homework.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.subject}</p>
                    <p className="text-xs text-gray-500">Due: {item.dueDate}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            <CalendarIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.date}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(event.type)}`}>
                  {event.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Attendance</h2>
          <div className="h-64">
            <Bar data={attendanceData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 1,
                  ticks: {
                    callback: function(value) {
                      return value === 1 ? 'Present' : 'Absent';
                    }
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Grades Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject Grades</h2>
          <div className="h-64">
            <Doughnut data={gradeData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }} />
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                  {activity.type === 'assignment' && <FileText className="w-4 h-4 text-gray-600" />}
                  {activity.type === 'attendance' && <CheckCircle className="w-4 h-4 text-gray-600" />}
                  {activity.type === 'grade' && <Award className="w-4 h-4 text-gray-600" />}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{activity.title}</h3>
                  <p className="text-sm text-gray-600">{activity.date}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
