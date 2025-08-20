import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const sponsorMasterApi = createApi({
    reducerPath: "sponsorMasterApi",
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8000" }), 
    tagTypes: ['SponsorMaster'],
    endpoints: (builder) => ({
        getSponsors: builder.query({
            query: () => '/sponsors',
            providesTags: ['SponsorMaster']
        }),
        getSponsorById: builder.query({
            query: (id) => `/sponsors/${id}`,
            providesTags: ['SponsorMaster']
        }),
        getSponsorsWithDetails: builder.query({
            query: () => '/sponsors/getSponsorsById',
            providesTags: ['SponsorMaster']
        }),
        getMaxSponsorId: builder.query({
            query: () => '/sponsors/getlastSponsorId',
            providesTags: ['SponsorMaster']
        }),
        addSponsor: builder.mutation({
            query: (sponsor) => ({
                url: '/sponsors',
                method: "POST",
                body: sponsor
            }),
            invalidatesTags: ['SponsorMaster']
        }),
        updateSponsor: builder.mutation({
            query: ({ id, ...sponsor }) => ({
                url: `/sponsors/${id}`,
                method: "PUT",
                body: sponsor
            }),
            invalidatesTags: ['SponsorMaster']
        }),
        deleteSponsor: builder.mutation({
            query: (id) => ({
                url: `/sponsors/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['SponsorMaster']
        })
    })
})

export const { 
    useGetSponsorsQuery, 
    useGetSponsorByIdQuery,
    useGetSponsorsWithDetailsQuery,
    useGetMaxSponsorIdQuery,
    useAddSponsorMutation, 
    useUpdateSponsorMutation, 
    useDeleteSponsorMutation 
} = sponsorMasterApi;