import { commonApi } from '@/entities/common/base-query';
import type {
  Checklist,
  ChecklistFull,
  ChecklistReqBody,
} from './checklists.types';

const ChecklistApi = commonApi.injectEndpoints({
  endpoints: (builder) => ({
    getChecklists: builder.query<Checklist[], void>({
      query: () => ({
        url: 'api/checklists/',
        method: 'GET',
      }),
      providesTags: ['CHECKLISTS'],
    }),
    getChecklist: builder.query<ChecklistFull, number>({
      query: (id) => ({
        url: `api/checklists/${id}`,
        method: 'GET',
      }),
      providesTags: ['CHECKLISTS'],
    }),
    createChecklist: builder.mutation<
      null,
      Pick<Checklist, 'name' | 'projectIds'>
    >({
      query: (body) => ({
        url: 'api/checklists/',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['CHECKLISTS'],
    }),
    updateChecklist: builder.mutation<
      null,
      { body: Partial<ChecklistReqBody>; id: number }
    >({
      query: ({ body, id }) => ({
        url: `api/checklists/${id}`,
        method: 'PUT',
        body: body,
      }),
      invalidatesTags: ['CHECKLISTS'],
    }),
    cloneChecklist: builder.mutation<null, number>({
      query: (id) => ({
        url: `api/checklists/${id}/clone`,
        method: 'POST',
      }),
      invalidatesTags: ['CHECKLISTS'],
    }),
    deleteChecklist: builder.mutation<void, number>({
      query: (id) => ({
        url: `api/checklists/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CHECKLISTS'],
    }),
  }),
});

export const {
  useGetChecklistsQuery,
  useGetChecklistQuery,
  useCreateChecklistMutation,
  useUpdateChecklistMutation,
  useCloneChecklistMutation,
  useDeleteChecklistMutation,
} = ChecklistApi;
