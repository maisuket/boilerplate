/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  message?: string;
  success: boolean;
}

/**
 * Paginated API response with metadata
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Standard API error response
 */
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Sort configuration
 */
export interface SortConfig {
  field: string;
  order: "asc" | "desc";
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  field: string;
  operator: "eq" | "ne" | "lt" | "lte" | "gt" | "gte" | "contains" | "startsWith" | "endsWith";
  value: unknown;
}

/**
 * Standard query parameters for list endpoints
 */
export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
