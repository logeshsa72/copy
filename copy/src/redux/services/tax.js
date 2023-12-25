import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL, TAX_API } from "../../constants/apiUrl";


const TaxDetails = createApi({
    reducerPath: 'TaxDetails',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ['TaxDetails'],
    endpoints: (builder) => ({
        getTaxDetails: builder.query({
            query: () => TAX_API,
            providesTags: ['TaxDetails'],
        }),
        getTaxDetailsById: builder.query({
            query: (params) => {
                return {
                    url: `${TAX_API}/getDetail`,
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                    params
                }
            },
            providesTags: ['TaxDetails'],
        }),
        loginTaxDetails: builder.mutation({
            query: (payload) => ({
                url: TAX_API + "/login",
                method: 'POST',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["TaxDetails"],
        }),
        addTaxDetails: builder.mutation({
            query: (payload) => ({
                url: TAX_API,
                method: 'POST',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["TaxDetails"],
        }),
        updateTaxDetails: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload
                return {
                    url: `${TAX_API}/${id}`,
                    method: 'PUT',
                    body,
                }
            },
            invalidatesTags: ["TaxDetails"],
        }),
        deleteTaxDetails: builder.mutation({
            query: (id) => ({
                url: `${TAX_API}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ["TaxDetails"],
        }),
    }),
})

export const {
    useGetTaxDetailsQuery,
    useGetTaxDetailsByIdQuery,
    useLoginTaxDetailsMutation,
    useAddTaxDetailsMutation,
    useUpdateTaxDetailsMutation,
    useDeleteTaxDetailsMutation } = TaxDetails;

export default TaxDetails;