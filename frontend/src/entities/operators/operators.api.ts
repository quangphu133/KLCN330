import { commonApi } from '@/entities/common/base-query';
import { type Operator } from '@/entities/operators/operators.types';

const OperatorApi = commonApi.injectEndpoints({
  endpoints: (builder) => ({
    getOperators: builder.query<Operator[], void>({
      query: () => ({
        url: 'api/operators/',
        method: 'GET',
      }),
      providesTags: ['OPERATORS'],
    }),
    getOperator: builder.query<Operator, number>({
      query: (id) => ({
        url: `api/operators/${id}`,
        method: 'GET',
      }),
      providesTags: ['OPERATORS'],
    }),
    createOperator: builder.mutation<null, Partial<Operator>>({
      query: (body) => ({
        url: 'api/operators/',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['OPERATORS'],
    }),
    updateOperator: builder.mutation<
      null,
      { body: Partial<Operator>; id: number }
    >({
      query: ({ body, id }) => ({
        url: `api/operators/${id}`,
        method: 'PUT',
        body: body,
      }),
      invalidatesTags: ['OPERATORS'],
    }),
    deleteOperator: builder.mutation<null, number>({
      query: (id) => ({
        url: `api/operators/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['OPERATORS'],
    }),
  }),
});

export const {
  useGetOperatorsQuery,
  useGetOperatorQuery,
  useCreateOperatorMutation,
  useUpdateOperatorMutation,
  useDeleteOperatorMutation,
} = OperatorApi;
