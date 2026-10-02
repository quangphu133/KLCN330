import { commonApi } from '@/entities/common/base-query';
import { Dictionary, DictionaryReqBody } from './dictionaries.types';

const DictionaryApi = commonApi.injectEndpoints({
  endpoints: (builder) => ({
    getDictionaries: builder.query<Dictionary[], void>({
      query: () => ({
        url: 'api/vocabularies/',
        method: 'GET',
      }),
      providesTags: ['DICTIONARIES'],
    }),
    getDictionary: builder.query<Dictionary, number>({
      query: (id) => ({
        url: `api/vocabularies/${id}`,
        method: 'GET',
      }),
      providesTags: ['DICTIONARIES'],
    }),
    createDictionary: builder.mutation<null, DictionaryReqBody>({
      query: (body) => ({
        url: 'api/vocabularies/',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['DICTIONARIES'],
    }),
    updateDictionary: builder.mutation<
      Dictionary,
      { body: Partial<DictionaryReqBody>; id: number }
    >({
      query: ({ body, id }) => {
        const { isActive, ...dictionaryFields } = body;

        return {
          url: `api/vocabularies/${id}`,
          method: 'PUT',
          body: {
            ...dictionaryFields,
            ...(isActive === undefined ? {} : { is_active: isActive }),
          },
        };
      },
      invalidatesTags: ['DICTIONARIES'],
    }),
    deleteDictionary: builder.mutation<void, number>({
      query: (id) => ({
        url: `api/vocabularies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DICTIONARIES'],
    }),
  }),
});

export const {
  useGetDictionariesQuery,
  useGetDictionaryQuery,
  useCreateDictionaryMutation,
  useUpdateDictionaryMutation,
  useDeleteDictionaryMutation,
} = DictionaryApi;
