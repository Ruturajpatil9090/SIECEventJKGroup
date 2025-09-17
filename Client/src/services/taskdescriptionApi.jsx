import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL

export const TaskDescriptionApi = createApi({
    reducerPath: "TaskDescriptionApi",
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: ['taskDescription'],
    endpoints: (builder) => ({
         getTaskDescription: builder.query({
            query: () => '/taskDescription/get_taskall',
            providesTags: ['taskDescription']
        }),
        getTaskDescriptionById: builder.query({
            query: (id) => `/taskDescription/${id}`,
            providesTags: ['taskDescription']
        }),
        getMaxTaskDescriptionId: builder.query({
            query: () => '/taskDescription/getlasttaskDescriptionId',
            providesTags: ['taskDescription']
        }),
        addTaskDescription: builder.mutation({
            query: (deliverable) => ({
                url: '/taskDescription',
                method: "POST",
                body: deliverable
            }),
            invalidatesTags: ['taskDescription']
        }),
        addTaskGenerateReminder: builder.mutation({
            query: (deliverable) => ({
                url: '/taskDescription/generate-reminders',
                method: "POST",
                body: deliverable
            }),
            invalidatesTags: ['taskDescription']
        }),
        updateTaskDescription: builder.mutation({
            query: ({ id, ...deliverable }) => ({
                url: `/taskDescription/${id}`,
                method: "PUT",
                body: deliverable
            }),
            invalidatesTags: ['taskDescription']
        }),
        deleteTaskDescription: builder.mutation({
            query: (id) => ({
                url: `/taskDescription/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['taskDescription']
        }),
        getSystemMaster: builder.query({
            query: () => '/taskDescription/systemmaster',
            providesTags: ['taskDescription']
        })
    })
})

export const { 
    useGetTaskDescriptionQuery, 
    useGetTaskDescriptionByIdQuery,
    useGetMaxTaskDescriptionIdQuery,
    useGetSystemMasterQuery,
    useAddTaskDescriptionMutation, 
    useAddTaskGenerateReminderMutation,
    useUpdateTaskDescriptionMutation, 
    useDeleteTaskDescriptionMutation,
} = TaskDescriptionApi;