import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userMasterApi = createApi({
    reducerPath: "userMasterApi",
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8000" }),
    tagTypes: ['UserMaster'],
    endpoints: (builder) => ({
        getUserMasters: builder.query({
            query: () => '/users-master',
            providesTags: ['UserMaster']
        }),
    })
})

export const {
    useGetUserMastersQuery,
} = userMasterApi;