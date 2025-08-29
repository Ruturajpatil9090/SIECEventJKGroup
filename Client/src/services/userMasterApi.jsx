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




// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL

// export const userMasterApi = createApi({
//     reducerPath: "userMasterApi",
//     baseQuery: fetchBaseQuery({ 
//         baseUrl: API_BASE_URL,
//         credentials: 'include'
//     }),
//     tagTypes: ['UserMaster'],
//     endpoints: (builder) => ({
//         login: builder.mutation({
//             query: (credentials) => ({
//                 url: '/users-master/login',
//                 method: 'POST',
//                 body: credentials,
//             }),
//             invalidatesTags: ['UserMaster']
//         }),
//         refreshToken: builder.mutation({
//             query: (refreshToken) => ({
//                 url: '/users-master/refresh',
//                 method: 'POST',
//                 body: { refresh_token: refreshToken },
//             }),
//         }),
//         getUserMasters: builder.query({
//             query: () => '/users-master',
//             providesTags: ['UserMaster']
//         }),
//         getCurrentUser: builder.query({
//             query: () => ({
//                 url: '/users-master/me',
//                 method: 'GET',
//             }),
//             providesTags: ['UserMaster']
//         }),
//     })
// })

// export const {
//     useGetUserMastersQuery,
//     useLoginMutation,
//     useRefreshTokenMutation,
//     useGetCurrentUserQuery,
// } = userMasterApi;















import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

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
                url: '/users-master/login',
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

        // User data endpoints
        getUserMasters: builder.query({
            query: ({ skip = 0, limit = 100 } = {}) => `/users-master?skip=${skip}&limit=${limit}`,
            providesTags: ['UserMaster']
        }),
        getUserById: builder.query({
            query: (uid) => `/users-master/${uid}`,
            providesTags: (result, error, uid) => [{ type: 'UserMaster', id: uid }]
        }),
        getCurrentUser: builder.query({
            query: () => '/users-master/me',
            providesTags: ['UserMaster']
        }),

        // Update endpoints
        updateUserProfile: builder.mutation({
            query: ({ uid, ...profileData }) => ({
                url: `/users-master/profile/${uid}`,
                method: 'PUT',
                body: profileData,
            }),
            invalidatesTags: (result, error, { uid }) => [
                { type: 'UserMaster', id: uid },
                'UserMaster'
            ]
        }),
        updateUserPassword: builder.mutation({
            query: ({ uid, ...passwordData }) => ({
                url: `/users-master/password/${uid}`,
                method: 'PUT',
                body: passwordData,
            }),
        }),
    })
});

export const {
    useGetUserMastersQuery,
    useGetUserByIdQuery,
    useLoginMutation,
    useRefreshTokenMutation,
    useGetCurrentUserQuery,
    useUpdateUserProfileMutation,
    useUpdateUserPasswordMutation,
} = userMasterApi;