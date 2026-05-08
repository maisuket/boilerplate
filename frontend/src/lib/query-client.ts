import { QueryClient, type DefaultOptions } from "@tanstack/react-query";

const queryConfig: DefaultOptions = {
  queries: {
    // Time before data is considered stale (5 minutes)
    staleTime: 5 * 60 * 1000,
    // Time before inactive queries are removed from cache (10 minutes)
    gcTime: 10 * 60 * 1000,
    // Number of retry attempts on failure
    retry: (failureCount, error) => {
      // Don't retry on 4xx client errors
      const status = (error as { response?: { status?: number } }).response?.status;
      if (status && status >= 400 && status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    // Refetch on window focus for fresh data
    refetchOnWindowFocus: false,
    // Don't refetch on reconnect by default
    refetchOnReconnect: "always",
  },
  mutations: {
    // Retry mutations once on network error
    retry: 0,
  },
};

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: queryConfig,
  });
}

// Singleton for server components / utility usage
let clientQueryClientSingleton: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: always create a new QueryClient
    return createQueryClient();
  }
  // Browser: reuse existing instance
  if (!clientQueryClientSingleton) {
    clientQueryClientSingleton = createQueryClient();
  }
  return clientQueryClientSingleton;
}
