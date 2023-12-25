
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL, GREY_FABRIC_PO_DELIVERY } from "../../constants/apiUrl";


const greyFabricPoDelivery = createApi({
    reducerPath: 'GreyFabricPoDeliveryApi',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ['GreyFabricPoDelivery'],
    endpoints: (builder) => ({
        getGreyFabricPoDeliveryDocId: builder.query({
            query: () => GREY_FABRIC_PO_DELIVERY + "/getDocId"
        }),
        getGreyFabricPoDelivery: builder.query({
            query: ({ params }) => ({
                url: GREY_FABRIC_PO_DELIVERY,
                method: 'GET',
                params,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            providesTags: ['GreyFabricPoDelivery'],
        }),
        getGreyFabricPoDeliveryId: builder.query({
            query: (params) => ({
                url: GREY_FABRIC_PO_DELIVERY + "/getDelDetails",
                method: 'GET',
                params,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            providesTags: ['GreyFabricPoDelivery'],
        }),
        addGreyFabricPoDelivery: builder.mutation({
            query: (payload) => ({
                url: GREY_FABRIC_PO_DELIVERY,
                method: 'POST',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["GreyFabricPoDelivery"],
        }),
        updateGreyFabricPoDelivery: builder.mutation({
            query: (payload) => ({
                url: GREY_FABRIC_PO_DELIVERY,
                method: 'PUT',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["GreyFabricPoDelivery"],
        }),
    }),
})

export const {
    useGetGreyFabricPoDeliveryQuery,
    useGetGreyFabricPoDeliveryIdQuery,
    useAddGreyFabricPoDeliveryMutation,
    useUpdateGreyFabricPoDeliveryMutation,
    useGetGreyFabricPoDeliveryDocIdQuery
} = greyFabricPoDelivery;

export default greyFabricPoDelivery;