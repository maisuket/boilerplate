/**
 * TanStack Query key factory
 * Centralized query key management for consistent cache invalidation
 */
export const QUERY_KEYS = {
  // Auth queries
  auth: {
    all: () => ["auth"] as const,
    me: () => [...QUERY_KEYS.auth.all(), "me"] as const,
  },

  // User queries
  users: {
    all: () => ["users"] as const,
    lists: () => [...QUERY_KEYS.users.all(), "list"] as const,
    list: (params?: Record<string, unknown>) =>
      [...QUERY_KEYS.users.lists(), params] as const,
    details: () => [...QUERY_KEYS.users.all(), "detail"] as const,
    detail: (id: string) => [...QUERY_KEYS.users.details(), id] as const,
  },

  // Dashboard queries
  dashboard: {
    all: () => ["dashboard"] as const,
    stats: () => [...QUERY_KEYS.dashboard.all(), "stats"] as const,
    revenue: (params?: Record<string, unknown>) =>
      [...QUERY_KEYS.dashboard.all(), "revenue", params] as const,
    activity: () => [...QUERY_KEYS.dashboard.all(), "activity"] as const,
  },

  // Analytics queries
  analytics: {
    all: () => ["analytics"] as const,
    overview: (period?: string) =>
      [...QUERY_KEYS.analytics.all(), "overview", period] as const,
    events: (params?: Record<string, unknown>) =>
      [...QUERY_KEYS.analytics.all(), "events", params] as const,
  },
} as const;
