import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Clock } from 'lucide-react';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    eventType: 'other',
    startDate: '',
    endDate: '',
    isAllDay: false,
    location: '',
    color: '#3B82F6',
    targetAudience: 'all'
  });

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockEvents = [
        {
          id: '1',
          title: 'Parent-Teacher Meeting',
          description: 'Monthly parent-teacher meeting',
          eventType: 'meeting',
          startDate: new Date(2024, 11, 15, 10, 0),
          endDate: new Date(2024, 11, 15, 12, 0),
          location: 'School Auditorium',
          color: '#10B981',
          targetAudience: 'parents'
        },
        {
          id: '2',
          title: 'Annual Sports Day',
          description: 'School annual sports competition',
          eventType: 'sports',
          startDate: new Date(2024, 11, 20, 9, 0),
          endDate: new Date(2024, 11, 20, 17, 0),
          location: 'School Ground',
          color: '#F59E0B',
          targetAudience: 'all'
        },
        {
          id: '3',
          title: 'Final Exams',
          description: 'End of semester examinations',
          eventType: 'exam',
          startDate: new Date(2024, 11, 25, 9, 0),
          endDate: new Date(2024, 11, 30, 17, 0),
          location: 'Classrooms',
          color: '#EF4444',
          targetAudience: 'students'
        }
      ];
      setEvents(mockEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingEvent) {
        // Update event
        setEvents(prev => prev.map(event => 
          event.id === editingEvent.id 
            ? { ...event, ...eventForm }
            : event
        ));
      } else {
        // Create new event
        const newEvent = {
          id: Date.now().toString(),
          ...eventForm,
          startDate: new Date(eventForm.startDate),
          endDate: new Date(eventForm.endDate)
        };
        setEvents(prev => [...prev, newEvent]);
      }
      
      setShowEventModal(false);
      setEditingEvent(null);
      setEventForm({
        title: '',
        description: '',
        eventType: 'other',
        startDate: '',
        endDate: '',
        isAllDay: false,
        location: '',
        color: '#3B82F6',
        targetAudience: 'all'
      });
    } catch (error) {
      console.error('Error saving event:', error);
    }
    setLoading(false);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      startDate: event.startDate.toISOString().slice(0, 16),
      endDate: event.endDate.toISOString().slice(0, 16),
      isAllDay: event.isAllDay,
      location: event.location,
      color: event.color,
      targetAudience: event.targetAudience
    });
    setShowEventModal(true);
  };

  const handleDelete = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(prev => prev.filter(event => event.id !== eventId));
    }
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Previous month's trailing days
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push(
        <div key={`prev-${i}`} className="p-2 text-gray-400 text-sm">
          {prevDate.getDate()}
        </div>
      );
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayEvents = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();

      days.push(
        <div
          key={day}
          className={`p-2 cursor-pointer hover:bg-gray-100 rounded ${
            isToday ? 'bg-blue-100' : ''
          } ${isSelected ? 'bg-blue-200' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="text-sm font-medium">{day}</div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event, index) => (
              <div
                key={index}
                className="text-xs p-1 rounded text-white truncate"
                style={{ backgroundColor: event.color }}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">School Calendar</h1>
        <button
          onClick={() => setShowEventModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                ←
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="p-2 hover:bg-gray-100 rounded"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Events for {selectedDate.toLocaleDateString()}
          </h3>
          
          {selectedDateEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No events scheduled</p>
          ) : (
            <div className="space-y-3">
              {selectedDateEvents.map(event => (
                <div key={event.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  {event.description && (
                    <p className="text-xs text-gray-600 mb-2">{event.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {event.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <span 
                      className="inline-block px-2 py-1 text-xs rounded-full text-white"
                      style={{ backgroundColor: event.color }}
                    >
                      {event.eventType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={eventForm.startDate}
                    onChange={(e) => setEventForm({...eventForm, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={eventForm.endDate}
                    onChange={(e) => setEventForm({...eventForm, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  value={eventForm.eventType}
                  onChange={(e) => setEventForm({...eventForm, eventType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="holiday">Holiday</option>
                  <option value="exam">Exam</option>
                  <option value="meeting">Meeting</option>
                  <option value="sports">Sports</option>
                  <option value="cultural">Cultural</option>
                  <option value="academic">Academic</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEventModal(false);
                    setEditingEvent(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingEvent ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
