import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL, USER_API } from "../../constants/apiUrl";


const user = createApi({
    reducerPath: 'User',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ['User'],
    endpoints: (builder) => ({
        getUser: builder.query({
            query: () => USER_API,
            providesTags: ['User'],
        }),
        getUserById: builder.query({
            query: (id) => {
                return {
                    url: `${USER_API}/${id}`,
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['User'],
        }),
        loginUser: builder.mutation({
            query: (payload) => ({
                url: USER_API + "/login",
                method: 'POST',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["User"],
        }),
        addUser: builder.mutation({
            query: (payload) => ({
                url: USER_API,
                method: 'POST',
                body: payload,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            invalidatesTags: ["User"],
        }),
        updateUser: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload
                return {
                    url: `${USER_API}/${id}`,
                    method: 'PUT',
                    body,
                }
            },
            invalidatesTags: ["User"],
        }),
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `${USER_API}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ["User"],
        }),
    }),
})

export const {
    useGetUserQuery,
    useGetUserByIdQuery,
    useLoginUserMutation,
    useAddUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation } = user;

export default user;