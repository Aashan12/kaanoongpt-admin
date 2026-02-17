export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  COUNTRY_CODE: /^[A-Z]{2}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  HEX_COLOR: /^#[0-9A-F]{6}$/i,
  IPV4: /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/,
} as const;