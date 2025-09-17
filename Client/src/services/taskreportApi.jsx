import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL

export const TaskReportApi = createApi({
    reducerPath: "TaskReportApi",
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: ['taskDescription'],
    endpoints: (builder) => ({

        updateTaskMaster: builder.mutation({
            query: ({ Id, ...master }) => ({
                url: `/taskDescription/tasksUpdateById/${Id}`,
                method: "PUT",
                body: master
            }),
            invalidatesTags: ['taskDescription']
        }),
        getTaskMaster: builder.query({
            query: () => '/taskDescription/get_taskall_ofTaskmasterDashboard',
            providesTags: ['taskDescription']
        }),
        getToAuthorise: builder.query({
            query: () => '/taskDescription/get_taskall_ofAuthoriser',
            providesTags: ['taskDescription']
        }),
        getTaskUserReport: builder.query({
            query: ({ fromDate, toDate }) => ({
                url: `/taskDescription/get_taskall_Report`,
                method: 'GET',
                params: {
                    from_date: fromDate,
                    to_date: toDate,

                },
                responseHandler: (response) => response.json(),
            }),
        }),

        getTaskUserPendingReport: builder.query({
            query: ({ fromDate, toDate }) => ({
                url: `/taskDescription/get_taskall_PendingReport`,
                method: 'GET',
                params: {
                    from_date: fromDate,
                    to_date: toDate,

                },
                responseHandler: (response) => response.json(),
            }),
        }),

        getTaskCategoryWiseReport: builder.query({
            query: ({ fromDate, toDate, category }) => ({
                url: `/taskDescription/get_taskall_CategoryWiseReport`,
                method: 'GET',
                params: {
                    from_date: fromDate,
                    to_date: toDate,
                    category: category,
                },
                responseHandler: (response) => response.json(),
            }),
        }),

        getTaskReportUserWisePending: builder.query({
            query: ({ fromDate, toDate, category, user_id }) => ({
                url: `/taskDescription/get_taskall_UsersCategoryWiseReport`,
                method: 'GET',
                params: {
                    from_date: fromDate,
                    to_date: toDate,
                    category: category,
                    user_id,
                },
                responseHandler: (response) => response.json(),
            }),
        }),

        getTaskUserWiseReport: builder.query({
            query: ({ fromDate, toDate, user_id }) => ({
                url: `/taskDescription/get_taskall_TaskReportUserWisePending`,
                method: 'GET',
                params: {
                    from_date: fromDate,
                    to_date: toDate,
                    user_id,
                },
                responseHandler: (response) => response.json(),
            }),
        }),

    })
})

export const {
    useUpdateTaskMasterMutation,
    useGetTaskMasterQuery,
    useGetToAuthoriseQuery,
    useLazyGetTaskUserReportQuery,
    useLazyGetTaskUserPendingReportQuery,
    useLazyGetTaskCategoryWiseReportQuery,
    useLazyGetTaskReportUserWisePendingQuery,
    useLazyGetTaskUserWiseReportQuery,

} = TaskReportApi;