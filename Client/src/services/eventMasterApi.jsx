import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const eventMasterApi = createApi({
    reducerPath: "eventMasterApi",
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8000" }), 
    tagTypes: ['EventMaster'],
    endpoints: (builder) => ({
        getEventMasters: builder.query({
            query: () => '/event-masters',
            providesTags: ['EventMaster']
        }),
        getEventMastersBySuperId: builder.query({
            query: (superId) => `/event-masters/by-super/${superId}`,
            providesTags: ['EventMaster']
        }),
        getEventMasterById: builder.query({
            query: (id) => `/event-masters/${id}`,
            providesTags: ['EventMaster']
        }),
        getMaxEventMasterId: builder.query({
            query: () => '/event-masters/getlastEventMasterId',
            providesTags: ['EventMaster']
        }),
        addEventMaster: builder.mutation({
            query: (eventMaster) => ({
                url: '/event-masters',
                method: "POST",
                body: eventMaster
            }),
            invalidatesTags: ['EventMaster']
        }),
        updateEventMaster: builder.mutation({
            query: ({ id, ...eventMaster }) => ({
                url: `/event-masters/${id}`,
                method: "PUT",
                body: eventMaster
            }),
            invalidatesTags: ['EventMaster']
        }),
        deleteEventMaster: builder.mutation({
            query: (id) => ({
                url: `/event-masters/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['EventMaster']
        })
    })
})

export const { 
    useGetEventMastersQuery, 
    useGetEventMastersBySuperIdQuery,
    useGetEventMasterByIdQuery,
    useGetMaxEventMasterIdQuery,
    useAddEventMasterMutation, 
    useUpdateEventMasterMutation, 
    useDeleteEventMasterMutation 
} = eventMasterApi;