import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL

export const categorySubMasterApi = createApi({
    reducerPath: "CategorySubMasterApi",
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }), 
    tagTypes: ['CategorySubMaster'],
    endpoints: (builder) => ({
        getCategorySubMaster: builder.query({
            query: () => '/category-subs',
            providesTags: ['CategorySubMaster']
        }),
        getCategorySubMasterById: builder.query({
            query: (id) => `/category-subs/${id}`,
            providesTags: ['CategorySubMaster']
        }),
        getMaxSubCategoryId: builder.query({
            query: () => '/category-subs/getlastCategorySubMaster',
            providesTags: ['CategorySubMaster']
        }),
        addCategorySubMaster: builder.mutation({
            query: (category) => ({
                url: '/category-subs',
                method: "POST",
                body: category
            }),
            invalidatesTags: ['CategorySubMaster']
        }),
        updateCategorySubMaster: builder.mutation({
            query: ({ id, ...category }) => ({
                url: `/category-subs/${id}`,
                method: "PUT",
                body: category
            }),
            invalidatesTags: ['CategorySubMaster']
        }),
        deleteCategorySubMaster: builder.mutation({
            query: (id) => ({
                url: `/category-subs/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['CategorySubMaster']
        })
    })
})

export const { 
    useGetCategorySubMasterQuery, 
    useGetCategorySubMasterByIdQuery,
    useGetMaxSubCategoryIdQuery,
    useAddCategorySubMasterMutation, 
    useUpdateCategorySubMasterMutation, 
    useDeleteCategorySubMasterMutation 
} = categorySubMasterApi;