import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User,
  ChevronLeft,
  ChevronRight,
  Bell
} from 'lucide-react';

const Schedule = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week'); // 'day', 'week', 'month'

  const schedule = [
    {
      id: 1,
      subject: 'Mathematics',
      teacher: 'Mr. Smith',
      room: 'Room 101',
      startTime: '09:00',
      endTime: '10:00',
      day: 'Monday',
      type: 'class'
    },
    {
      id: 2,
      subject: 'English',
      teacher: 'Ms. Johnson',
      room: 'Room 102',
      startTime: '10:15',
      endTime: '11:15',
      day: 'Monday',
      type: 'class'
    },
    {
      id: 3,
      subject: 'Science',
      teacher: 'Dr. Brown',
      room: 'Lab 1',
      startTime: '11:30',
      endTime: '12:30',
      day: 'Monday',
      type: 'lab'
    },
    {
      id: 4,
      subject: 'Lunch Break',
      teacher: '',
      room: 'Cafeteria',
      startTime: '12:30',
      endTime: '13:30',
      day: 'Monday',
      type: 'break'
    },
    {
      id: 5,
      subject: 'History',
      teacher: 'Prof. Davis',
      room: 'Room 103',
      startTime: '13:30',
      endTime: '14:30',
      day: 'Monday',
      type: 'class'
    },
    {
      id: 6,
      subject: 'Geography',
      teacher: 'Ms. Wilson',
      room: 'Room 104',
      startTime: '14:45',
      endTime: '15:45',
      day: 'Monday',
      type: 'class'
    },
    // Tuesday
    {
      id: 7,
      subject: 'Mathematics',
      teacher: 'Mr. Smith',
      room: 'Room 101',
      startTime: '09:00',
      endTime: '10:00',
      day: 'Tuesday',
      type: 'class'
    },
    {
      id: 8,
      subject: 'Physical Education',
      teacher: 'Coach Taylor',
      room: 'Gymnasium',
      startTime: '10:15',
      endTime: '11:15',
      day: 'Tuesday',
      type: 'pe'
    },
    {
      id: 9,
      subject: 'Art',
      teacher: 'Ms. Garcia',
      room: 'Art Studio',
      startTime: '11:30',
      endTime: '12:30',
      day: 'Tuesday',
      type: 'art'
    },
    {
      id: 10,
      subject: 'Lunch Break',
      teacher: '',
      room: 'Cafeteria',
      startTime: '12:30',
      endTime: '13:30',
      day: 'Tuesday',
      type: 'break'
    },
    {
      id: 11,
      subject: 'English',
      teacher: 'Ms. Johnson',
      room: 'Room 102',
      startTime: '13:30',
      endTime: '14:30',
      day: 'Tuesday',
      type: 'class'
    },
    {
      id: 12,
      subject: 'Study Hall',
      teacher: 'Mr. Anderson',
      room: 'Library',
      startTime: '14:45',
      endTime: '15:45',
      day: 'Tuesday',
      type: 'study'
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Math Test',
      date: '2025-09-10',
      time: '09:00',
      type: 'exam',
      subject: 'Mathematics'
    },
    {
      id: 2,
      title: 'Science Project Due',
      date: '2025-09-12',
      time: '23:59',
      type: 'assignment',
      subject: 'Science'
    },
    {
      id: 3,
      title: 'Parent-Teacher Meeting',
      date: '2025-09-18',
      time: '15:00',
      type: 'meeting',
      subject: 'General'
    },
    {
      id: 4,
      title: 'School Holiday',
      date: '2025-09-15',
      time: '00:00',
      type: 'holiday',
      subject: 'General'
    }
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'class':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'lab':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pe':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'art':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'study':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'break':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'exam':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'assignment':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'meeting':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'holiday':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'exam':
        return 'text-red-600 bg-red-100';
      case 'assignment':
        return 'text-blue-600 bg-blue-100';
      case 'meeting':
        return 'text-purple-600 bg-purple-100';
      case 'holiday':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCurrentDaySchedule = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[currentDate.getDay()];
    return schedule.filter(item => item.day === currentDay);
  };

  const getWeekSchedule = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weekSchedule = {};
    
    days.forEach(day => {
      weekSchedule[day] = schedule.filter(item => item.day === day);
    });
    
    return weekSchedule;
  };

  const formatTime = (time) => {
    return time;
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const renderDayView = () => {
    const daySchedule = getCurrentDaySchedule();
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    const dateString = currentDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {dayName}, {dateString}
          </h2>
          
          {daySchedule.length > 0 ? (
            <div className="space-y-3">
              {daySchedule.map((item) => (
                <div key={item.id} className={`p-4 rounded-lg border ${getTypeColor(item.type)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{item.subject}</h3>
                      {item.teacher && (
                        <p className="text-sm opacity-75">with {item.teacher}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatTime(item.startTime)} - {formatTime(item.endTime)}</p>
                      <p className="text-sm opacity-75">{item.room}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No classes scheduled for this day</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekSchedule = getWeekSchedule();
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Weekly Schedule</h2>
        
        <div className="grid grid-cols-7 gap-4">
          {days.map((day) => (
            <div key={day} className="space-y-2">
              <h3 className="font-medium text-gray-900 text-center py-2 border-b">
                {day}
              </h3>
              <div className="space-y-2">
                {weekSchedule[day]?.map((item) => (
                  <div key={item.id} className={`p-2 rounded text-xs border ${getTypeColor(item.type)}`}>
                    <div className="font-medium">{item.subject}</div>
                    <div className="opacity-75">{formatTime(item.startTime)}</div>
                    <div className="opacity-75">{item.room}</div>
                  </div>
                ))}
                {(!weekSchedule[day] || weekSchedule[day].length === 0) && (
                  <div className="text-center py-4 text-gray-400 text-xs">
                    No classes
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
            <p className="text-gray-600">View your class schedule and upcoming events</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* View Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('day')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  view === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  view === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Week
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateDate(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Content */}
      {view === 'day' && renderDayView()}
      {view === 'week' && renderWeekView()}

      {/* Upcoming Events */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
          <Bell className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.subject}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{event.date}</p>
                <p className="text-xs text-gray-500">{event.time}</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getEventTypeColor(event.type)}`}>
                  {event.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
