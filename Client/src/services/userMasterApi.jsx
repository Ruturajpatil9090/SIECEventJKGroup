// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// export const userMasterApi = createApi({
//     reducerPath: "userMasterApi",
//     baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8000" }),
//     tagTypes: ['UserMaster'],
//     endpoints: (builder) => ({
//         getUserMasters: builder.query({
//             query: () => '/users-master',
//             providesTags: ['UserMaster']
//         }),
//     })
// })

// export const {
//     useGetUserMastersQuery,
// } = userMasterApi;




import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL

export const userMasterApi = createApi({
    reducerPath: "userMasterApi",
    baseQuery: fetchBaseQuery({ 
        baseUrl: API_BASE_URL,
        credentials: 'include'
    }),
    tagTypes: ['UserMaster'],
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: 'http://localhost:8000/users-master/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['UserMaster']
        }),
        refreshToken: builder.mutation({
            query: (refreshToken) => ({
                url: '/users-master/refresh',
                method: 'POST',
                body: { refresh_token: refreshToken },
            }),
        }),
        getUserMasters: builder.query({
            query: () => '/users-master',
            providesTags: ['UserMaster']
        }),
        getCurrentUser: builder.query({
            query: () => ({
                url: '/users-master/me',
                method: 'GET',
            }),
            providesTags: ['UserMaster']
        }),
    })
})

export const {
    useGetUserMastersQuery,
    useLoginMutation,
    useRefreshTokenMutation,
    useGetCurrentUserQuery,
} = userMasterApi;