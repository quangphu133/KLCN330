import { commonApi } from '@/entities/common/base-query';
import { Project } from '@/entities/projects/projects.types';

const ProjectApi = commonApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => ({
        url: 'api/projects/',
        method: 'GET',
      }),
      providesTags: ['PROJECTS'],
    }),
    getProject: builder.query<Project, number>({
      query: (id) => ({
        url: `api/projects/${id}`,
        method: 'GET',
      }),
      providesTags: ['PROJECTS'],
    }),
    createProject: builder.mutation<null, Partial<Project>>({
      query: (body) => ({
        url: 'api/projects/',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['PROJECTS'],
    }),
    updateProject: builder.mutation<
      null,
      { body: Partial<Project>; id: number }
    >({
      query: ({ body, id }) => {
        const { isActive, ...projectFields } = body;

        return {
          url: `api/projects/${id}`,
          method: 'PUT',
          body: {
            ...projectFields,
            ...(isActive === undefined ? {} : { is_active: isActive }),
          },
        };
      },
      invalidatesTags: ['PROJECTS'],
    }),
    deleteProject: builder.mutation<void, number>({
      query: (id) => ({
        url: `api/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PROJECTS'],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = ProjectApi;
