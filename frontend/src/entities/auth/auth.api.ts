import { commonApi } from '@/entities/common/base-query'
import {
  RequestLoginType,
  ResponseLoginType,
  UpdateProfileRequest,
  UserProfile,
} from '@/entities/auth/auth.types'

export const authApi = commonApi.injectEndpoints({
  endpoints: builder => ({
    signIn: builder.mutation<ResponseLoginType, RequestLoginType>({
      invalidatesTags: ['AUTH'],
      query: body => {
        return {
          body,
          method: 'POST',
          url: 'api/auth/signin',
        }
      },
    }),
    getProfile: builder.query<UserProfile, void>({
      query: () => ({
        method: 'GET',
        url: 'api/auth/me',
      }),
      providesTags: ['AUTH'],
    }),
    updateProfile: builder.mutation<UserProfile, UpdateProfileRequest>({
      query: body => ({
        body,
        method: 'PUT',
        url: 'api/auth/me',
      }),
      invalidatesTags: ['AUTH'],
    }),
  }),
})

export const {
  useGetProfileQuery,
  useSignInMutation,
  useUpdateProfileMutation,
} = authApi
