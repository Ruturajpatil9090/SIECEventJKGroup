import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL

export const networkingSlotApi = createApi({
    reducerPath: "networkingSlotApi",
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: ['NetworkingSlot'],
    endpoints: (builder) => ({

        getNetworkingSlots: builder.query({
            query: (params = {}) => {
                const event_code = params.event_code ?? sessionStorage.getItem("Event_Code");
                return `/networking-slots?event_code=${event_code}`;
            },
            providesTags: ['NetworkingSlot']
        }),
        getNetworkingSlotById: builder.query({
            query: (id) => `/networking-slots/${id}`,
            providesTags: ['NetworkingSlot']
        }),
        getNetworkingSlotDetailsById: builder.query({
            query: (id) => `/networking-slots/details/${id}`,
            providesTags: ['NetworkingSlot']
        }),
        getMaxNetworkingSlotId: builder.query({
            query: () => '/networking-slots/getlastNetworkingSlotId',
            providesTags: ['NetworkingSlot']
        }),
        getNetworkingSlotsByEventCode: builder.query({
            query: (eventCode) => `/networking-slots/?event_code=${eventCode}`,
            providesTags: ['NetworkingSlot']
        }),
        getNetworkingSlotsBySponsor: builder.query({
            query: (sponsorId) => `/networking-slots/?sponsor_id=${sponsorId}`,
            providesTags: ['NetworkingSlot']
        }),
        getNetworkingSlotsByTrack: builder.query({
            query: (track) => `/networking-slots/?track=${track}`,
            providesTags: ['NetworkingSlot']
        }),
        getNetworkingSlotsByApprovalStatus: builder.query({
            query: (approvalStatus) => `/networking-slots/?approval_status=${approvalStatus}`,
            providesTags: ['NetworkingSlot']
        }),
        addNetworkingSlot: builder.mutation({
            query: (networkingSlot) => ({
                url: '/networking-slots',
                method: "POST",
                body: networkingSlot
            }),
            invalidatesTags: ['NetworkingSlot']
        }),
        updateNetworkingSlot: builder.mutation({
            query: ({ id, ...networkingSlot }) => ({
                url: `/networking-slots/${id}`,
                method: "PUT",
                body: networkingSlot
            }),
            invalidatesTags: ['NetworkingSlot']
        }),
        deleteNetworkingSlot: builder.mutation({
            query: (id) => ({
                url: `/networking-slots/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['NetworkingSlot']
        })
    })
})

export const {
    useGetNetworkingSlotsQuery,
    useGetNetworkingSlotByIdQuery,
    useGetNetworkingSlotDetailsByIdQuery,
    useGetMaxNetworkingSlotIdQuery,
    useGetNetworkingSlotsByEventCodeQuery,
    useGetNetworkingSlotsBySponsorQuery,
    useGetNetworkingSlotsByTrackQuery,
    useGetNetworkingSlotsByApprovalStatusQuery,
    useAddNetworkingSlotMutation,
    useUpdateNetworkingSlotMutation,
    useDeleteNetworkingSlotMutation
} = networkingSlotApi;