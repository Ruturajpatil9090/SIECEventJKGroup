import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL

export const eventSuperMasterApi = createApi({
    reducerPath: "eventSuperMasterApi",
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: ['EventSuperMaster'],
    endpoints: (builder) => ({
        getEventSuperMasters: builder.query({
            query: () => '/event-supers',
            providesTags: ['EventSuperMaster']
        }),
        getEventSuperMasterById: builder.query({
            query: (id) => `/event-supers/${id}`,
            providesTags: ['EventSuperMaster']
        }),
        getMaxEventSuperId: builder.query({
            query: () => '/event-supers/getlastEventSuperId',
            providesTags: ['EventSuperMaster']
        }),
        addEventSuperMaster: builder.mutation({
            query: (eventSuper) => ({
                url: '/event-supers',
                method: "POST",
                body: eventSuper
            }),
            invalidatesTags: ['EventSuperMaster']
        }),
        updateEventSuperMaster: builder.mutation({
            query: ({ id, ...eventSuper }) => ({
                url: `/event-supers/${id}`,
                method: "PUT",
                body: eventSuper
            }),
            invalidatesTags: ['EventSuperMaster']
        }),
        deleteEventSuperMaster: builder.mutation({
            query: (id) => ({
                url: `/event-supers/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['EventSuperMaster']
        })
    })
})

export const {
    useGetEventSuperMastersQuery,
    useGetEventSuperMasterByIdQuery,
    useGetMaxEventSuperIdQuery,
    useAddEventSuperMasterMutation,
    useUpdateEventSuperMasterMutation,
    useDeleteEventSuperMasterMutation
} = eventSuperMasterApi;