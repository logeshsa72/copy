
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL, GREY_YARN_PO_DELIVERY } from "../../constants/apiUrl";


const greyYarnPoDelivery = createApi({
    reducerPath: 'GreyYarnPoDeliveryApi',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ['GreyYarnPoDelivery'],
    endpoints: (builder) => ({
        getGreyYarnPoDeliveryDocId: builder.query({
            query: () => GREY_YARN_PO_DELIVERY + "/getDocId"
        }),
        getGreyYarnPoDelivery: builder.query({
            query: ({ params }) => ({
                url: GREY_YARN_PO_DELIVERY,
                method: 'GET',
                params,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            providesTags: ['GreyYarnPoDelivery'],
        }),
        getGreyYarnPoDeliveryId: builder.query({
            query: (params) => ({
                url: GREY_YARN_PO_DELIVERY + "/getDelDetails",
                method: 'GET',
                params,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            providesTags: ['GreyYarnPoDelivery'],
        }),
        addGreyYarnPoDelivery: builder.mutation({
            query: (payload) => ({
                url: GREY_YARN_PO_DELIVERY,
                method: 'POST',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["GreyYarnPoDelivery"],
        }),
        updateGreyYarnPoDelivery: builder.mutation({
            query: (payload) => ({
                url: GREY_YARN_PO_DELIVERY,
                method: 'PUT',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["GreyYarnPoDelivery"],
        }),
    }),
})

export const {
    useGetGreyYarnPoDeliveryQuery,
    useGetGreyYarnPoDeliveryIdQuery,
    useAddGreyYarnPoDeliveryMutation,
    useUpdateGreyYarnPoDeliveryMutation,
    useGetGreyYarnPoDeliveryDocIdQuery
} = greyYarnPoDelivery;

export default greyYarnPoDelivery;