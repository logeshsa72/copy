import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL, PARTY_API } from "../../constants/apiUrl";


const party = createApi({
    reducerPath: 'Party',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ['Party'],
    endpoints: (builder) => ({
        getParty: builder.query({
            query: () => PARTY_API,
            providesTags: ['Party'],
        }),
        getPartyById: builder.query({
            query: (id) => {
                return {
                    url: `${PARTY_API}/${id}`,
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['Party'],
        }),
        loginParty: builder.mutation({
            query: (payload) => ({
                url: PARTY_API + "/login",
                method: 'POST',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["Party"],
        }),
        addParty: builder.mutation({
            query: (payload) => ({
                url: PARTY_API,
                method: 'POST',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["Party"],
        }),
        updateParty: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload
                return {
                    url: `${PARTY_API}/${id}`,
                    method: 'PUT',
                    body,
                }
            },
            invalidatesTags: ["Party"],
        }),
        deleteParty: builder.mutation({
            query: (id) => ({
                url: `${PARTY_API}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ["Party"],
        }),
    }),
})

export const {
    useGetPartyQuery,
    useGetPartyByIdQuery,
    useLoginPartyMutation,
    useAddPartyMutation,
    useUpdatePartyMutation,
    useDeletePartyMutation } = party;

export default party;