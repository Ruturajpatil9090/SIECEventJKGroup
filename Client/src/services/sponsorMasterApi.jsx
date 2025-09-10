import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { decryptData } from "../common/Functions/DecryptData";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL

export const sponsorMasterApi = createApi({
    reducerPath: "sponsorMasterApi",
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: ['SponsorMaster'],
    endpoints: (builder) => ({
        getSponsors: builder.query({
            query: (params) => {
                const event_code = params.event_code ?? sessionStorage.getItem("Event_Code");
                const { skip = 0, limit = 100 } = params || {};
                return `/sponsors?event_code=${event_code}&skip=${skip}&limit=${limit}`;
            },
            providesTags: ['SponsorMaster']
        }),
        getSponsorById: builder.query({
            query: (id) => `/sponsors/${id}`,
            providesTags: (result, error, id) => [{ type: 'SponsorMaster', id }],
        }),
        getSponsorsWithDetails: builder.query({
            query: (params) => {
                const { skip = 0, limit = 100 } = params || {};
                return `/sponsors/getSponsorsById?skip=${skip}&limit=${limit}`;
            },
            providesTags: ['SponsorMaster']
        }),
        getSponsorCompleteDetails: builder.query({
            query: (params) => {
                const { sponsor_master_id } = params || {};
                const eventCode = sessionStorage.getItem("Event_Code");
                return `/sponsors/sponsor-details?sponsor_master_id=${sponsor_master_id}&event_code=${eventCode}`;
            },
            providesTags: (result, error, params) =>
                result ? [{ type: 'SponsorMaster', id: params?.sponsor_master_id }] : [],
        }),
        getMaxSponsorId: builder.query({
            query: () => '/sponsors/getlastSponsorId',
            providesTags: ['SponsorMaster']
        }),
        getDashboardStats: builder.query({
            query: (params) => {
                const event_code = params?.event_code ?? sessionStorage.getItem("Event_Code");
                return `/sponsors/dashboard-stats/?event_code=${event_code}`;
            },
            providesTags: ['SponsorMaster']
        }),

        getUserDashboardStats: builder.query({
            query: ({ event_code, user_id }) => {
                return `/sponsors/user-dashboard-stats/?event_code=${event_code}&user_id=${user_id}`;
            },
            providesTags: ['SponsorMaster']
        }),
        getDataByUserId: builder.query({
            query: (user_id) => {
                return `/sponsors/getDataByUserId/${user_id}`;
            },
            providesTags: ['SponsorMaster']
        }),
        addSponsor: builder.mutation({
            queryFn: async ({ sponsorData, logoFile }, _queryApi, _extraOptions, baseQuery) => {
                const formData = new FormData();
                formData.append("sponsor_data", JSON.stringify(sponsorData));
                if (logoFile) {
                    formData.append("logo", logoFile);
                }

                const result = await baseQuery({
                    url: '/sponsors',
                    method: "POST",
                    body: formData,
                });

                return result;
            },
            invalidatesTags: ['SponsorMaster']
        }),

        updateSponsor: builder.mutation({
            queryFn: async ({ id, sponsorData, logoFile }, _queryApi, _extraOptions, baseQuery) => {
                const formData = new FormData();
                formData.append("sponsor_data", JSON.stringify(sponsorData));
                if (logoFile) {
                    formData.append("logo", logoFile);
                }

                const result = await baseQuery({
                    url: `/sponsors/${id}`,
                    method: "PUT",
                    body: formData,
                });

                return result;
            },
            invalidatesTags: (result, error, id) => [{ type: 'SponsorMaster', id }],
        }),
        deleteSponsor: builder.mutation({
            query: (id) => ({
                url: `/sponsors/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [{ type: 'SponsorMaster', id }],
        })
    })
});

export const {
    useGetSponsorsQuery,
    useGetSponsorByIdQuery,
    useGetSponsorsWithDetailsQuery,
    useGetMaxSponsorIdQuery,
    useGetSponsorCompleteDetailsQuery,
    useGetDashboardStatsQuery,
    useGetUserDashboardStatsQuery,
    useAddSponsorMutation,
    useUpdateSponsorMutation,
    useDeleteSponsorMutation,
    useGetDataByUserIdQuery
} = sponsorMasterApi;