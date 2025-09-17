import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL

export const awardSubCategoryApi = createApi({
    reducerPath: "awardSubCategoryApi",
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: ['AwardSubCategory'],
    endpoints: (builder) => ({
        getAwardSubCategories: builder.query({
            query: () => '/award-subcategories',
            providesTags: ['AwardSubCategory']
        }),
        getAwardSubCategoryById: builder.query({
            query: (id) => `/award-subcategories/${id}`,
            providesTags: ['AwardSubCategory']
        }),
        getAwardSubCategoriesWithDetails: builder.query({
            query: () => '/award-subcategories/with-details',
            providesTags: ['AwardSubCategory']
        }),
        getMaxAwardSubCategoryId: builder.query({
            query: () => '/award-subcategories/getlastAwardSubCategoryId',
            providesTags: ['AwardSubCategory']
        }),
        addAwardSubCategory: builder.mutation({
            query: (awardSubCategory) => ({
                url: '/award-subcategories',
                method: "POST",
                body: awardSubCategory
            }),
            invalidatesTags: ['AwardSubCategory']
        }),
        updateAwardSubCategory: builder.mutation({
            query: ({ id, ...awardSubCategory }) => ({
                url: `/award-subcategories/${id}`,
                method: "PUT",
                body: awardSubCategory
            }),
            invalidatesTags: ['AwardSubCategory']
        }),
        deleteAwardSubCategory: builder.mutation({
            query: (id) => ({
                url: `/award-subcategories/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['AwardSubCategory']
        })
    })
})

export const {
    useGetAwardSubCategoriesQuery,
    useGetAwardSubCategoryByIdQuery,
    useGetAwardSubCategoriesWithDetailsQuery,
    useGetMaxAwardSubCategoryIdQuery,
    useAddAwardSubCategoryMutation,
    useUpdateAwardSubCategoryMutation,
    useDeleteAwardSubCategoryMutation
} = awardSubCategoryApi;