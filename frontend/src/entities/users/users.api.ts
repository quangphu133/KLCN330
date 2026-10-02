import { commonApi } from '@/entities/common/base-query'
import {
  CreateEmployeeRequest,
  EmployeeAccount,
  UpdateEmployeeRequest,
} from '@/entities/users/users.types'

export const usersApi = commonApi.injectEndpoints({
  endpoints: builder => ({
    getEmployees: builder.query<EmployeeAccount[], void>({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        const employees: EmployeeAccount[] = []
        let skip = 0
        const limit = 100

        while (true) {
          const result = await baseQuery({
            url: 'api/users/',
            method: 'GET',
            params: { role: 'telesales', skip, limit },
          })
          if (result.error) return { error: result.error }

          const page = (result.data ?? []) as EmployeeAccount[]
          employees.push(...page)
          if (page.length < limit) break
          skip += page.length
        }

        return { data: employees }
      },
      providesTags: ['EMPLOYEES'],
    }),
    createEmployee: builder.mutation<EmployeeAccount, CreateEmployeeRequest>({
      query: body => ({
        url: 'api/users/',
        method: 'POST',
        body: { ...body, role: 'telesales' },
      }),
      invalidatesTags: ['EMPLOYEES'],
    }),
    updateEmployee: builder.mutation<
      EmployeeAccount,
      { id: number; body: UpdateEmployeeRequest }
    >({
      query: ({ id, body }) => ({
        url: `api/users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['EMPLOYEES'],
    }),
  }),
})

export const {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
} = usersApi
