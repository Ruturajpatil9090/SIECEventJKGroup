import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Trash2, X, Loader2, Edit, Plus, MapPin, Calendar, Clock, Users, Type, FileText } from 'lucide-react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Select from 'react-select';
import { useGetCalendarEventsQuery, useCreateCalendarEventMutation, useUpdateCalendarEventMutation, useDeleteCalendarEventMutation } from '../../services/calendarApi';
import { useGetUserMastersQuery } from '../../services/userMasterApi';

const localizer = momentLocalizer(moment);

// Enhanced Event type colors with gradients
const EVENT_TYPE_COLORS = {
  meeting: 'linear-gradient(135deg, #3B82F6, #2563EB)',
  task: 'linear-gradient(135deg, #10B981, #059669)',
  appointment: 'linear-gradient(135deg, #F59E0B, #D97706)'
};

// Hover colors for events
const EVENT_HOVER_COLORS = {
  meeting: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
  task: 'linear-gradient(135deg, #059669, #047857)',
  appointment: 'linear-gradient(135deg, #D97706, #B45309)'
};

const CalendarView = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [modalAnimation, setModalAnimation] = useState('enter');

  const currentUserId = parseInt(sessionStorage.getItem('user_id'));
  const [formData, setFormData] = useState({
    Title: '',
    Description: '',
    StartDateTime: '',
    EndDateTime: '',
    EventType: 'meeting',
    Location: '',
    OrganizerId: currentUserId,
    AssignedUserIds: [currentUserId],
    IsAllDay: false
  });

  const [selectedOptions, setSelectedOptions] = useState({
    users: []
  });

  const [formErrors, setFormErrors] = useState({});

  const { data: events = [], refetch, isLoading, isError } = useGetCalendarEventsQuery({
    userId: currentUserId,
    startDate: moment(date).startOf('month').format('YYYY-MM-DD'),
    endDate: moment(date).endOf('month').format('YYYY-MM-DD')
  });

  const { data: userdata = [], isLoading: isUserdataLoading } = useGetUserMastersQuery();
  const [createEvent, { isLoading: isCreating }] = useCreateCalendarEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateCalendarEventMutation();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteCalendarEventMutation();

  const userdataOptions = useMemo(() =>
    userdata.map(user => ({
      value: user.User_Id,
      label: `${user.User_Id} - ${user.userfullname}`
    })),
    [userdata]
  );

  useEffect(() => {
    if (currentUserId && userdataOptions.length > 0) {
      const currentUserOption = userdataOptions.find(o => o.value === currentUserId);
      if (currentUserOption) {
        setSelectedOptions({
          users: [currentUserOption]
        });
        setFormData(prev => ({
          ...prev,
          AssignedUserIds: [currentUserId]
        }));
      }
    }
  }, [currentUserId, userdataOptions]);

  const today = useMemo(() => moment().format('YYYY-MM-DD'), []);
  const currentTime = useMemo(() => moment().format('HH:mm'), []);

  const convertTo24HourFormat = (time12, dateString) => {
    if (!time12 || !dateString) return '';
    const [time, period] = time12.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);

    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    const localDate = new Date(`${dateString}T${hours.toString().padStart(2, '0')}:${minutes}`)
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hour24 = String(localDate.getHours()).padStart(2, '0');
    const minute24 = String(localDate.getMinutes()).padStart(2, '0');

    return `${hour24}:${minute24}`;
  };

  const handleSelectSlot = useCallback(({ start, end }) => {
    const currentUserOption = userdataOptions.find(o => o.value === currentUserId);

    const now = new Date();
    const adjustedStart = start < now ? now : start;
    const adjustedEnd = end < now ? new Date(now.getTime() + 60 * 60 * 1000) : end;

    const startTime12 = moment(adjustedStart).format('h:mm A');
    const endTime12 = moment(adjustedEnd).format('h:mm A');

    setFormData({
      Title: '',
      Description: '',
      StartDateTime: moment(adjustedStart).format('YYYY-MM-DD'),
      StartTime: startTime12,
      EndDateTime: moment(adjustedEnd).format('YYYY-MM-DD'),
      EndTime: endTime12,
      EventType: 'meeting',
      Location: '',
      OrganizerId: currentUserId,
      AssignedUserIds: [currentUserId],
      IsAllDay: moment(adjustedEnd).diff(moment(adjustedStart), 'hours') >= 24
    });

    setSelectedOptions({
      users: currentUserOption ? [currentUserOption] : []
    });

    setSelectedEvent(null);
    setModalAnimation('enter');
    setShowModal(true);
  }, [currentUserId, userdataOptions]);

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);

    const selectedUsers = event.AssignedUserIds.map(userId =>
      userdataOptions.find(o => o.value === userId)
    ).filter(Boolean);

    const startTime12 = moment(event.start).format('h:mm A');
    const endTime12 = moment(event.end).format('h:mm A');

    setFormData({
      Title: event.Title,
      Description: event.Description || '',
      StartDateTime: moment(event.start).format('YYYY-MM-DD'),
      StartTime: startTime12,
      EndDateTime: moment(event.end).format('YYYY-MM-DD'),
      EndTime: endTime12,
      EventType: event.EventType,
      Location: event.Location || '',
      OrganizerId: event.OrganizerId,
      AssignedUserIds: event.AssignedUserIds || [],
      IsAllDay: event.IsAllDay || false
    });

    setSelectedOptions({
      users: selectedUsers
    });

    setModalAnimation('enter');
    setShowModal(true);
  }, [userdataOptions]);

  const validateForm = () => {
    const errors = {};

    const startDateTime = new Date(`${formData.StartDateTime}T${convertTo24HourFormat(formData.StartTime)}`);
    const endDateTime = new Date(`${formData.EndDateTime}T${convertTo24HourFormat(formData.EndTime)}`);
    const now = new Date();

    if (startDateTime < now) {
      errors.StartTime = 'Start date/time cannot be in the past';
    }

    if (endDateTime <= startDateTime) {
      errors.EndTime = 'End date/time must be after start date/time';
    }

    if (!formData.Title.trim()) {
      errors.Title = 'Title is required';
    }

    if (!selectedOptions.users.length) {
      errors.users = 'At least one user must be assigned';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const startTime24 = convertTo24HourFormat(formData.StartTime, formData.StartDateTime);
      const endTime24 = convertTo24HourFormat(formData.EndTime, formData.EndDateTime);

      // Create date strings that preserve the local time
      const startDateTime = new Date(`${formData.StartDateTime}T${startTime24}`);
      const endDateTime = new Date(`${formData.EndDateTime}T${endTime24}`);

      // Format for database without timezone conversion
      const formatForDB = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      const eventData = {
        Title: formData.Title,
        Description: formData.Description,
        StartDateTime: formatForDB(startDateTime),
        EndDateTime: formatForDB(endDateTime),
        EventType: formData.EventType,
        Location: formData.Location,
        OrganizerId: currentUserId,
        AssignedUserIds: selectedOptions.users.map(user => user.value),
        IsAllDay: formData.IsAllDay
      };

      if (selectedEvent) {
        await updateEvent({
          id: selectedEvent.CalendarEventId,
          userId: currentUserId,
          ...eventData
        }).unwrap();
      } else {
        await createEvent(eventData).unwrap();
      }

      handleCloseModal();
      refetch();
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleDelete = async () => {
    if (selectedEvent) {
      try {
        await deleteEvent({
          id: selectedEvent.CalendarEventId,
          userId: currentUserId
        }).unwrap();
        handleCloseModal();
        refetch();
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setModalAnimation('exit');
    setTimeout(() => {
      setShowModal(false);
      setSelectedEvent(null);
      setFormErrors({});
      resetForm();
    }, 300);
  };

  const resetForm = () => {
    setFormData({
      Title: '',
      Description: '',
      StartDateTime: '',
      StartTime: '',
      EndDateTime: '',
      EndTime: '',
      EventType: 'meeting',
      Location: '',
      OrganizerId: currentUserId,
      AssignedUserIds: [currentUserId],
      IsAllDay: false
    });

    const currentUserOption = userdataOptions.find(o => o.value === currentUserId);
    setSelectedOptions({
      users: currentUserOption ? [currentUserOption] : []
    });
  };

  const calendarEvents = useMemo(() => {
    return events.map(event => ({
      ...event,
      start: new Date(event.StartDateTime),
      end: new Date(event.EndDateTime),
      title: event.Title,
      style: {
        background: EVENT_TYPE_COLORS[event.EventType] || EVENT_TYPE_COLORS.meeting,
        color: 'white',
        borderRadius: '8px',
        border: 'none',
        padding: '6px 8px',
        fontSize: '13px',
        fontWeight: '500',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }
    }));
  }, [events]);

  const EventComponent = ({ event }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        className="p-1 transition-all duration-300 transform hover:scale-105"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="flex flex-col p-2 rounded-lg shadow-sm event-item"
          style={{
            background: isHovered
              ? (EVENT_HOVER_COLORS[event.EventType] || EVENT_HOVER_COLORS.meeting)
              : (EVENT_TYPE_COLORS[event.EventType] || EVENT_TYPE_COLORS.meeting),
            transform: isHovered ? 'translateY(-2px)' : 'none',
            boxShadow: isHovered
              ? '0 4px 12px rgba(0, 0, 0, 0.2)'
              : '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div className="flex items-center">
            <span className="text-xs font-semibold truncate">{event.title}</span>
          </div>
          <div className="text-xs opacity-90 mt-1">
            {moment(event.start).format('h:mm A')} - {moment(event.end).format('h:mm A')}
          </div>
        </div>
      </div>
    );
  };

  const CustomToolbar = (toolbar) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
      toolbar.onNavigate('TODAY');
    };

    const changeView = (view) => {
      toolbar.onView(view);
    };

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <button
            onClick={goToBack}
            className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            ‹
          </button>
          <button
            onClick={goToCurrent}
            className="p-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Today
          </button>
          <button
            onClick={goToNext}
            className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            ›
          </button>
          <span className="text-lg font-semibold text-gray-800 ml-2">
            {toolbar.label}
          </span>
        </div>
        <div className="flex space-x-1 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          {['month', 'week', 'day', 'agenda'].map((viewType) => (
            <button
              key={viewType}
              onClick={() => changeView(viewType)}
              className={`px-3 py-1 rounded-md text-sm transition-all duration-200 ${toolbar.view === viewType
                ? 'bg-blue-600 text-white shadow-inner'
                : 'text-gray-600 hover:bg-blue-50'
                }`}
            >
              {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-800 font-medium">Loading your calendar...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg">
          <div className="text-red-500 text-lg font-medium mb-2">Error loading calendar events</div>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-12xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 transform transition-all duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                My Schedule
              </h1>
              <p className="text-gray-500 mt-1">Manage your events,mettings and appointments</p>
            </div>
            <button
              onClick={() => {
                setModalAnimation('enter');
                setShowModal(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Event
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-inner p-4 h-[500px] sm:h-[600px] calendar-container">
            <BigCalendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              views={['month', 'week', 'day', 'agenda']}
              defaultView="month"
              date={date}
              onNavigate={setDate}
              onView={setView}
              style={{ height: '100%' }}
              components={{
                event: EventComponent,
                toolbar: CustomToolbar
              }}
              eventPropGetter={(event) => ({
                style: event.style
              })}
            />
          </div>
        </div>

        {/* Modal with animations */}
        {showModal && (
          <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${modalAnimation === 'enter' ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${modalAnimation === 'enter' ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 transform hover:rotate-90 transition-transform"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <div className="relative">
                      <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.Title}
                        onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Event title"
                        required
                      />
                    </div>
                    {formErrors.Title && <p className="text-red-500 text-xs mt-1">{formErrors.Title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={formData.EventType}
                        onChange={(e) => setFormData({ ...formData, EventType: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                        required
                      >
                        <option value="meeting">Meeting</option>
                        <option value="task">Task</option>
                        <option value="appointment">Appointment</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        value={formData.StartDateTime}
                        onChange={(e) => setFormData({ ...formData, StartDateTime: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        min={today}
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={formData.StartTime}
                        onChange={(e) => setFormData({ ...formData, StartTime: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                        required
                      >
                        <option value="">Select time</option>
                        {Array.from({ length: 96 }, (_, i) => {
                          const totalMinutes = i * 15;
                          const hours = Math.floor(totalMinutes / 60);
                          const minutes = totalMinutes % 60;
                          const period = hours >= 12 ? 'PM' : 'AM';
                          const hour12 = hours % 12 || 12;
                          const timeValue = `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;

                          return (
                            <option key={i} value={timeValue}>
                              {timeValue}
                            </option>
                          );
                        })}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    {formErrors.StartTime && <p className="text-red-500 text-xs mt-1">{formErrors.StartTime}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        value={formData.EndDateTime}
                        onChange={(e) => setFormData({ ...formData, EndDateTime: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        min={formData.StartDateTime || today}
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={formData.EndTime}
                        onChange={(e) => setFormData({ ...formData, EndTime: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                        required
                      >
                        <option value="">Select time</option>
                        {Array.from({ length: 96 }, (_, i) => {
                          const totalMinutes = i * 15;
                          const hours = Math.floor(totalMinutes / 60);
                          const minutes = totalMinutes % 60;
                          const period = hours >= 12 ? 'PM' : 'AM';
                          const hour12 = hours % 12 || 12;
                          const timeValue = `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;

                          return (
                            <option key={i} value={timeValue}>
                              {timeValue}
                            </option>
                          );
                        })}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    {formErrors.EndTime && <p className="text-red-500 text-xs mt-1">{formErrors.EndTime}</p>}
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.Location}
                      onChange={(e) => setFormData({ ...formData, Location: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Event location"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
                      rows={3}
                      value={formData.Description}
                      onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Event description"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned Users *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <Select
                      options={userdataOptions}
                      value={selectedOptions.users}
                      onChange={(selected) => {
                        setSelectedOptions(prev => ({ ...prev, users: selected || [] }));
                      }}
                      isMulti
                      isSearchable
                      placeholder="Select users..."
                      isLoading={isUserdataLoading}
                      className="react-select-container pl-8"
                      classNamePrefix="react-select"
                      required
                    />
                  </div>
                  {formErrors.users && <p className="text-red-500 text-xs mt-1">{formErrors.users}</p>}
                  <p className="text-sm text-gray-500 mt-2">
                    Only selected users will be able to see this event
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  {selectedEvent && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex items-center px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                  >
                    {isCreating || isUpdating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : selectedEvent ? (
                      <Edit className="w-4 h-4 mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    {isCreating || isUpdating
                      ? (selectedEvent ? 'Updating...' : 'Creating...')
                      : (selectedEvent ? 'Update Event' : 'Create Event')
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .react-select-container .react-select__control {
          padding-left: 2.5rem;
        }
        
        .calendar-container .rbc-month-view,
        .calendar-container .rbc-time-view,
        .calendar-container .rbc-agenda-view {
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }
        
        .calendar-container .rbc-header {
          padding: 0.5rem;
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
          color: #374151;
        }
        
        .calendar-container .rbc-today {
          background-color: #eff6ff;
        }
        
        .calendar-container .rbc-button-link {
          color: #1f2937;
          font-weight: 500;
        }
        
        .calendar-container .rbc-off-range-bg {
          background-color: #f9fafb;
        }
        
        .calendar-container .rbc-event {
          border: none;
        }
      `}</style>
    </div>
  );
};

export default CalendarView;