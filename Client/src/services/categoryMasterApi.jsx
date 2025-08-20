import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const categoryMasterApi = createApi({
    reducerPath: "categoryMasterApi",
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8000" }), 
    tagTypes: ['CategoryMaster'],
    endpoints: (builder) => ({
        getCategoryMaster: builder.query({
            query: () => '/categories',
            providesTags: ['CategoryMaster']
        }),
        getCategoryMasterById: builder.query({
            query: (id) => `/categories/${id}`,
            providesTags: ['CategoryMaster']
        }),
        getMaxCategoryId: builder.query({
            query: () => '/categories/getlastCategoryMaster',
            providesTags: ['CategoryMaster']
        }),
        addCategoryMaster: builder.mutation({
            query: (category) => ({
                url: '/categories',
                method: "POST",
                body: category
            }),
            invalidatesTags: ['CategoryMaster']
        }),
        updateCategoryMaster: builder.mutation({
            query: ({ id, ...category }) => ({
                url: `/categories/${id}`,
                method: "PUT",
                body: category
            }),
            invalidatesTags: ['CategoryMaster']
        }),
        deleteCategoryMaster: builder.mutation({
            query: (id) => ({
                url: `/categories/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['CategoryMaster']
        })
    })
})

export const { 
    useGetCategoryMasterQuery, 
    useGetCategoryMasterByIdQuery,
    useGetMaxCategoryIdQuery,
    useAddCategoryMasterMutation, 
    useUpdateCategoryMasterMutation, 
    useDeleteCategoryMasterMutation 
} = categoryMasterApi;