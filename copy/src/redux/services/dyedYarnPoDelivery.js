
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL, DYED_YARN_PO_DELIVERY } from "../../constants/apiUrl";


const dyedYarnPoDelivery = createApi({
    reducerPath: 'dyedYarnPoDeliveryApi',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ['dyedYarnPoDelivery'],
    endpoints: (builder) => ({
        getDyedYarnPoDeliveryDocId: builder.query({
            query: () => DYED_YARN_PO_DELIVERY + "/getDocId"
        }),
        getDyedYarnPoDelivery: builder.query({
            query: ({ params }) => ({
                url: DYED_YARN_PO_DELIVERY,
                method: 'GET',
                params,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            providesTags: ['dyedYarnPoDelivery'],
        }),
        getDyedYarnPoDeliveryId: builder.query({
            query: (params) => ({
                url: DYED_YARN_PO_DELIVERY + "/getDelDetails",
                method: 'GET',
                params,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            providesTags: ['dyedYarnPoDelivery'],
        }),
        addDyedYarnPoDelivery: builder.mutation({
            query: (payload) => ({
                url: DYED_YARN_PO_DELIVERY,
                method: 'POST',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["dyedYarnPoDelivery"],
        }),
        updateDyedYarnPoDelivery: builder.mutation({
            query: (payload) => ({
                url: DYED_YARN_PO_DELIVERY,
                method: 'PUT',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["dyedYarnPoDelivery"],
        }),
    }),
})

export const {
    useGetDyedYarnPoDeliveryQuery,
    useGetDyedYarnPoDeliveryIdQuery,
    useAddDyedYarnPoDeliveryMutation,
    useUpdateDyedYarnPoDeliveryMutation,
    useGetDyedYarnPoDeliveryDocIdQuery
} = dyedYarnPoDelivery;

export default dyedYarnPoDelivery;