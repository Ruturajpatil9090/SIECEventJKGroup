import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const awardRegistryApi = createApi({
    reducerPath: "awardRegistryApi",
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8000" }),
    tagTypes: ['AwardRegistry'],
    endpoints: (builder) => ({
        getAwardRegistry: builder.query({
            query: () => '/award-registry',
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