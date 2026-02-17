export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  MODELS: {
    LIST: '/models',
    CREATE: '/models',
    UPDATE: (id: string) => `/models/${id}`,
    DELETE: (id: string) => `/models/${id}`,
    TEST: (id: string) => `/models/${id}/test`,
  },
  SETUP: {
    COUNTRIES: '/system-setup/countries',
    STATES: '/system-setup/states',
    CASE_TYPES: '/system-setup/case-types',
    COURT_TYPES: '/system-setup/court-types',
  }
};