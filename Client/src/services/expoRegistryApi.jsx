import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL

export const expoRegistryApi = createApi({
    reducerPath: "expoRegistryApi",
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: ['ExpoRegistry'],
    endpoints: (builder) => ({
        getExpoRegistry: builder.query({
            query: (params = {}) => {
                const event_code = params.event_code ?? sessionStorage.getItem("Event_Code");
                return `/expo-registry?event_code=${event_code}`;
            },
            providesTags: ['ExpoRegistry']
        }),
        getExpoRegistryById: builder.query({
            query: (id) => `/expo-registry/${id}`,
            providesTags: ['ExpoRegistry']
        }),
        getMaxExpoRegistryId: builder.query({
            query: () => '/expo-registry/getlastExpoRegistryId',
            providesTags: ['ExpoRegistry']
        }),
        getExpoRegistryByEventCode: builder.query({
            query: (eventCode) => `/expo-registry/event/${eventCode}`,
            providesTags: ['ExpoRegistry']
        }),
        getExpoRegistryBySponsor: builder.query({
            query: (sponsorId) => `/expo-registry/sponsor/${sponsorId}`,
            providesTags: ['ExpoRegistry']
        }),
        addExpoRegistry: builder.mutation({
            query: (expoRegistry) => ({
                url: '/expo-registry',
                method: "POST",
                body: expoRegistry
            }),
            invalidatesTags: ['ExpoRegistry']
        }),
        updateExpoRegistry: builder.mutation({
            query: ({ id, ...expoRegistry }) => ({
                url: `/expo-registry/${id}`,
                method: "PUT",
                body: expoRegistry
            }),
            invalidatesTags: ['ExpoRegistry']
        }),
        deleteExpoRegistry: builder.mutation({
            query: (id) => ({
                url: `/expo-registry/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['ExpoRegistry']
        })
    })
})

export const {
    useGetExpoRegistryQuery,
    useGetExpoRegistryByIdQuery,
    useGetMaxExpoRegistryIdQuery,
    useGetExpoRegistryByEventCodeQuery,
    useGetExpoRegistryBySponsorQuery,
    useAddExpoRegistryMutation,
    useUpdateExpoRegistryMutation,
    useDeleteExpoRegistryMutation
} = expoRegistryApi;