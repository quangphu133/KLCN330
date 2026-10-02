// Ghi chú nhóm: Điều chỉnh xử lý dữ liệu demo và phản hồi gọi API.
import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';
import { getFromLocalStorage } from '@/shared/utils/common-utils';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { HYDRATE } from 'next-redux-wrapper';
import { Action, PayloadAction } from '@reduxjs/toolkit';
import { AppRootState } from '@/shared/store/rtk.types';
import { appRoutes } from '@/shared/constants/routes';
import {
  demoAnalytics,
  demoChecklists,
  demoDictionaries,
  demoMediaFiles,
  demoProjects,
  demoMediaFileResult,
} from '@/shared/constants/demo-data';


const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BASE_API_URL,
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = getFromLocalStorage('accessToken', null);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithErrorHandling: BaseQueryFn<
  FetchArgs | string,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const token = getFromLocalStorage('accessToken', null);
  const isDemoToken = token === 'local-demo-token';
  const isSignInRequest = api.endpoint === 'signIn';

  if (isDemoToken) {
    const demoData = getDemoData(api.endpoint, args);
    if (demoData !== undefined) {
      return { data: demoData };
    }
  }

  const result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    if (result.error.status === 401 && !isDemoToken && !isSignInRequest) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userEmail');
      if (typeof window !== 'undefined') {
        window.location.href = appRoutes.auth.signIn;
      }
    }
    if (result.error.status === 400) {
      console.error('Bad request error:', result.error.data);
    }
  }
  return result;
};

function getDemoData(endpoint: string, args: unknown): unknown {
  // Helper đến extract URL from FetchArgs
  const getUrl = (a: unknown): string => {
    if (typeof a === 'string') return a;
    if (typeof a === 'object' && a !== null && 'url' in a) return (a as any).url as string;
    return '';
  };
  const url = getUrl(args);

  if (endpoint === 'getAnalyticsDashboard') return demoAnalytics;
  if (endpoint === 'getProjects') return demoProjects;
  if (endpoint === 'getChecklists') return demoChecklists;
  if (endpoint === 'getDictionaries') return demoDictionaries;
  if (endpoint === 'getMediaFilesQuery') return demoMediaFiles;
  if (endpoint === 'getProfile') {
    return {
      id: 0,
      email: 'demo@example.com',
      full_name: 'Tài khoản Demo',
      role: 'admin',
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }
  if (endpoint === 'updateProfile') {
    const body = (args as any)?.body ?? {};
    return {
      id: 0,
      email: body.email ?? 'demo@example.com',
      full_name: body.full_name ?? 'Tài khoản Demo',
      role: 'admin',
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }

  if (endpoint === 'getProject') {
    const match = url.match(/\/(\d+)$/);
    const id = match ? Number(match[1]) : null;
    return id != null
      ? (demoProjects.find((p) => p.id === id) ?? demoProjects[0])
      : demoProjects[0];
  }
  if (endpoint === 'getChecklist') {
    const match = url.match(/\/(\d+)$/);
    const id = match ? Number(match[1]) : null;
    const checklist = id != null
      ? (demoChecklists.find((item) => item.id === id) ?? demoChecklists[0])
      : demoChecklists[0];
    return { ...checklist, checklistProjects: [{ projectName: 'Customer Support', projectId: 1 }] };
  }
  if (endpoint === 'getDictionary') {
    const match = url.match(/\/(\d+)$/);
    const id = match ? Number(match[1]) : null;
    return id != null
      ? (demoDictionaries.find((d) => d.id === id) ?? demoDictionaries[0])
      : demoDictionaries[0];
  }

  // Match api/mediafile/{id}/result
  if (endpoint === 'getMediaFileResult' && /api\/mediafile\/\d+\/result/.test(url)) {
    return demoMediaFileResult;
  }

  // Match api/mediafile/{id} (no suffix)
  if (endpoint === 'getMediaFileById' && /api\/mediafile\/\d+$/.test(url)) {
    const match = url.match(/api\/mediafile\/(\d+)$/);
    const id = match ? Number(match[1]) : null;
    const mediaFile = id != null
      ? demoMediaFiles.mediaFile.find((item) => item.id === id)
      : undefined;
    return mediaFile ?? demoMediaFiles.mediaFile[0];
  }

  // Handle mutations in demo mode
  return undefined;
}


type RootState = AppRootState;

function isHydrateAction(action: Action): action is PayloadAction<RootState> {
  return action.type === HYDRATE;
}

export const commonApi = createApi({
  baseQuery: baseQueryWithErrorHandling,
  endpoints: () => ({}),
  extractRehydrationInfo(action, { reducerPath }): any {
    if (isHydrateAction(action)) {
      return action.payload[reducerPath];
    }
  },
  reducerPath: 'commonApi',
  tagTypes: [
    'ANALYTICS_DASHBOARD',
    'EMPLOYEES',
    'PROJECTS',
    'VOCAB',
    'MEDIAFILE',
    'CHAT',
    'NOTIFICATIONS',
    'AUTH',
    'CHECKLISTS',
    'DICTIONARIES',
  ],
});
