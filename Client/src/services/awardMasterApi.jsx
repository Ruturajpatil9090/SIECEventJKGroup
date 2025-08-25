import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL

export const awardMasterApi = createApi({
    reducerPath: "awardMasterApi",
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL}),
    tagTypes: ['AwardMaster'],
    endpoints: (builder) => ({

        getAwardMasterAll: builder.query({
            query: () => '/award',
            providesTags: ['AwardMaster']
        }),


        getAwardMasterById: builder.query({
            query: (id) => `/award/${id}`,
            providesTags: ['AwardMaster']
        }),


        getMaxAwardMasterId: builder.query({
            query: () => '/award/max/id',
            providesTags: ['AwardMaster']
        }),


        addAwardMaster: builder.mutation({
            query: (award) => ({
                url: '/award/add',
                method: "POST",
                body: award
            }),
            invalidatesTags: ['AwardMaster']
        }),


        updateAwardMaster: builder.mutation({
            query: ({ id, ...award }) => ({
                url: `/award/${id}`,
                method: "PUT",
                body: award
            }),
            invalidatesTags: ['AwardMaster']
        }),


        deleteAwardMaster: builder.mutation({
            query: (id) => ({
                url: `/award/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['AwardMaster']
        })
    })
})


export const {
    useGetAwardMasterAllQuery,
    useGetAwardMasterByIdQuery,
    useGetMaxAwardMasterIdQuery,
    useAddAwardMasterMutation,
    useUpdateAwardMasterMutation,
    useDeleteAwardMasterMutation
} = awardMasterApi;
