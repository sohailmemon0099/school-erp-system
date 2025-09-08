import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionContext';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Shield
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
import reportService from '../services/reportService';
import studentService from '../services/studentService';

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

const Dashboard = () => {
  const navigate = useNavigate();
  const { canView, userRole, loading: permissionsLoading } = usePermissions();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0,
    totalAttendance: 0,
    totalGrades: 0,
    totalFees: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentStudents, setRecentStudents] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard stats
      const statsResponse = await reportService.getDashboardStats();
      setStats(statsResponse.data.stats);

      // Load recent students
      const studentsResponse = await studentService.getStudents({ limit: 5 });
      setRecentStudents(studentsResponse.data.students || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart data for attendance trends
  const attendanceChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Present',
        data: [85, 92, 78, 96, 88, 0, 0],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Absent',
        data: [15, 8, 22, 4, 12, 0, 0],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Chart data for grade distribution
  const gradeDistributionData = {
    labels: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
    datasets: [
      {
        data: [12, 18, 25, 20, 15, 8, 2, 0],
        backgroundColor: [
          '#10B981',
          '#34D399',
          '#6EE7B7',
          '#A7F3D0',
          '#FDE68A',
          '#FCD34D',
          '#F59E0B',
          '#EF4444',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // Chart data for monthly revenue
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [12000, 15000, 18000, 16000, 20000, 22000],
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, onClick, route }) => (
    <div 
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
      onClick={() => onClick && navigate(route)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {trendValue}% from last month
            </div>
          )}
          {route && (
            <div className="flex items-center mt-2 text-sm text-blue-600">
              <span>Click to view details</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className={`bg-gradient-to-r rounded-2xl p-8 text-white ${
        userRole === 'teacher' ? 'from-green-600 to-blue-600' :
        userRole === 'admin' ? 'from-blue-600 to-purple-600' :
        userRole === 'student' ? 'from-purple-600 to-pink-600' :
        'from-gray-600 to-blue-600'
      }`}>
        <h1 className="text-4xl font-bold mb-2">
          Welcome to School ERP
          {userRole === 'teacher' && ' - Teacher Dashboard'}
          {userRole === 'admin' && ' - Admin Dashboard'}
          {userRole === 'student' && ' - Student Dashboard'}
        </h1>
        <p className="text-blue-100 text-lg">
          {userRole === 'teacher' && 'Access your teaching tools and student information'}
          {userRole === 'admin' && 'Manage your school efficiently with our comprehensive dashboard'}
          {userRole === 'student' && 'View your academic progress and school information'}
          {!['teacher', 'admin', 'student'].includes(userRole) && 'Manage your school efficiently with our comprehensive dashboard'}
        </p>
      </div>

      {/* Role-specific Quick Actions */}
      {userRole === 'admin' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Admin Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/admin/user-management')}
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Users className="w-6 h-6 text-blue-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-white">Manage Users</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Add/edit users</div>
              </div>
            </button>
            <button
              onClick={() => navigate('/admin/fees')}
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <DollarSign className="w-6 h-6 text-green-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Manage Fees</div>
                <div className="text-sm text-gray-600">Fee collection</div>
              </div>
            </button>
            <button
              onClick={() => navigate('/admin/transaction-reports')}
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <BarChart3 className="w-6 h-6 text-purple-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">View Reports</div>
                <div className="text-sm text-gray-600">Financial reports</div>
              </div>
            </button>
            <button
              onClick={() => navigate('/admin/role-permissions')}
              className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <Shield className="w-6 h-6 text-orange-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Permissions</div>
                <div className="text-sm text-gray-600">Role management</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {userRole === 'teacher' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {canView('attendance') && (
              <button
                onClick={() => navigate('/admin/attendance')}
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Calendar className="w-6 h-6 text-blue-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Mark Attendance</div>
                  <div className="text-sm text-gray-600">Record student attendance</div>
                </div>
              </button>
            )}
            {canView('grades') && (
              <button
                onClick={() => navigate('/admin/grades')}
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Award className="w-6 h-6 text-green-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Enter Grades</div>
                  <div className="text-sm text-gray-600">Grade student assignments</div>
                </div>
              </button>
            )}
            {canView('exams') && (
              <button
                onClick={() => navigate('/admin/exams')}
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <BookOpen className="w-6 h-6 text-purple-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Create Exam</div>
                  <div className="text-sm text-gray-600">Set up new exams</div>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {canView('students') && (
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            color="bg-blue-500"
            trend="up"
            trendValue="12"
            route="/admin/students"
          />
        )}
        {canView('teachers') && (
          <StatCard
            title="Total Teachers"
            value={stats.totalTeachers}
            icon={GraduationCap}
            color="bg-green-500"
            trend="up"
            trendValue="8"
            route="/admin/teachers"
          />
        )}
        {canView('classes') && (
          <StatCard
            title="Total Classes"
            value={stats.totalClasses}
            icon={BookOpen}
            color="bg-purple-500"
            trend="up"
            trendValue="5"
            route="/admin/classes"
          />
        )}
        {canView('fees') && userRole !== 'teacher' && (
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="bg-yellow-500"
            trend="up"
            trendValue="15"
            route="/admin/fees"
          />
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Trends */}
        {canView('attendance') && (
          <div 
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
            onClick={() => navigate('/admin/attendance')}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Attendance Trends</h3>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="h-64">
              <Line data={attendanceChartData} options={chartOptions} />
            </div>
            <div className="mt-4 text-center">
              <span className="text-sm text-blue-600">Click to view attendance details</span>
            </div>
          </div>
        )}

        {/* Grade Distribution */}
        {canView('grades') && (
          <div 
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
            onClick={() => navigate('/admin/grades')}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Grade Distribution</h3>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-gray-400" />
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="h-64">
              <Doughnut data={gradeDistributionData} options={doughnutOptions} />
            </div>
            <div className="mt-4 text-center">
              <span className="text-sm text-blue-600">Click to view grades details</span>
            </div>
          </div>
        )}
      </div>

      {/* Revenue Chart */}
      {canView('fees') && userRole !== 'teacher' && (
        <div 
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
          onClick={() => navigate('/admin/fees')}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Monthly Revenue</h3>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="h-80">
            <Bar data={revenueChartData} options={chartOptions} />
          </div>
          <div className="mt-4 text-center">
            <span className="text-sm text-blue-600">Click to view fees and revenue details</span>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Students */}
        {canView('students') && (
          <div 
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
            onClick={() => navigate('/admin/students')}
          >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recent Students</h3>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-400" />
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="space-y-4">
            {recentStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No students found</p>
              </div>
            ) : (
              recentStudents.map((student) => (
                <div key={student.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {student.user?.firstName?.[0]}{student.user?.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {student.user?.firstName} {student.user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{student.studentId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{student.class?.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 text-center">
            <span className="text-sm text-blue-600">Click to view all students</span>
          </div>
        </div>
        )}

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Quick Stats</h3>
            <CheckCircle className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">Attendance Rate</span>
              </div>
              <span className="text-2xl font-bold text-green-600">94%</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-medium">Average Grade</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">B+</span>
            </div>
            
            {canView('fees') && (
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <span className="text-purple-800 font-medium">Fee Collection</span>
                </div>
                <span className="text-2xl font-bold text-purple-600">87%</span>
              </div>
            )}
            
            {canView('classes') && (
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-800 font-medium">Active Classes</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{stats.totalClasses}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Quick Navigation</h3>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            className="p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors duration-200"
            onClick={() => navigate('/students')}
          >
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-center text-sm font-medium text-blue-800">Students</p>
          </div>
          <div 
            className="p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors duration-200"
            onClick={() => navigate('/teachers')}
          >
            <GraduationCap className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-center text-sm font-medium text-green-800">Teachers</p>
          </div>
          <div 
            className="p-4 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors duration-200"
            onClick={() => navigate('/classes')}
          >
            <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-center text-sm font-medium text-purple-800">Classes</p>
          </div>
          <div 
            className="p-4 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors duration-200"
            onClick={() => navigate('/subjects')}
          >
            <Award className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-center text-sm font-medium text-orange-800">Subjects</p>
          </div>
          <div 
            className="p-4 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors duration-200"
            onClick={() => navigate('/attendance')}
          >
            <Calendar className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-center text-sm font-medium text-indigo-800">Attendance</p>
          </div>
          <div 
            className="p-4 bg-pink-50 rounded-lg cursor-pointer hover:bg-pink-100 transition-colors duration-200"
            onClick={() => navigate('/grades')}
          >
            <Award className="w-8 h-8 text-pink-600 mx-auto mb-2" />
            <p className="text-center text-sm font-medium text-pink-800">Grades</p>
          </div>
          <div 
            className="p-4 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors duration-200"
            onClick={() => navigate('/fees')}
          >
            <DollarSign className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-center text-sm font-medium text-yellow-800">Fees</p>
          </div>
          <div 
            className="p-4 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors duration-200"
            onClick={() => navigate('/reports')}
          >
            <CheckCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-center text-sm font-medium text-red-800">Reports</p>
          </div>
        </div>
      </div>

      {/* Alerts and Notifications */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Recent Alerts</h3>
          <AlertCircle className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-yellow-800 font-medium">Fee Payment Due</p>
              <p className="text-yellow-600 text-sm">5 students have pending fee payments</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-blue-800 font-medium">Parent-Teacher Meeting</p>
              <p className="text-blue-600 text-sm">Scheduled for next Friday at 2:00 PM</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-green-800 font-medium">Exam Results Published</p>
              <p className="text-green-600 text-sm">Mid-term exam results are now available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher-specific Information */}
      {userRole === 'teacher' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Classes */}
          {canView('classes') && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">My Classes</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Grade 5 - A</p>
                    <p className="text-sm text-gray-600">Mathematics, Science</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">32 Students</p>
                    <p className="text-xs text-gray-500">Active</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Grade 6 - B</p>
                    <p className="text-sm text-gray-600">Mathematics</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">28 Students</p>
                    <p className="text-xs text-gray-500">Active</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/admin/classes')}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Classes
              </button>
            </div>
          )}

          {/* Today's Schedule */}
          {canView('timetable') && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Today's Schedule</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Mathematics</p>
                    <p className="text-sm text-gray-600">Grade 5 - A</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-purple-600">09:00 - 10:00</p>
                    <p className="text-xs text-gray-500">Room 101</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Science</p>
                    <p className="text-sm text-gray-600">Grade 5 - A</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600">10:15 - 11:15</p>
                    <p className="text-xs text-gray-500">Lab 1</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Mathematics</p>
                    <p className="text-sm text-gray-600">Grade 6 - B</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">11:30 - 12:30</p>
                    <p className="text-xs text-gray-500">Room 102</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/admin/timetable')}
                className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                View Full Timetable
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;