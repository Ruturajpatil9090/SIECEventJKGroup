import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetEventMastersQuery } from '../../services/eventMasterApi';
import { Calendar, ArrowRight, Loader } from 'lucide-react';

function EventList() {
  const { data: events = [], isLoading, isError } = useGetEventMastersQuery();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    
     sessionStorage.setItem("Event_Code", event.EventMasterId);
    
    // Navigate to dashboard
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-lg max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-red-800">Error</h2>
            <p className="text-red-600">Failed to load events. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <Calendar className="h-10 w-10 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Select an Event</h1>
          </div>
          {/* <p className="text-lg text-gray-600">
            Choose an event to access its dashboard and management tools
          </p> */}
        </div>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Available Events</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {events.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-lg">No events available</p>
                <p className="text-gray-400 mt-2">Please check back later or contact your administrator.</p>
              </div>
            ) : (
              events.map((event) => (
                <div 
                  key={event.EventMasterId} 
                  className="p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleEventSelect(event)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {event.EventMasterId} - {event.EventMaster_Name}
                      </h3>
                      
                      <div className="mt-2 flex flex-wrap gap-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                          <span>
                            {new Date(event.Start_Date).toLocaleDateString()} 
                            {event.End_Date && ` - ${new Date(event.End_Date).toLocaleDateString()}`}
                          </span>
                        </div>
                        
                        {/* {event.EventSuperId && (
                          <div className="text-sm text-gray-600">
                            Super Event ID: {event.EventSuperId}
                          </div>
                        )} */}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-shrink-0">
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Select an event to view its dashboard, manage sponsors, and track activities.
          </p>
        </div>
      </div>
    </div>
  );
}

export default EventList;