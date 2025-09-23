import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

export const teamMasterApi = createApi({
    reducerPath: "teamMasterApi",
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: ['TeamMaster'],
    endpoints: (builder) => ({

        getTeamMasters: builder.query({
            query: (params = {}) => {
                const { skip = 0, limit = 100 } = params;
                return `/team-master?skip=${skip}&limit=${limit}`;
            },
            providesTags: ['TeamMaster']
        }),

        getTeamMasterById: builder.query({
            query: (id) => `/team-master/${id}`,
            providesTags: ['TeamMaster']
        }),

        getMaxTeamMasterId: builder.query({
            query: () => '/team-master/max-id',
            providesTags: ['TeamMaster']
        }),

        addTeamMaster: builder.mutation({
            query: (teamMaster) => ({
                url: '/team-master',
                method: "POST",
                body: teamMaster
            }),
            invalidatesTags: ['TeamMaster']
        }),

        updateTeamMaster: builder.mutation({
            query: ({ id, ...teamMaster }) => ({
                url: `/team-master/${id}`,
                method: "PUT",
                body: teamMaster
            }),
            invalidatesTags: ['TeamMaster']
        }),

        deleteTeamMaster: builder.mutation({
            query: (id) => ({
                url: `/team-master/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['TeamMaster']
        }),

        addTeamMasterJson: builder.mutation({
            query: (teamMasterJson) => ({
                url: '/team-master/json',
                method: "POST",
                body: teamMasterJson,
                headers: {
                    'Content-Type': 'application/json',
                }
            }),
            invalidatesTags: ['TeamMaster']
        })
    })
});

export const {
    useGetTeamMastersQuery,
    useGetTeamMasterByIdQuery,
    useGetMaxTeamMasterIdQuery,
    useAddTeamMasterMutation,
    useUpdateTeamMasterMutation,
    useDeleteTeamMasterMutation,
    useAddTeamMasterJsonMutation
} = teamMasterApi;