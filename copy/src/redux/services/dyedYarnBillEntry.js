
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL, DYED_YARN_PO_BILL_ENTRY } from "../../constants/apiUrl";


const dyedYarnBillEntry = createApi({
    reducerPath: 'DyedYarnPoBillEntryApi',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ['DyedYarnPoBillEntry'],  
    endpoints: (builder) => ({

        getDyedYarnPoBillEntry: builder.query({
            query: ({ params }) => ({
                url: DYED_YARN_PO_BILL_ENTRY,
                method: 'GET',
                params,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            providesTags: ['DyedYarnPoBillEntry'],
        }),
        getDyedYarnPoBillEntryId: builder.query({
            query: (params) => ({
                url: DYED_YARN_PO_BILL_ENTRY + "/getInvoiceDetails",
                method: 'GET',
                params,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            providesTags: ['DyedYarnPoBillEntry'],
        }),
        addDyedYarnPoBillEntry: builder.mutation({
            query: (payload) => ({
                url: DYED_YARN_PO_BILL_ENTRY,
                method: 'POST',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["DyedYarnPoBillEntry"],
        }),

        updateDyedYarnPoBillEntry: builder.mutation({
            query: (payload) => ({
                url: DYED_YARN_PO_BILL_ENTRY,
                method: 'PUT',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["DyedYarnPoBillEntry"],
        }),
        getDyedYarnPoBillEntryDocId: builder.query({
            query: () => DYED_YARN_PO_BILL_ENTRY + "/getDocId"
        }),
    }),
})

export const {
    useGetDyedYarnPoBillEntryQuery,
    useGetDyedYarnPoBillEntryIdQuery,
    useAddDyedYarnPoBillEntryMutation,
    useUpdateDyedYarnPoBillEntryMutation,
    useGetDyedYarnPoBillEntryDocIdQuery

} = dyedYarnBillEntry;

export default dyedYarnBillEntry;