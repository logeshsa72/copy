import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL, GREY_YARN_API } from "../../constants/apiUrl";


const greyYarnPo = createApi({
    reducerPath: 'GreyYarnPo',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ['GreyYarnPo'],
    endpoints: (builder) => ({
        getGreyYarnPo: builder.query({
            query: ({ params }) => {
                return {
                    url: GREY_YARN_API,
                    method: 'GET',
                    params,
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['GreyYarnPo'],
        }),
        getGreyYarnPoDeatilsById: builder.query({
            query: (params) => {
                return {
                    url: `${GREY_YARN_API}/poDetails`,
                    method: 'GET',
                    params,
                }
            },
            providesTags: ['GreyYarnPo'],
        }),
        getGreyYarnPoItems: builder.query({
            query: (params) => {
                return {
                    url: `${GREY_YARN_API}/getPoItem`,
                    method: 'GET',
                    params,
                }
            },
            providesTags: ['GreyYarnPo'],
        }),
        loginGreyYarnPo: builder.mutation({
            query: (payload) => ({
                url: GREY_YARN_API + "/login",
                method: 'POST',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["GreyYarnPo"],
        }),
        addGreyYarnPo: builder.mutation({
            query: (payload) => ({
                url: GREY_YARN_API,
                method: 'POST',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["GreyYarnPo"],
        }),
        updateStatus: builder.mutation({
            query: (params) => {
                return {
                    url: `${GREY_YARN_API}/acceptPo`,
                    method: 'PUT',
                    params,
                }
            },
            invalidatesTags: ["GreyYarnPo"],
        }),
        deleteGreyYarnPo: builder.mutation({
            query: (id) => ({
                url: `${GREY_YARN_API}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ["GreyYarnPo"],
        }),
    }),
})

export const {
    useGetGreyYarnPoQuery,
    useGetGreyYarnPoDeatilsByIdQuery,
    useGetGreyYarnPoItemsQuery,
    useLoginGreyYarnPoMutation,
    useAddGreyYarnPoMutation,
    useUpdateStatusMutation,
    useDeleteGreyYarnPoMutation } = greyYarnPo;

export default greyYarnPo;