"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  Calendar, 
  Plus, 
  Clock,
  MapPin,
  FileText,
  Upload,
  Download,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Stethoscope,
  User,
  Building,
  Bell,
  Star,
  Paperclip
} from 'lucide-react';

interface Rotation {
  id: string;
  title: string;
  specialty: string;
  hospital: string;
  startDate: Date;
  endDate: Date;
  supervisor: string;
  notes: string;
  files: string[];
  color: string;
  completed: boolean;
  rating?: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'rotation' | 'exam' | 'meeting' | 'deadline';
  description?: string;
}

const CalendarRotationsPage = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [rotations, setRotations] = useState<Rotation[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'add'>('calendar');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with Firebase queries
  useEffect(() => {
    const mockRotations: Rotation[] = [
      {
        id: '1',
        title: 'Internal Medicine Rotation',
        specialty: 'Internal Medicine',
        hospital: 'Tampa General Hospital',
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-08-31'),
        supervisor: 'Dr. Michael Johnson',
        notes: 'Focus on diabetes management and hypertension protocols',
        files: ['IM_Guidelines.pdf', 'Patient_Cases.docx'],
        color: 'blue',
        completed: false,
        rating: 4.5
      },
      {
        id: '2',
        title: 'Cardiology Rotation',
        specialty: 'Cardiology',
        hospital: 'Moffitt Heart Institute',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-09-30'),
        supervisor: 'Dr. Sarah Chen',
        notes: 'Emphasis on ECG interpretation and cardiac catheterization',
        files: ['Cardiology_Handbook.pdf'],
        color: 'red',
        completed: false
      },
      {
        id: '3',
        title: 'Emergency Medicine',
        specialty: 'Emergency Medicine',
        hospital: 'Tampa General ED',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-31'),
        supervisor: 'Dr. Amanda Rodriguez',
        notes: 'Completed - Great exposure to trauma cases',
        files: ['EM_Protocols.pdf', 'Trauma_Cases.docx', 'Final_Evaluation.pdf'],
        color: 'orange',
        completed: true,
        rating: 4.8
      }
    ];

    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Cardiology Orientation',
        date: new Date('2025-08-15'),
        time: '9:00 AM',
        type: 'meeting',
        description: 'Meet with Dr. Chen for rotation orientation'
      },
      {
        id: '2',
        title: 'USMLE Step 2 Exam',
        date: new Date('2025-08-20'),
        time: '8:00 AM',
        type: 'exam',
        description: 'USMLE Step 2 CK examination'
      }
    ];

    setRotations(mockRotations);
    setEvents(mockEvents);
    setLoading(false);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    if (!date) return [];
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const getRotationForDate = (date: Date) => {
    if (!date) return null;
    return rotations.find(rotation => 
      date >= rotation.startDate && date <= rotation.endDate
    );
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Calendar className="h-10 w-10" />
              <div>
                <h1 className="text-3xl font-bold">Calendar & Rotations</h1>
                <p className="text-purple-100">Track your rotations, schedules, and important dates</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode('add')}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Rotation
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Mode Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8">
          <div className="flex space-x-1">
            {[
              { id: 'calendar', name: 'Calendar View', icon: Calendar },
              { id: 'list', name: 'Rotations List', icon: FileText },
              { id: 'add', name: 'Add Rotation', icon: Plus }
            ].map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setViewMode(id as any)}
                className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  viewMode === id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {name}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-3 text-center font-semibold text-gray-600 bg-gray-50 rounded-lg">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentDate).map((date, index) => {
                  if (!date) {
                    return <div key={index} className="p-4"></div>;
                  }

                  const dayEvents = getEventsForDate(date);
                  const dayRotation = getRotationForDate(date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isSelected = selectedDate?.toDateString() === date.toDateString();

                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`p-2 min-h-[100px] border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        isToday ? 'bg-purple-100 border-purple-300' :
                        isSelected ? 'bg-blue-100 border-blue-300' :
                        dayRotation ? 'bg-green-50 border-green-200' :
                        'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`text-sm font-semibold mb-1 ${
                        isToday ? 'text-purple-700' : 'text-gray-900'
                      }`}>
                        {date.getDate()}
                      </div>
                      
                      {dayRotation && (
                        <div className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded mb-1 truncate">
                          {dayRotation.specialty}
                        </div>
                      )}
                      
                      {dayEvents.map(event => (
                        <div
                          key={event.id}
                          className={`text-xs px-2 py-1 rounded mb-1 truncate ${
                            event.type === 'exam' ? 'bg-red-200 text-red-800' :
                            event.type === 'meeting' ? 'bg-blue-200 text-blue-800' :
                            'bg-gray-200 text-gray-800'
                          }`}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Current Rotations */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Current Rotations
                </h3>
                <div className="space-y-3">
                  {rotations.filter(r => !r.completed && new Date() >= r.startDate && new Date() <= r.endDate).map(rotation => (
                    <div key={rotation.id} className="p-4 bg-green-50 border border-green-200 rounded-xl">
                      <h4 className="font-semibold text-green-800">{rotation.title}</h4>
                      <p className="text-sm text-green-600">{rotation.hospital}</p>
                      <p className="text-xs text-green-500 mt-1">
                        Until {rotation.endDate.toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Upcoming Events
                </h3>
                <div className="space-y-3">
                  {events.slice(0, 3).map(event => (
                    <div key={event.id} className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <h4 className="font-semibold text-blue-800">{event.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-blue-600 mt-1">
                        <Clock className="h-4 w-4" />
                        {event.date.toLocaleDateString()} at {event.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-6">
            {rotations.map((rotation) => (
              <div key={rotation.id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{rotation.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        rotation.completed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {rotation.completed ? 'Completed' : 'In Progress'}
                      </span>
                      {rotation.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{rotation.rating}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building className="h-4 w-4" />
                        {rotation.hospital}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="h-4 w-4" />
                        {rotation.supervisor}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {rotation.startDate.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        {Math.ceil((rotation.endDate.getTime() - rotation.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{rotation.notes}</p>

                    {rotation.files.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Paperclip className="h-4 w-4" />
                          Attached Files
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {rotation.files.map((file, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {file}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload
                    </button>
                    <button className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'add' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Rotation</h2>
              <p className="text-gray-600">Track your medical rotation schedule and progress</p>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Rotation Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Internal Medicine Rotation"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Specialty</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="">Select specialty</option>
                    <option value="internal-medicine">Internal Medicine</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="emergency">Emergency Medicine</option>
                    <option value="surgery">Surgery</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="psychiatry">Psychiatry</option>
                    <option value="radiology">Radiology</option>
                    <option value="neurology">Neurology</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Hospital/Location</label>
                  <input
                    type="text"
                    placeholder="e.g., Tampa General Hospital"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Supervisor</label>
                  <input
                    type="text"
                    placeholder="e.g., Dr. Michael Johnson"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">End Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Notes & Goals</label>
                <textarea
                  placeholder="Add any notes about this rotation, learning goals, or important information..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Upload Files</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Drag and drop files or click to upload</p>
                  <p className="text-sm text-gray-500 mt-1">PDF, DOC, images supported</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105"
                >
                  Save Rotation
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('calendar')}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-6">
            {/* Rotation List Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">My Rotations</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search rotations..."
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                    <Filter className="h-4 w-4" />
                    Filter
                  </button>
                </div>
              </div>
            </div>

            {/* Rotations List continues with the rotation cards I already created above */}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarRotationsPage;