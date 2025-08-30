import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL

export const ministerialSessionApi = createApi({
    reducerPath: "ministerialSessionApi",
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: ['MinisterialSession'],
    endpoints: (builder) => ({

        getMinisterialSessions: builder.query({
            query: (params = {}) => {
                const event_code = params.event_code ?? sessionStorage.getItem("Event_Code");
                return `/ministerial-sessions?event_code=${event_code}`;
            },
            providesTags: ['MinisterialSession']
        }),
        getMinisterialSessionById: builder.query({
            query: (id) => `/ministerial-sessions/${id}`,
            providesTags: ['MinisterialSession']
        }),
        getMaxMinisterialSessionId: builder.query({
            query: () => '/ministerial-sessions/getlastMinisterialSessionId',
            providesTags: ['MinisterialSession']
        }),
        getMinisterialSessionsByEventCode: builder.query({
            query: (eventCode) => `/ministerial-sessions/?event_code=${eventCode}`,
            providesTags: ['MinisterialSession']
        }),
        getMinisterialSessionsBySponsor: builder.query({
            query: (sponsorId) => `/ministerial-sessions/?sponsor_id=${sponsorId}`,
            providesTags: ['MinisterialSession']
        }),
        getMinisterialSessionsByTrack: builder.query({
            query: (track) => `/ministerial-sessions/?track=${track}`,
            providesTags: ['MinisterialSession']
        }),
        addMinisterialSession: builder.mutation({
            query: (ministerialSession) => ({
                url: '/ministerial-sessions',
                method: "POST",
                body: ministerialSession
            }),
            invalidatesTags: ['MinisterialSession']
        }),
        updateMinisterialSession: builder.mutation({
            query: ({ id, ...ministerialSession }) => ({
                url: `/ministerial-sessions/${id}`,
                method: "PUT",
                body: ministerialSession
            }),
            invalidatesTags: ['MinisterialSession']
        }),
        deleteMinisterialSession: builder.mutation({
            query: (id) => ({
                url: `/ministerial-sessions/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['MinisterialSession']
        })
    })
})

export const {
    useGetMinisterialSessionsQuery,
    useGetMinisterialSessionByIdQuery,
    useGetMaxMinisterialSessionIdQuery,
    useGetMinisterialSessionsByEventCodeQuery,
    useGetMinisterialSessionsBySponsorQuery,
    useGetMinisterialSessionsByTrackQuery,
    useAddMinisterialSessionMutation,
    useUpdateMinisterialSessionMutation,
    useDeleteMinisterialSessionMutation
} = ministerialSessionApi;