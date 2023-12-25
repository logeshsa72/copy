import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL, GREY_FABRIC_API } from "../../constants/apiUrl";


const greyFabricPo = createApi({
    reducerPath: 'GreyFabricPo',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ['GreyFabricPo'],
    endpoints: (builder) => ({
        getGreyFabricPo: builder.query({
            query: ({ params }) => {
                return {
                    url: GREY_FABRIC_API,
                    method: 'GET',
                    params,
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['GreyFabricPo'],
        }),
        getGreyFabricPoDetailsById: builder.query({
            query: (params) => {
                return {
                    url: `${GREY_FABRIC_API}/poDetails`,
                    method: 'GET',
                    params,
                }
            },
            providesTags: ['GreyFabricPo'],
        }),
        getGreyFabricPoItems: builder.query({
            query: (params) => {
                return {
                    url: `${GREY_FABRIC_API}/getPoItem`,
                    method: 'GET',
                    params,
                }
            },
            providesTags: ['GreyFabricPo'],
        }),
        loginGreyFabricPo: builder.mutation({
            query: (payload) => ({
                url: GREY_FABRIC_API + "/login",
                method: 'POST',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["GreyFabricPo"],
        }),
        addGreyFabricPo: builder.mutation({
            query: (payload) => ({
                url: GREY_FABRIC_API,
                method: 'POST',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["GreyFabricPo"],
        }),
        updateStatus: builder.mutation({
            query: (params) => {
                return {
                    url: `${GREY_FABRIC_API}/acceptPo`,
                    method: 'PUT',
                    params,
                }
            },
            invalidatesTags: ["GreyFabricPo"],
        }),

    }),
})

export const {
    useGetGreyFabricPoQuery,
    useGetGreyFabricPoDetailsByIdQuery,
    useGetGreyFabricPoItemsQuery,
    useLoginGreyFabricPoMutation,
    useAddGreyFabricPoMutation,
    useUpdateStatusMutation,
} = greyFabricPo;

export default greyFabricPo;