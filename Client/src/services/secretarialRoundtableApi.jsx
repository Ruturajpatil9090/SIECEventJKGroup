import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL

export const secretarialRoundtableApi = createApi({
    reducerPath: "secretarialRoundtableApi",
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: ['SecretarialRoundtable'],
    endpoints: (builder) => ({

        getSecretarialRoundtables: builder.query({
            query: (params = {}) => {
                const event_code = params.event_code ?? sessionStorage.getItem("Event_Code");
                return `/secretarial-roundtables?event_code=${event_code}`;
            },
            providesTags: ['SecretarialRoundtable']
        }),
        getSecretarialRoundtableById: builder.query({
            query: (id) => `/secretarial-roundtables/${id}`,
            providesTags: ['SecretarialRoundtable']
        }),
        getSecretarialRoundtableDetailsById: builder.query({
            query: (id) => `/secretarial-roundtables/details/${id}`,
            providesTags: ['SecretarialRoundtable']
        }),
        getMaxSecretarialRoundtableId: builder.query({
            query: () => '/secretarial-roundtables/getlastSecretarialRoundTableId',
            providesTags: ['SecretarialRoundtable']
        }),
        getSecretarialRoundtablesByEventCode: builder.query({
            query: (eventCode) => `/secretarial-roundtables/?event_code=${eventCode}`,
            providesTags: ['SecretarialRoundtable']
        }),
        getSecretarialRoundtablesBySponsor: builder.query({
            query: (sponsorId) => `/secretarial-roundtables/?sponsor_id=${sponsorId}`,
            providesTags: ['SecretarialRoundtable']
        }),
        getSecretarialRoundtablesByTrack: builder.query({
            query: (track) => `/secretarial-roundtables/?track=${track}`,
            providesTags: ['SecretarialRoundtable']
        }),
        addSecretarialRoundtable: builder.mutation({
            query: (secretarialRoundtable) => ({
                url: '/secretarial-roundtables',
                method: "POST",
                body: secretarialRoundtable
            }),
            invalidatesTags: ['SecretarialRoundtable']
        }),
        updateSecretarialRoundtable: builder.mutation({
            query: ({ id, ...secretarialRoundtable }) => ({
                url: `/secretarial-roundtables/${id}`,
                method: "PUT",
                body: secretarialRoundtable
            }),
            invalidatesTags: ['SecretarialRoundtable']
        }),
        deleteSecretarialRoundtable: builder.mutation({
            query: (id) => ({
                url: `/secretarial-roundtables/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['SecretarialRoundtable']
        })
    })
})

export const {
    useGetSecretarialRoundtablesQuery,
    useGetSecretarialRoundtableByIdQuery,
    useGetSecretarialRoundtableDetailsByIdQuery,
    useGetMaxSecretarialRoundtableIdQuery,
    useGetSecretarialRoundtablesByEventCodeQuery,
    useGetSecretarialRoundtablesBySponsorQuery,
    useGetSecretarialRoundtablesByTrackQuery,
    useAddSecretarialRoundtableMutation,
    useUpdateSecretarialRoundtableMutation,
    useDeleteSecretarialRoundtableMutation
} = secretarialRoundtableApi;