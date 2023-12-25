
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL, GREY_YARN_PO_BILL_ENTRY } from "../../constants/apiUrl";


const greyYarnPoBillEntry = createApi({
    reducerPath: 'GreyYarnPoBillEntryApi',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ['GreyYarnPoBillEntry'],
    endpoints: (builder) => ({

        getGreyYarnPoBillEntry: builder.query({
            query: ({ params }) => ({
                url: GREY_YARN_PO_BILL_ENTRY,
                method: 'GET',
                params,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            providesTags: ['GreyYarnPoBillEntry'],
        }),
        getGreyYarnPoBillEntryId: builder.query({
            query: (params) => ({
                url: GREY_YARN_PO_BILL_ENTRY + "/getInvoiceDetails",
                method: 'GET',
                params,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            providesTags: ['GreyYarnPoBillEntry'],
        }),
        addGreyYarnPoBillEntry: builder.mutation({
            query: (payload) => ({
                url: GREY_YARN_PO_BILL_ENTRY,
                method: 'POST',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["GreyYarnPoBillEntry"],
        }),

        updateGreyYarnPoBillEntry: builder.mutation({
            query: (payload) => ({
                url: GREY_YARN_PO_BILL_ENTRY,
                method: 'PUT',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["GreyYarnPoBillEntry"],
        }),
        getGreyYarnPoBillEntryDocId: builder.query({
            query: () => GREY_YARN_PO_BILL_ENTRY + "/getDocId"
        }),
    }),
})

export const {
    useGetGreyYarnPoBillEntryQuery,
    useGetGreyYarnPoBillEntryIdQuery,
    useAddGreyYarnPoBillEntryMutation,
    useUpdateGreyYarnPoBillEntryMutation,
    useGetGreyYarnPoBillEntryDocIdQuery

} = greyYarnPoBillEntry;

export default greyYarnPoBillEntry;