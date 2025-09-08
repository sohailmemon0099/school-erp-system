import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Users, CheckCircle, XCircle, Clock, AlertCircle, Save, RefreshCw, Filter, Download } from 'lucide-react';

const AttendanceRegister = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('class'); // 'class' or 'all'
  const [groupedStudents, setGroupedStudents] = useState({});
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isExistingAttendance, setIsExistingAttendance] = useState(false);

  // Fetch classes (filtered by teacher assignments)
  const fetchClasses = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/attendance/teacher-classes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setClasses(data.data.classes || []);
      } else {
        console.error('Failed to fetch classes:', response.status);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  }, []);

  // Fetch subjects
  const fetchSubjects = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/subjects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.data.subjects || []);
      } else {
        console.error('Failed to fetch subjects:', response.status);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  }, []);

  // Fetch all students
  const fetchAllStudents = useCallback(async () => {
    if (!selectedDate) {
      console.log('fetchAllStudents: No date selected');
      return;
    }

    console.log('fetchAllStudents: Starting fetch for all students, date:', selectedDate);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/students?limit=1000&date=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const allStudents = data.data.students || [];
        
        // Get existing attendance for all students on the selected date
        const attendancePromises = allStudents.map(async (student) => {
          try {
            const attendanceResponse = await fetch(`/api/attendance?studentId=${student.id}&date=${selectedDate}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (attendanceResponse.ok) {
              const attendanceData = await attendanceResponse.json();
              return {
                ...student,
                attendance: attendanceData.data.attendance[0] || { status: null, remarks: null }
              };
            }
            return {
              ...student,
              attendance: { status: null, remarks: null }
            };
          } catch (error) {
            return {
              ...student,
              attendance: { status: null, remarks: null }
            };
          }
        });

        const studentsWithAttendance = await Promise.all(attendancePromises);
        
        // Group students by standard and division
        const grouped = {};
        studentsWithAttendance.forEach(student => {
          const standard = student.class?.name || 'Unknown';
          const division = student.class?.section || 'Unknown';
          const key = `${standard}-${division}`;
          
          if (!grouped[key]) {
            grouped[key] = {
              standard,
              division,
              students: []
            };
          }
          grouped[key].students.push(student);
        });
        
        setGroupedStudents(grouped);
        setStudents(studentsWithAttendance);
        
        // Check if attendance already exists
        const hasExistingAttendance = studentsWithAttendance.some(student => student.attendance.status !== null);
        setIsExistingAttendance(hasExistingAttendance);
        
        // Initialize attendance data
        const initialAttendance = {};
        studentsWithAttendance.forEach(student => {
          initialAttendance[student.id] = {
            status: student.attendance.status || 'present',
            remarks: student.attendance.remarks || ''
          };
        });
        setAttendanceData(initialAttendance);
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch all students' });
      }
    } catch (error) {
      console.error('Error fetching all students:', error);
      setMessage({ type: 'error', text: 'Error fetching all students' });
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Fetch students for selected class
  const fetchStudents = useCallback(async () => {
    if (!selectedClass || !selectedDate) {
      console.log('fetchStudents: Missing required data', { selectedClass, selectedDate });
      return;
    }

    console.log('fetchStudents: Starting fetch for class:', selectedClass, 'date:', selectedDate);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Use the class-based API endpoint to get students for the specific class
      const response = await fetch(`/api/attendance/class/${selectedClass}/students?date=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const studentsList = data.data.students || [];
        
        console.log('Students from class API:', studentsList.length);
        console.log('Selected class ID:', selectedClass);
        
        // Group students by standard and division
        const grouped = {};
        studentsList.forEach(student => {
          const standard = student.class?.name || 'Unknown';
          const division = student.class?.section || 'Unknown';
          const key = `${standard}-${division}`;
          
          if (!grouped[key]) {
            grouped[key] = {
              standard,
              division,
              students: []
            };
          }
          grouped[key].students.push(student);
        });
        
        setGroupedStudents(grouped);
        setStudents(studentsList);
        
        // Check if attendance already exists
        const hasExistingAttendance = studentsList.some(student => student.attendance.status !== null);
        setIsExistingAttendance(hasExistingAttendance);
        
        // Initialize attendance data
        const initialAttendance = {};
        studentsList.forEach(student => {
          initialAttendance[student.id] = {
            status: student.attendance.status || 'present',
            remarks: student.attendance.remarks || ''
          };
        });
        setAttendanceData(initialAttendance);
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch students for the selected class' });
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage({ type: 'error', text: 'Error fetching students' });
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedDate]);

  // Initialize data
  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, [fetchClasses, fetchSubjects]);

  // Note: Removed automatic useEffect - students are now fetched only when button is clicked

  // Handle attendance status change
  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  // Handle remarks change
  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  // Mark all present
  const markAllPresent = () => {
    const newAttendanceData = {};
    students.forEach(student => {
      newAttendanceData[student.id] = {
        status: 'present',
        remarks: attendanceData[student.id]?.remarks || ''
      };
    });
    setAttendanceData(newAttendanceData);
  };

  // Mark all absent
  const markAllAbsent = () => {
    const newAttendanceData = {};
    students.forEach(student => {
      newAttendanceData[student.id] = {
        status: 'absent',
        remarks: attendanceData[student.id]?.remarks || ''
      };
    });
    setAttendanceData(newAttendanceData);
  };

  // Save attendance
  const saveAttendance = async () => {
    if (!selectedDate) {
      setMessage({ type: 'error', text: 'Please select date' });
      return;
    }

    if (viewMode === 'class' && !selectedClass) {
      setMessage({ type: 'error', text: 'Please select class when using class mode' });
      return;
    }

    setSaving(true);
    try {
      const attendanceRecords = students.map(student => ({
        studentId: student.id,
        status: attendanceData[student.id]?.status || 'present',
        remarks: attendanceData[student.id]?.remarks || ''
      }));

      let response;
      
      if (viewMode === 'class' && selectedClass) {
        // Class-based attendance - use a default subject or create without subject
        const promises = attendanceRecords.map(async (record) => {
          const individualResponse = await fetch('/api/attendance', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              studentId: record.studentId,
              classId: selectedClass,
              subjectId: null, // No subject required
              date: selectedDate,
              status: record.status,
              remarks: record.remarks
            })
          });
          return individualResponse;
        });

        const responses = await Promise.all(promises);
        response = responses[0]; // Use first response for status checking
      } else {
        // Individual student attendance (for all students mode)
        const promises = attendanceRecords.map(async (record) => {
          const individualResponse = await fetch('/api/attendance', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              studentId: record.studentId,
              classId: students.find(s => s.id === record.studentId)?.classId,
              subjectId: null, // No subject required
              date: selectedDate,
              status: record.status,
              remarks: record.remarks
            })
          });
          return individualResponse;
        });

        const responses = await Promise.all(promises);
        response = responses[0]; // Use first response for status checking
      }

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: data.message });
        setIsExistingAttendance(true);
        // Refresh students to get updated data
        fetchStudents();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to save attendance' });
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      setMessage({ type: 'error', text: 'Error saving attendance' });
    } finally {
      setSaving(false);
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'late':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'excused':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'excused':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate statistics
  const getStatistics = () => {
    const total = students.length;
    const present = students.filter(student => attendanceData[student.id]?.status === 'present').length;
    const absent = students.filter(student => attendanceData[student.id]?.status === 'absent').length;
    const late = students.filter(student => attendanceData[student.id]?.status === 'late').length;
    const excused = students.filter(student => attendanceData[student.id]?.status === 'excused').length;
    const attendancePercentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, late, excused, attendancePercentage };
  };

  const stats = getStatistics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="h-8 w-8 mr-3 text-blue-600" />
              Attendance Register
            </h1>
            <p className="text-gray-600 mt-1">Mark and manage student attendance</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {selectedDate && (
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(selectedDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              View Mode *
            </label>
            <select
              value={viewMode}
              onChange={(e) => {
                setViewMode(e.target.value);
                if (e.target.value === 'all') {
                  setSelectedClass('');
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="class">By Class</option>
              <option value="all">All Students</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class {viewMode === 'class' ? '*' : ''}
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={viewMode === 'all'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Choose Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.section}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attendance Date *
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                if (viewMode === 'all') {
                  fetchAllStudents();
                } else {
                  fetchStudents();
                }
              }}
              disabled={(!selectedClass && viewMode === 'class') || !selectedDate || loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Filter className="h-4 w-4 mr-2" />
                  {viewMode === 'all' ? 'Show All Students' : 'Show Students'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {students.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
              <div className="text-sm text-gray-600">Present</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
              <div className="text-sm text-gray-600">Absent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
              <div className="text-sm text-gray-600">Late</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.excused}</div>
              <div className="text-sm text-gray-600">Excused</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.attendancePercentage}%</div>
              <div className="text-sm text-gray-600">Attendance</div>
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Students List */}
      {students.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Student List - {students.length} Students
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={markAllPresent}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
                >
                  Mark All Present
                </button>
                <button
                  onClick={markAllAbsent}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                >
                  Mark All Absent
                </button>
                <button
                  onClick={saveAttendance}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isExistingAttendance ? 'Update Attendance' : 'Save Attendance'}
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {Object.keys(groupedStudents).length > 0 ? (
              Object.entries(groupedStudents).map(([key, group]) => (
                <div key={key} className="mb-8">
                  <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {group.standard} - {group.division}
                      <span className="ml-2 text-sm font-normal text-gray-600">
                        ({group.students.length} students)
                      </span>
                    </h4>
                  </div>
                  
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {group.students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.studentId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={attendanceData[student.id]?.status || 'present'}
                              onChange={(e) => handleStatusChange(student.id, e.target.value)}
                              className={`px-3 py-1 rounded-md border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(attendanceData[student.id]?.status || 'present')}`}
                            >
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="late">Late</option>
                              <option value="excused">Excused</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={attendanceData[student.id]?.remarks || ''}
                              onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                              placeholder="Add remarks..."
                              className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No students found
              </div>
            )}
          </div>
        </div>
      )}

      {/* No students message */}
      {selectedDate && students.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
          <p className="text-gray-600">
            {viewMode === 'all' 
              ? 'No active students found in the system.'
              : 'No active students found for the selected class and date.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AttendanceRegister;
