// passesRegistryApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

export const passesRegistryApi = createApi({
    reducerPath: "passesRegistryApi",
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: ['PassesRegistry'],
    endpoints: (builder) => ({

        getPassesRegistries: builder.query({
            query: (params = {}) => {
                const event_code = params.event_code ?? sessionStorage.getItem("Event_Code");
                return `/passes-registry?event_code=${event_code}`;
            },
            providesTags: ['PassesRegistry']
        }),

        getPassesRegistryById: builder.query({
            query: (id) => `/passes-registry/${id}`,
            providesTags: ['PassesRegistry']
        }),

        getMaxPassesRegistryId: builder.query({
            query: () => '/passes-registry/max-id',
            providesTags: ['PassesRegistry']
        }),

        addPassesRegistry: builder.mutation({
            query: (passesRegistry) => ({
                url: '/passes-registry',
                method: "POST",
                body: passesRegistry
            }),
            invalidatesTags: ['PassesRegistry']
        }),

        updatePassesRegistry: builder.mutation({
            query: ({ id, ...passesRegistry }) => ({
                url: `/passes-registry/${id}`,
                method: "PUT",
                body: passesRegistry
            }),
            invalidatesTags: ['PassesRegistry']
        }),

        deletePassesRegistry: builder.mutation({
            query: (id) => ({
                url: `/passes-registry/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['PassesRegistry']
        }),

        addPassesRegistryJson: builder.mutation({
            query: (passesRegistryJson) => ({
                url: '/passes-registry/json',
                method: "POST",
                body: passesRegistryJson,
                headers: {
                    'Content-Type': 'application/json',
                }
            }),
            invalidatesTags: ['PassesRegistry']
        })
    })
});

export const {
    useGetPassesRegistriesQuery,
    useGetPassesRegistryByIdQuery,
    useGetMaxPassesRegistryIdQuery,
    useAddPassesRegistryMutation,
    useUpdatePassesRegistryMutation,
    useDeletePassesRegistryMutation,
    useAddPassesRegistryJsonMutation
} = passesRegistryApi;