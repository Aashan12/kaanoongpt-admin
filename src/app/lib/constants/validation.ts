export const VALIDATION_RULES = {
  EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email address',
  },
  PASSWORD: {
    minLength: 8,
    message: 'Password must be at least 8 characters',
  },
  COUNTRY_CODE: {
    pattern: /^[A-Z]{2}$/,
    message: 'Country code must be 2 uppercase letters',
  },
  URL: {
    pattern: /^https?:\/\/.+/,
    message: 'Invalid URL',
  },
} as const;