import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const deliverableApi = createApi({
    reducerPath: "deliverableApi",
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8000" }), 
    tagTypes: ['Deliverable'],
    endpoints: (builder) => ({
        getDeliverables: builder.query({
            query: () => '/deliverables',
            providesTags: ['Deliverable']
        }),
        getDeliverableById: builder.query({
            query: (id) => `/deliverables/${id}`,
            providesTags: ['Deliverable']
        }),
        getLastDeliverableNumbers: builder.query({
            query: () => '/deliverables/getlastdeliverables',
            providesTags: ['Deliverable']
        }),
        addDeliverable: builder.mutation({
            query: (deliverable) => ({
                url: '/deliverables',
                method: "POST",
                body: deliverable
            }),
            invalidatesTags: ['Deliverable']
        }),
        updateDeliverable: builder.mutation({
            query: ({ id, ...deliverable }) => ({
                url: `/deliverables/${id}`,
                method: "PUT",
                body: deliverable
            }),
            invalidatesTags: ['Deliverable']
        }),
        deleteDeliverable: builder.mutation({
            query: (id) => ({
                url: `/deliverables/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['Deliverable']
        })
    })
})

export const { 
    useGetDeliverablesQuery, 
    useGetDeliverableByIdQuery,
    useGetLastDeliverableNumbersQuery,
    useAddDeliverableMutation, 
    useUpdateDeliverableMutation, 
    useDeleteDeliverableMutation 
} = deliverableApi;