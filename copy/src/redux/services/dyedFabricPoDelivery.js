
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL, DYED_FABRIC_PO_DELIVERY } from "../../constants/apiUrl";


const dyedFabricPoDelivery = createApi({
    reducerPath: 'DyedFabricPoDeliveryApi',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ['DyedFabricPoDelivery'],
    endpoints: (builder) => ({
        getDyedFabricPoDeliveryDocId: builder.query({
            query: () => DYED_FABRIC_PO_DELIVERY + "/getDocId"
        }),
        getDyedFabricPoDelivery: builder.query({
            query: ({ params }) => ({
                url: DYED_FABRIC_PO_DELIVERY,
                method: 'GET',
                params,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            providesTags: ['DyedFabricPoDelivery'],
        }),
        getDyedFabricPoDeliveryId: builder.query({
            query: (params) => ({
                url: DYED_FABRIC_PO_DELIVERY + "/getDelDetails",
                method: 'GET',
                params,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            providesTags: ['DyedFabricPoDelivery'],
        }),
        addDyedFabricPoDelivery: builder.mutation({
            query: (payload) => ({
                url: DYED_FABRIC_PO_DELIVERY,
                method: 'POST',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["DyedFabricPoDelivery"],
        }),
        updateDyedFabricPoDelivery: builder.mutation({
            query: (payload) => ({
                url: DYED_FABRIC_PO_DELIVERY,
                method: 'PUT',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["DyedFabricPoDelivery"],
        }),
    }),
})

export const {
    useGetDyedFabricPoDeliveryQuery,
    useGetDyedFabricPoDeliveryIdQuery,
    useAddDyedFabricPoDeliveryMutation,
    useUpdateDyedFabricPoDeliveryMutation,
    useGetDyedFabricPoDeliveryDocIdQuery
} = dyedFabricPoDelivery;

export default dyedFabricPoDelivery;