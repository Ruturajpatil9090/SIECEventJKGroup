import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

export const accountMasterApi = createApi({
    reducerPath: "accountMasterApi",
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: ['AccountMaster'],
    endpoints: (builder) => ({

        getAccountMasters: builder.query({
            query: () => `/account-masters`,
            providesTags: ['AccountMaster']
        }),

        getAccountMasterById: builder.query({
            query: (accoid) => `/account-masters/${accoid}`,
            providesTags: (result, error, accoid) => [{ type: 'AccountMaster', id: accoid }]
        }),

        getAccountMasterByAcCode: builder.query({
            query: (acCode) => `/account-masters/by-ac-code/${acCode}`,
            providesTags: (result, error, acCode) => [{ type: 'AccountMaster', acCode }]
        }),

        searchAccountMasters: builder.query({
            query: ({ name, skip = 0, limit = 100 }) =>
                `/account-masters/search?name=${encodeURIComponent(name)}`,
            providesTags: ['AccountMaster']
        }),

    })
});

export const {
    useGetAccountMastersQuery,
    useGetAccountMasterByIdQuery,
    useGetAccountMasterByAcCodeQuery,
    useSearchAccountMastersQuery
} = accountMasterApi;