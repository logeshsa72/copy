import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL, ACCESSORY_API } from "../../constants/apiUrl";


const accessoryPo = createApi({
    reducerPath: 'AccessoryPo',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ['AccessoryPo'],
    endpoints: (builder) => ({
        getAccessoryPo: builder.query({
            query: ({ params }) => {
                return {
                    url: ACCESSORY_API,
                    method: 'GET',
                    params,
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['AccessoryPo'],
        }),
        getAccessoryPoDetailsById: builder.query({
            query: (params) => {
                return {
                    url: `${ACCESSORY_API}/poDetails`,
                    method: 'GET',
                    params,
                }
            },
            providesTags: ['AccessoryPo'],
        }),
        getAccessoryPoItems: builder.query({
            query: (params) => {
                return {
                    url: `${ACCESSORY_API}/getPoItem`,
                    method: 'GET',
                    params,
                }
            },
            providesTags: ['AccessoryPo'],
        }),
        loginAccessoryPo: builder.mutation({
            query: (payload) => ({
                url: ACCESSORY_API + "/login",
                method: 'POST',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["AccessoryPo"],
        }),
        addAccessoryPo: builder.mutation({
            query: (payload) => ({
                url: ACCESSORY_API,
                method: 'POST',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["AccessoryPo"],
        }),
        updateStatus: builder.mutation({
            query: (params) => {
                return {
                    url: `${ACCESSORY_API}/acceptPo`,
                    method: 'PUT',
                    params,
                }
            },
            invalidatesTags: ["AccessoryPo"],
        }),
        deleteAccessoryPo: builder.mutation({
            query: (id) => ({
                url: `${ACCESSORY_API}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ["AccessoryPo"],
        }),
    }),
})

export const {
    useGetAccessoryPoQuery,
    useGetAccessoryPoDetailsByIdQuery,
    useGetAccessoryPoItemsQuery,
    useLoginAccessoryPoMutation,
    useAddAccessoryPoMutation,
    useUpdateStatusMutation,
    useDeleteAccessoryPoMutation } = accessoryPo;

export default accessoryPo;