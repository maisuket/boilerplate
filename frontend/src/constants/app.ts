/**
 * Application metadata constants
 */
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "MyApp";
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0";
export const APP_DESCRIPTION = "A powerful admin dashboard built with Next.js 14";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

/**
 * Authentication token keys
 */
export const AUTH_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

/**
 * Pagination defaults
 */
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100] as const;

/**
 * Date/time formats
 */
export const DATE_FORMAT = "MMM d, yyyy";
export const DATETIME_FORMAT = "MMM d, yyyy h:mm a";
export const TIME_FORMAT = "h:mm a";
export const ISO_DATE_FORMAT = "yyyy-MM-dd";

/**
 * File upload limits
 */
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * UI Constants
 */
export const SIDEBAR_COLLAPSED_WIDTH = 64;
export const SIDEBAR_EXPANDED_WIDTH = 256;
export const HEADER_HEIGHT = 64;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  THEME: "theme",
  SIDEBAR_COLLAPSED: "sidebar_collapsed",
  USER_PREFERENCES: "user_preferences",
} as const;

/**
 * Feature flags
 */
export const FEATURES = {
  DARK_MODE: true,
  NOTIFICATIONS: true,
  ANALYTICS: true,
} as const;
