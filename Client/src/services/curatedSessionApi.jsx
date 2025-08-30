import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL

export const curatedSessionApi = createApi({
    reducerPath: "curatedSessionApi",
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: ['CuratedSession'],
    endpoints: (builder) => ({
        getCuratedSessions: builder.query({
            query: (params = {}) => {
                const event_code = params.event_code ?? sessionStorage.getItem("Event_Code");
                return `/curated-sessions?event_code=${event_code}`;
            },
            providesTags: ['CuratedSession']
        }),
        getCuratedSessionById: builder.query({
            query: (id) => `/curated-sessions/${id}`,
            providesTags: ['CuratedSession']
        }),
        getMaxCuratedSessionId: builder.query({
            query: () => '/curated-sessions/getlastCuratedSessionId',
            providesTags: ['CuratedSession']
        }),
        getCuratedSessionsByEventCode: builder.query({
            query: (eventCode) => `/curated-sessions/?event_code=${eventCode}`,
            providesTags: ['CuratedSession']
        }),
        getCuratedSessionsBySponsor: builder.query({
            query: (sponsorId) => `/curated-sessions/?sponsor_id=${sponsorId}`,
            providesTags: ['CuratedSession']
        }),
        getCuratedSessionsByTrack: builder.query({
            query: (track) => `/curated-sessions/?track=${track}`,
            providesTags: ['CuratedSession']
        }),
        addCuratedSession: builder.mutation({
            query: (curatedSession) => ({
                url: '/curated-sessions',
                method: "POST",
                body: curatedSession
            }),
            invalidatesTags: ['CuratedSession']
        }),
        updateCuratedSession: builder.mutation({
            query: ({ id, ...curatedSession }) => ({
                url: `/curated-sessions/${id}`,
                method: "PUT",
                body: curatedSession
            }),
            invalidatesTags: ['CuratedSession']
        }),
        deleteCuratedSession: builder.mutation({
            query: (id) => ({
                url: `/curated-sessions/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['CuratedSession']
        })
    })
})

export const {
    useGetCuratedSessionsQuery,
    useGetCuratedSessionByIdQuery,
    useGetMaxCuratedSessionIdQuery,
    useGetCuratedSessionsByEventCodeQuery,
    useGetCuratedSessionsBySponsorQuery,
    useGetCuratedSessionsByTrackQuery,
    useAddCuratedSessionMutation,
    useUpdateCuratedSessionMutation,
    useDeleteCuratedSessionMutation
} = curatedSessionApi;