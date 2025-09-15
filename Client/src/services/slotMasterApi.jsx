import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL

export const slotMasterApi = createApi({
    reducerPath: "slotMasterApi",
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: ['SlotMaster'],
    endpoints: (builder) => ({
        // getSlotMasters: builder.query({
        //     query: () => '/slot-masters',
        //     providesTags: ['SlotMaster']
        // }),

          getSlotMasters: builder.query({
            query: (params = {}) => {
                const event_code = params.event_code ?? sessionStorage.getItem("Event_Code");
                return {
                    url: '/slot-masters',
                    params: event_code ? { event_code } : {}
                };
            },
            providesTags: ['SlotMaster']
        }),

        getSlotMastersBySponsorId: builder.query({
            query: (sponsorId) => `/slot-masters/by-sponsor/${sponsorId}`,
            providesTags: ['SlotMaster']
        }),
        getSlotMasterById: builder.query({
            query: (id) => `/slot-masters/${id}`,
            providesTags: ['SlotMaster']
        }),
        getMaxSlotMasterId: builder.query({
            query: () => '/slot-masters/getlastSlotMasterId',
            providesTags: ['SlotMaster']
        }),
        addSlotMaster: builder.mutation({
            query: (slotMaster) => ({
                url: '/slot-masters',
                method: "POST",
                body: slotMaster
            }),
            invalidatesTags: ['SlotMaster']
        }),
        updateSlotMaster: builder.mutation({
            query: ({ id, ...slotMaster }) => ({
                url: `/slot-masters/${id}`,
                method: "PUT",
                body: slotMaster
            }),
            invalidatesTags: ['SlotMaster']
        }),
        deleteSlotMaster: builder.mutation({
            query: (id) => ({
                url: `/slot-masters/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['SlotMaster']
        })
    })
})

export const {
    useGetSlotMastersQuery,
    useGetSlotMastersBySponsorIdQuery,
    useGetSlotMasterByIdQuery,
    useGetMaxSlotMasterIdQuery,
    useAddSlotMasterMutation,
    useUpdateSlotMasterMutation,
    useDeleteSlotMasterMutation
} = slotMasterApi;