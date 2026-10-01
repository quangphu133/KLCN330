export const appRoutes = {
  auth: {
    signIn: '/auth/sign-in',
    underConstructionPlain: '/auth/under-construction-plain',
  },
  private: {
    dashboard: '/',
    call: (Id: string) => `/calls/${Id}`,
    calls: '/calls',
    uploadingRecord: '/uploading-record',
    profile: '/profile',
    settings: '/settings',
    underConstruction: '/under-construction',
    operators: '/operators',
    projects: '/projects',
    checklists: '/checklists',
    dictionaries: '/dictionaries',
    users: '/users',
  },
}
