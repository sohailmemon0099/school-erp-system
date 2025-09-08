import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Search,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const LMS = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const tabs = [
    { id: 'courses', name: 'Courses', icon: BookOpen },
    { id: 'lessons', name: 'Lessons', icon: Play },
    { id: 'quizzes', name: 'Quizzes', icon: BookOpen },
    { id: 'enrollments', name: 'Enrollments', icon: Users }
  ];

  const courseCategories = [
    'Mathematics', 'Science', 'English', 'History', 'Geography', 
    'Computer Science', 'Art', 'Music', 'Physical Education', 'Other'
  ];

  const courseLevels = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/lms/courses');
      const data = await response.json();
      if (data.status === 'success') {
        setCourses(data.data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (courseId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/lms/courses/${courseId}/lessons`);
      const data = await response.json();
      if (data.status === 'success') {
        setLessons(data.data.lessons);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async (courseId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/lms/courses/${courseId}/quizzes`);
      const data = await response.json();
      if (data.status === 'success') {
        setQuizzes(data.data.quizzes);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    if (activeTab === 'lessons') {
      fetchLessons(course.id);
    } else if (activeTab === 'quizzes') {
      fetchQuizzes(course.id);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || course.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const renderCourses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Courses</h2>
        <button
          onClick={() => { setModalType('course'); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Course
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {courseCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {course.level}
                </span>
                <span className="text-sm text-gray-500">{course.courseCode}</span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {course.duration}h
                </span>
                <span>{course.category}</span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleCourseSelect(course)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                >
                  View Details
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLessons = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Lessons</h2>
        {selectedCourse && (
          <button
            onClick={() => { setModalType('lesson'); setShowModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Lesson
          </button>
        )}
      </div>

      {selectedCourse ? (
        <div>
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900">{selectedCourse.title}</h3>
            <p className="text-blue-700 text-sm">{selectedCourse.description}</p>
          </div>
          
          <div className="space-y-4">
            {lessons.map((lesson, index) => (
              <div key={lesson.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                      <p className="text-gray-600 text-sm">{lesson.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {lesson.duration}m
                    </span>
                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {lesson.lessonType}
                    </span>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Course</h3>
          <p className="text-gray-500">Choose a course from the Courses tab to view its lessons.</p>
        </div>
      )}
    </div>
  );

  const renderQuizzes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quizzes</h2>
        {selectedCourse && (
          <button
            onClick={() => { setModalType('quiz'); setShowModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Quiz
          </button>
        )}
      </div>

      {selectedCourse ? (
        <div>
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900">{selectedCourse.title}</h3>
            <p className="text-blue-700 text-sm">{selectedCourse.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white rounded-lg shadow-md p-6">
                <h4 className="font-semibold text-gray-900 mb-2">{quiz.title}</h4>
                <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Time Limit:</span>
                    <span>{quiz.timeLimit} minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Marks:</span>
                    <span>{quiz.totalMarks}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Passing Marks:</span>
                    <span>{quiz.passingMarks}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                    View Quiz
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Course</h3>
          <p className="text-gray-500">Choose a course from the Courses tab to view its quizzes.</p>
        </div>
      )}
    </div>
  );

  const renderEnrollments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Student Enrollments</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Enrollments</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{enrollment.course?.title}</h4>
                  <p className="text-sm text-gray-500">{enrollment.course?.courseCode}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    enrollment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    enrollment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {enrollment.status}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">{enrollment.progress}% complete</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Management System</h1>
        <p className="text-gray-600">Manage courses, lessons, quizzes, and student enrollments</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
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
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'courses' && renderCourses()}
          {activeTab === 'lessons' && renderLessons()}
          {activeTab === 'quizzes' && renderQuizzes()}
          {activeTab === 'enrollments' && renderEnrollments()}
        </>
      )}
    </div>
  );
};

export default LMS;
