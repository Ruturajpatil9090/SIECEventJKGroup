import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

export const speakerTrackerApi = createApi({
    reducerPath: "speakerTrackerApi",
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: ['SpeakerTracker'],
    endpoints: (builder) => ({
        getSpeakerTrackers: builder.query({
            query: (params = {}) => {
                const event_code = params.event_code ?? sessionStorage.getItem("Event_Code");
                return `/speaker-trackers?event_code=${event_code}`;
            },
            providesTags: ['SpeakerTracker']
        }),
        getSpeakerTrackerById: builder.query({
            query: (id) => `/speaker-trackers/${id}`,
            providesTags: ['SpeakerTracker']
        }),
        getSpeakerTrackerDetailById: builder.query({
            query: (id) => `/speaker-trackers/details/${id}`,
            providesTags: ['SpeakerTracker']
        }),
        getMaxSpeakerTrackerId: builder.query({
            query: () => '/speaker-trackers/getlastSpeakerTrackerId',
            providesTags: ['SpeakerTracker']
        }),
        getSpeakerTrackersByEventCode: builder.query({
            query: (eventCode) => `/speaker-trackers/?event_code=${eventCode}`,
            providesTags: ['SpeakerTracker']
        }),
        getSpeakerTrackersBySponsor: builder.query({
            query: (sponsorId) => `/speaker-trackers/?sponsor_id=${sponsorId}`,
            providesTags: ['SpeakerTracker']
        }),
        getSpeakerTrackersByTrack: builder.query({
            query: (track) => `/speaker-trackers/?track=${track}`,
            providesTags: ['SpeakerTracker']
        }),
        addSpeakerTracker: builder.mutation({
            query: (speakerTracker) => ({
                url: '/speaker-trackers',
                method: "POST",
                body: speakerTracker
            }),
            invalidatesTags: ['SpeakerTracker']
        }),
        updateSpeakerTracker: builder.mutation({
            query: ({ id, ...speakerTracker }) => ({
                url: `/speaker-trackers/${id}`,
                method: "PUT",
                body: speakerTracker
            }),
            invalidatesTags: ['SpeakerTracker']
        }),
        deleteSpeakerTracker: builder.mutation({
            query: (id) => ({
                url: `/speaker-trackers/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['SpeakerTracker']
        })
    })
});

export const {
    useGetSpeakerTrackersQuery,
    useGetSpeakerTrackerByIdQuery,
    useGetSpeakerTrackerDetailByIdQuery,
    useGetMaxSpeakerTrackerIdQuery,
    useGetSpeakerTrackersByEventCodeQuery,
    useGetSpeakerTrackersBySponsorQuery,
    useGetSpeakerTrackersByTrackQuery,
    useAddSpeakerTrackerMutation,
    useUpdateSpeakerTrackerMutation,
    useDeleteSpeakerTrackerMutation
} = speakerTrackerApi;