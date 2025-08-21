import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const categoryWiseDeliverablesApi = createApi({
    reducerPath: "categoryWiseDeliverablesApi",
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8000" }),
    tagTypes: ['CategoryWiseDeliverables'],
    endpoints: (builder) => ({
        getCategoryWiseDeliverables: builder.query({
            query: () => '/categorywisedeliverables',
            providesTags: ['CategoryWiseDeliverables']
        }),
        getCategoryWiseDeliverableById: builder.query({
            query: (id) => `/categorywisedeliverables/${id}`,
            providesTags: ['CategoryWiseDeliverables']
        }),
        getMaxCatDeliverableId: builder.query({
            query: () => '/categorywisedeliverables/getlastDeliverableId',
            providesTags: ['CategoryWiseDeliverables']
        }),
        getFilteredCategoryWiseDeliverables: builder.query({
            query: ({ event_code, category_master_code, category_sub_master_code }) => ({
                url: '/categorywisedeliverables/filtered',
                params: { event_code, category_master_code, category_sub_master_code }
            }),
            providesTags: ['CategoryWiseDeliverables']
        }),
        addCategoryWiseDeliverable: builder.mutation({
            query: (deliverable) => ({
                url: '/categorywisedeliverables',
                method: "POST",
                body: deliverable
            }),
            invalidatesTags: ['CategoryWiseDeliverables']
        }),
        updateCategoryWiseDeliverable: builder.mutation({
            query: ({ id, ...deliverable }) => ({
                url: `/categorywisedeliverables/${id}`,
                method: "PUT",
                body: deliverable
            }),
            invalidatesTags: ['CategoryWiseDeliverables']
        }),
        deleteCategoryWiseDeliverable: builder.mutation({
            query: (id) => ({
                url: `/categorywisedeliverables/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['CategoryWiseDeliverables']
        })
    })
})

export const {
    useGetCategoryWiseDeliverablesQuery,
    useGetCategoryWiseDeliverableByIdQuery,
    useGetMaxCatDeliverableIdQuery,
    useLazyGetFilteredCategoryWiseDeliverablesQuery,
    useAddCategoryWiseDeliverableMutation,
    useUpdateCategoryWiseDeliverableMutation,
    useDeleteCategoryWiseDeliverableMutation
} = categoryWiseDeliverablesApi;