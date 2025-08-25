import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const sponsorMasterApi = createApi({
    reducerPath: "sponsorMasterApi",
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8000" }),
    tagTypes: ['SponsorMaster'],
    endpoints: (builder) => ({
        getSponsors: builder.query({
            query: (params) => {
                const { skip = 0, limit = 100 } = params || {};
                return `/sponsors?skip=${skip}&limit=${limit}`;
            },
            providesTags: (result) =>
                result
                    ? [...result.map(({ SponsorMasterId }) => ({ type: 'SponsorMaster', id: SponsorMasterId })), { type: 'SponsorMaster', id: 'LIST' }]
                    : [{ type: 'SponsorMaster', id: 'LIST' }],
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
        getMaxSponsorId: builder.query({
            query: () => '/sponsors/getlastSponsorId',
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
            queryFn: async ({ id, sponsorData, logoFile}, _queryApi, _extraOptions, baseQuery) => {
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
            // invalidatesTags: (result, error, { id }) => [{ type: 'SponsorMaster', id }],
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
    useAddSponsorMutation,
    useUpdateSponsorMutation,
    useDeleteSponsorMutation
} = sponsorMasterApi;





// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// export const sponsorMasterApi = createApi({
//     reducerPath: "sponsorMasterApi",
//     baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8000" }), 
//     tagTypes: ['SponsorMaster'],
//     endpoints: (builder) => ({
//         getSponsors: builder.query({
//             query: () => '/sponsors',
//             providesTags: ['SponsorMaster']
//         }),
//         getSponsorById: builder.query({
//             query: (id) => `/sponsors/${id}`,
//             providesTags: ['SponsorMaster']
//         }),
//         getSponsorsWithDetails: builder.query({
//             query: () => '/sponsors/getSponsorsById',
//             providesTags: ['SponsorMaster']
//         }),
//         getMaxSponsorId: builder.query({
//             query: () => '/sponsors/getlastSponsorId',
//             providesTags: ['SponsorMaster']
//         }),
//         addSponsor: builder.mutation({
//             query: (sponsor) => ({
//                 url: '/sponsors',
//                 method: "POST",
//                 body: sponsor
//             }),
//             invalidatesTags: ['SponsorMaster']
//         }),
//         updateSponsor: builder.mutation({
//             query: ({ id, ...sponsor }) => ({
//                 url: `/sponsors/${id}`,
//                 method: "PUT",
//                 body: sponsor
//             }),
//             invalidatesTags: ['SponsorMaster']
//         }),
//         deleteSponsor: builder.mutation({
//             query: (id) => ({
//                 url: `/sponsors/${id}`,
//                 method: "DELETE",
//             }),
//             invalidatesTags: ['SponsorMaster']
//         })
//     })
// })

// export const { 
//     useGetSponsorsQuery, 
//     useGetSponsorByIdQuery,
//     useGetSponsorsWithDetailsQuery,
//     useGetMaxSponsorIdQuery,
//     useAddSponsorMutation, 
//     useUpdateSponsorMutation, 
//     useDeleteSponsorMutation 
// } = sponsorMasterApi;




