import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL

export const awardRegistryApi = createApi({
    reducerPath: "awardRegistryApi",
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: ['AwardRegistry'],
    endpoints: (builder) => ({
        getAwardRegistry: builder.query({
            query: (params = {}) => {
                const event_code = params.event_code ?? sessionStorage.getItem("Event_Code");
                return `/award-registry?event_code=${event_code}`;
            },
            providesTags: ['AwardRegistry']
        }),
        getAwardRegistryById: builder.query({
            query: (id) => `/award-registry/${id}`,
            providesTags: ['AwardRegistry']
        }),
        getMaxAwardRegistryId: builder.query({
            query: () => '/award-registry/getlastAwardRegistryId',
            providesTags: ['AwardRegistry']
        }),
        getAwardRegistryByEventCode: builder.query({
            query: (eventCode) => `/award-registry/?event_code=${eventCode}`,
            providesTags: ['AwardRegistry']
        }),
        getAwardRegistryBySponsor: builder.query({
            query: (sponsorId) => `/award-registry/?sponsor_id=${sponsorId}`,
            providesTags: ['AwardRegistry']
        }),
        getAwardRegistryByDeliverable: builder.query({
            query: (deliverableCode) => `/award-registry/?deliverable_code=${deliverableCode}`,
            providesTags: ['AwardRegistry']
        }),
        addAwardRegistry: builder.mutation({
            query: (awardRegistry) => ({
                url: '/award-registry',
                method: "POST",
                body: awardRegistry
            }),
            invalidatesTags: ['AwardRegistry']
        }),
        updateAwardRegistry: builder.mutation({
            query: ({ id, ...awardRegistry }) => ({
                url: `/award-registry/${id}`,
                method: "PUT",
                body: awardRegistry
            }),
            invalidatesTags: ['AwardRegistry']
        }),
        deleteAwardRegistry: builder.mutation({
            query: (id) => ({
                url: `/award-registry/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['AwardRegistry']
        })
    })
})

export const {
    useGetAwardRegistryQuery,
    useGetAwardRegistryByIdQuery,
    useGetMaxAwardRegistryIdQuery,
    useGetAwardRegistryByEventCodeQuery,
    useGetAwardRegistryBySponsorQuery,
    useGetAwardRegistryByDeliverableQuery,
    useAddAwardRegistryMutation,
    useUpdateAwardRegistryMutation,
    useDeleteAwardRegistryMutation
} = awardRegistryApi;