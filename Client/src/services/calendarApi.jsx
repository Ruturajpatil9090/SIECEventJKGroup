import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

export const calendarApi = createApi({
    reducerPath: "calendarApi",
    baseQuery: fetchBaseQuery({ 
        baseUrl: API_BASE_URL,
        credentials: 'include'
    }),
    tagTypes: ['CalendarEvent'],
    endpoints: (builder) => ({
        getCalendarEvents: builder.query({
            query: (params = {}) => {
                const { userId, startDate, endDate, eventType } = params;
                const queryParams = new URLSearchParams();
                
                queryParams.append('user_id', userId);
                if (startDate) queryParams.append('start_date', startDate);
                if (endDate) queryParams.append('end_date', endDate);
                if (eventType) queryParams.append('event_type', eventType);
                
                return `/calendar?${queryParams.toString()}`;
            },
            providesTags: ['CalendarEvent']
        }),
        getUserCalendarEvents: builder.query({
            query: ({ userId, startDate, endDate }) => 
                `/calendar/user/${userId}?start_date=${startDate}&end_date=${endDate}`,
            providesTags: ['CalendarEvent']
        }),
        getCalendarEventById: builder.query({
            query: ({ id, userId }) => `/calendar/${id}?user_id=${userId}`,
            providesTags: (result, error, { id }) => [{ type: 'CalendarEvent', id }]
        }),
        createCalendarEvent: builder.mutation({
            query: (eventData) => ({
                url: '/calendar',
                method: "POST",
                body: eventData
            }),
            invalidatesTags: ['CalendarEvent']
        }),
        updateCalendarEvent: builder.mutation({
            query: ({ id, userId, ...eventData }) => ({
                url: `/calendar/${id}?user_id=${userId}`,
                method: "PUT",
                body: eventData
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'CalendarEvent', id },
                'CalendarEvent'
            ]
        }),
        deleteCalendarEvent: builder.mutation({
            query: ({ id, userId }) => ({
                url: `/calendar/${id}?user_id=${userId}`,
                method: "DELETE",
            }),
            invalidatesTags: ['CalendarEvent']
        })
    })
});

export const {
    useGetCalendarEventsQuery,
    useGetUserCalendarEventsQuery,
    useGetCalendarEventByIdQuery,
    useCreateCalendarEventMutation,
    useUpdateCalendarEventMutation,
    useDeleteCalendarEventMutation
} = calendarApi;