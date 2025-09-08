import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Award, 
  TrendingUp, 
  TrendingDown,
  BookOpen,
  Calendar,
  Filter,
  Search,
  Star,
  Target,
  BarChart3
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
import { Bar, Line, Doughnut } from 'react-chartjs-2';

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

const StudentGrades = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState([
    {
      id: 1,
      subject: 'Mathematics',
      examType: 'Midterm',
      examName: 'Algebra Test',
      marksObtained: 85,
      totalMarks: 100,
      percentage: 85,
      grade: 'A',
      examDate: '2025-09-05',
      remarks: 'Excellent work!'
    },
    {
      id: 2,
      subject: 'English Literature',
      examType: 'Assignment',
      examName: 'Essay Writing',
      marksObtained: 92,
      totalMarks: 100,
      percentage: 92,
      grade: 'A+',
      examDate: '2025-09-03',
      remarks: 'Outstanding essay!'
    },
    {
      id: 3,
      subject: 'Science',
      examType: 'Quiz',
      examName: 'Chemistry Quiz',
      marksObtained: 78,
      totalMarks: 100,
      percentage: 78,
      grade: 'B+',
      examDate: '2025-09-01',
      remarks: 'Good effort, keep practicing'
    },
    {
      id: 4,
      subject: 'History',
      examType: 'Project',
      examName: 'World War I Research',
      marksObtained: 88,
      totalMarks: 100,
      percentage: 88,
      grade: 'A',
      examDate: '2025-08-28',
      remarks: 'Well researched project'
    },
    {
      id: 5,
      subject: 'Physical Education',
      examType: 'Practical',
      examName: 'Basketball Skills',
      marksObtained: 95,
      totalMarks: 100,
      percentage: 95,
      grade: 'A+',
      examDate: '2025-08-25',
      remarks: 'Excellent performance'
    },
    {
      id: 6,
      subject: 'Art',
      examType: 'Portfolio',
      examName: 'Drawing Portfolio',
      marksObtained: 90,
      totalMarks: 100,
      percentage: 90,
      grade: 'A+',
      examDate: '2025-08-22',
      remarks: 'Creative and artistic'
    },
    {
      id: 7,
      subject: 'Mathematics',
      examType: 'Quiz',
      examName: 'Geometry Quiz',
      marksObtained: 82,
      totalMarks: 100,
      percentage: 82,
      grade: 'A-',
      examDate: '2025-08-20',
      remarks: 'Good understanding'
    },
    {
      id: 8,
      subject: 'English Literature',
      examType: 'Presentation',
      examName: 'Book Review',
      marksObtained: 87,
      totalMarks: 100,
      percentage: 87,
      grade: 'A',
      examDate: '2025-08-18',
      remarks: 'Well presented'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [examTypeFilter, setExamTypeFilter] = useState('all');

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
        return 'text-green-600 bg-green-100';
      case 'A':
        return 'text-green-600 bg-green-100';
      case 'A-':
        return 'text-green-600 bg-green-100';
      case 'B+':
        return 'text-blue-600 bg-blue-100';
      case 'B':
        return 'text-blue-600 bg-blue-100';
      case 'B-':
        return 'text-blue-600 bg-blue-100';
      case 'C+':
        return 'text-yellow-600 bg-yellow-100';
      case 'C':
        return 'text-yellow-600 bg-yellow-100';
      case 'C-':
        return 'text-yellow-600 bg-yellow-100';
      case 'D':
        return 'text-orange-600 bg-orange-100';
      case 'F':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const filteredGrades = grades.filter(grade => {
    const matchesFilter = filter === 'all' || grade.grade.startsWith(filter);
    const matchesSearch = grade.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.examName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExamType = examTypeFilter === 'all' || grade.examType === examTypeFilter;
    
    return matchesFilter && matchesSearch && matchesExamType;
  });

  // Calculate statistics
  const totalExams = grades.length;
  const averagePercentage = totalExams > 0 ? Math.round(grades.reduce((sum, grade) => sum + grade.percentage, 0) / totalExams) : 0;
  const highestGrade = grades.length > 0 ? Math.max(...grades.map(g => g.percentage)) : 0;
  const lowestGrade = grades.length > 0 ? Math.min(...grades.map(g => g.percentage)) : 0;

  // Subject-wise averages
  const subjectAverages = grades.reduce((acc, grade) => {
    if (!acc[grade.subject]) {
      acc[grade.subject] = { total: 0, count: 0 };
    }
    acc[grade.subject].total += grade.percentage;
    acc[grade.subject].count += 1;
    return acc;
  }, {});

  Object.keys(subjectAverages).forEach(subject => {
    subjectAverages[subject].average = Math.round(subjectAverages[subject].total / subjectAverages[subject].count);
  });

  // Chart data
  const subjectData = {
    labels: Object.keys(subjectAverages),
    datasets: [
      {
        label: 'Average %',
        data: Object.values(subjectAverages).map(subj => subj.average),
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

  const gradeDistribution = grades.reduce((acc, grade) => {
    acc[grade.grade] = (acc[grade.grade] || 0) + 1;
    return acc;
  }, {});

  const gradeData = {
    labels: Object.keys(gradeDistribution),
    datasets: [
      {
        data: Object.values(gradeDistribution),
        backgroundColor: [
          '#10B981', // A+
          '#10B981', // A
          '#10B981', // A-
          '#3B82F6', // B+
          '#3B82F6', // B
          '#3B82F6', // B-
          '#F59E0B', // C+
          '#F59E0B', // C
          '#F59E0B', // C-
          '#EF4444', // D
          '#EF4444', // F
        ],
        borderWidth: 0,
      },
    ],
  };

  const recentGrades = grades.slice(0, 6).map(grade => grade.percentage);
  const trendData = {
    labels: grades.slice(0, 6).map(grade => grade.examName),
    datasets: [
      {
        label: 'Percentage',
        data: recentGrades,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Grades</h1>
            <p className="text-gray-600">View your academic performance and progress</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Overall Average</p>
              <p className="text-2xl font-bold text-blue-600">{averagePercentage}%</p>
            </div>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average</p>
              <p className="text-2xl font-bold text-gray-900">{averagePercentage}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Highest</p>
              <p className="text-2xl font-bold text-gray-900">{highestGrade}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Target className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lowest</p>
              <p className="text-2xl font-bold text-gray-900">{lowestGrade}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Exams</p>
              <p className="text-2xl font-bold text-gray-900">{totalExams}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Performance</h2>
          <div className="h-64">
            <Bar data={subjectData} options={{
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
                  max: 100,
                  ticks: {
                    callback: function(value) {
                      return value + '%';
                    }
                  }
                }
              }
            }} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h2>
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

      {/* Performance Trend */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Performance Trend</h2>
        <div className="h-64">
          <Line data={trendData} options={{
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
                max: 100,
                ticks: {
                  callback: function(value) {
                    return value + '%';
                  }
                }
              }
            }
          }} />
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
                placeholder="Search by subject or exam..."
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
              <option value="all">All Grades</option>
              <option value="A">A Grades</option>
              <option value="B">B Grades</option>
              <option value="C">C Grades</option>
              <option value="D">D Grades</option>
              <option value="F">F Grades</option>
            </select>
            <select
              value={examTypeFilter}
              onChange={(e) => setExamTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="Quiz">Quiz</option>
              <option value="Midterm">Midterm</option>
              <option value="Final">Final</option>
              <option value="Assignment">Assignment</option>
              <option value="Project">Project</option>
              <option value="Presentation">Presentation</option>
              <option value="Practical">Practical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grades List */}
      <div className="space-y-4">
        {filteredGrades.map((grade) => (
          <div key={grade.id} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{grade.examName}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(grade.grade)}`}>
                    {grade.grade}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    {grade.examType}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {grade.subject}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(grade.examDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Marks</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {grade.marksObtained} / {grade.totalMarks}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Percentage</p>
                    <p className={`text-lg font-semibold ${getPercentageColor(grade.percentage)}`}>
                      {grade.percentage}%
                    </p>
                  </div>
                </div>

                {grade.remarks && (
                  <p className="text-sm text-gray-600 italic">"{grade.remarks}"</p>
                )}
              </div>

              <div className="ml-4">
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getPercentageColor(grade.percentage)}`}>
                    {grade.percentage}%
                  </div>
                  <div className="text-sm text-gray-500">Score</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredGrades.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No grades found</h3>
          <p className="text-gray-600">
            {searchTerm || filter !== 'all' || examTypeFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No grades available yet.'
            }
          </p>
        </div>
      )}

      {/* Subject Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(subjectAverages).map(([subject, data]) => (
            <div key={subject} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{subject}</h3>
                  <p className="text-sm text-gray-600">{data.count} exam{data.count !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${getPercentageColor(data.average)}`}>
                    {data.average}%
                  </div>
                  <div className="text-xs text-gray-500">Average</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentGrades;
