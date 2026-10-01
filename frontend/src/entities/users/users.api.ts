import { commonApi } from '@/entities/common/base-query'
import {
  type UserAccount,
  type CreateUserRequest,
  type UpdateUserRequest,
} from '@/entities/users/users.types'

const usersApi = commonApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<UserAccount[], void>({
      query: () => ({
        url: 'api/users/',
        method: 'GET',
      }),
      providesTags: ['USERS'],
    }),
    getUserById: builder.query<UserAccount, number>({
      query: (id) => ({
        url: `api/users/${id}`,
        method: 'GET',
      }),
      providesTags: ['USERS'],
    }),
    createUser: builder.mutation<UserAccount, CreateUserRequest>({
      query: (body) => ({
        url: 'api/users/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['USERS'],
    }),
    updateUser: builder.mutation<UserAccount, { id: number; body: UpdateUserRequest }>({
      query: ({ id, body }) => ({
        url: `api/users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['USERS'],
    }),
    deleteUser: builder.mutation<{ status: string; message: string }, number>({
      query: (id) => ({
        url: `api/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['USERS'],
    }),
  }),
})

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi
