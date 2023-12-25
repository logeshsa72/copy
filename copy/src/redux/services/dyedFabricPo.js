import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL, DYED_FABRIC_API } from "../../constants/apiUrl";


const dyedFabricPo = createApi({
    reducerPath: 'DyedFabricPo',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ['DyedFabricPo'],
    endpoints: (builder) => ({
        getDyedFabricPo: builder.query({
            query: ({ params }) => {
                return {
                    url: DYED_FABRIC_API,
                    method: 'GET',
                    params,
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['DyedFabricPo'],
        }),
        getDyedFabricPoDetailsById: builder.query({
            query: (params) => {
                return {
                    url: `${DYED_FABRIC_API}/poDetails`,
                    method: 'GET',
                    params,
                }
            },
            providesTags: ['DyedFabricPo'],
        }),
        getDyedFabricPoItems: builder.query({
            query: (params) => {
                return {
                    url: `${DYED_FABRIC_API}/getPoItem`,
                    method: 'GET',
                    params,
                }
            },
            providesTags: ['DyedFabricPo'],
        }),
        loginDyedFabricPo: builder.mutation({
            query: (payload) => ({
                url: DYED_FABRIC_API + "/login",
                method: 'POST',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["DyedFabricPo"],
        }),
        addDyedFabricPo: builder.mutation({
            query: (payload) => ({
                url: DYED_FABRIC_API,
                method: 'POST',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["DyedFabricPo"],
        }),
        updateStatus: builder.mutation({
            query: (params) => {
                return {
                    url: `${DYED_FABRIC_API}/acceptPo`,
                    method: 'PUT',
                    params,
                }
            },
            invalidatesTags: ["DyedFabricPo"],
        }),
        deleteDyedFabricPo: builder.mutation({
            query: (id) => ({
                url: `${DYED_FABRIC_API}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ["DyedFabricPo"],
        }),
    }),
})

export const {
    useGetDyedFabricPoQuery,
    useGetDyedFabricPoDetailsByIdQuery,
    useGetDyedFabricPoItemsQuery,
    useLoginDyedFabricPoMutation,
    useAddDyedFabricPoMutation,
    useUpdateStatusMutation,
    useDeleteDyedFabricPoMutation } = dyedFabricPo;

export default dyedFabricPo;