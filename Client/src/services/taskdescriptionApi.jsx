import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL

export const TaskDescriptionApi = createApi({
    reducerPath: "TaskDescriptionApi",
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: ['taskupdated'],
    endpoints: (builder) => ({

        getTaskDescription: builder.query({
            query: (params = {}) => {
                const user_id = params.user_id ?? sessionStorage.getItem("user_id");
                return `/taskDescription/get_taskall?user_id=${user_id}`;
            },
            providesTags: ['taskupdated']
        }),

        getTaskDescriptionById: builder.query({
            query: (id) => `/taskDescription/${id}`,
            providesTags: ['taskupdated']
        }),
        getMaxTaskDescriptionId: builder.query({
            query: () => '/taskDescription/getlasttaskDescriptionId',
            providesTags: ['taskupdated']
        }),
        addTaskDescription: builder.mutation({
            query: (deliverable) => ({
                url: '/taskDescription',
                method: "POST",
                body: deliverable
            }),
            invalidatesTags: ['taskupdated']
        }),
        addTaskGenerateReminder: builder.mutation({
            query: (deliverable) => ({
                url: '/taskDescription/generate-reminders',
                method: "POST",
                body: deliverable
            }),
            invalidatesTags: ['taskupdated']
        }),
        updateTaskDescription: builder.mutation({
            query: ({ id, ...deliverable }) => ({
                url: `/taskDescription/${id}`,
                method: "PUT",
                body: deliverable
            }),
            invalidatesTags: ['taskupdated']
        }),
        deleteTaskDescription: builder.mutation({
            query: (id) => ({
                url: `/taskDescription/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['taskupdated']
        }),
        getSystemMaster: builder.query({
            query: () => '/taskDescription/systemmaster',
            providesTags: ['taskupdated']
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