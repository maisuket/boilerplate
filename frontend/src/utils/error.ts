import type { AxiosError } from "axios";

import type { ApiError } from "@/types/api.types";

/**
 * Extracts a human-readable error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (!error) {
    return "An unknown error occurred";
  }

  // Handle Axios errors
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;

    // Check for response data errors
    if (axiosError.response?.data) {
      const data = axiosError.response.data;

      if (typeof data === "string") return data;

      if (data.message) {
        // Handle validation errors
        if (data.errors && data.errors.length > 0) {
          return data.errors.map((e) => e.message).join(", ");
        }
        return data.message;
      }
    }

    // Network or timeout errors
    if (axiosError.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }
    if (!axiosError.response) {
      return "Network error. Please check your connection.";
    }

    // HTTP status code messages
    const status = axiosError.response.status;
    return getHttpErrorMessage(status);
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Handle objects with a message property
  if (typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }

  return "An unexpected error occurred";
}

/**
 * Returns a human-readable message for common HTTP status codes
 */
export function getHttpErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: "Invalid request. Please check your input.",
    401: "You are not authenticated. Please sign in.",
    403: "You do not have permission to perform this action.",
    404: "The requested resource was not found.",
    408: "Request timed out. Please try again.",
    409: "A conflict occurred. The resource may already exist.",
    422: "Validation failed. Please check your input.",
    429: "Too many requests. Please wait a moment and try again.",
    500: "Server error. Please try again later.",
    502: "Service temporarily unavailable. Please try again.",
    503: "Service is currently unavailable. Please try again later.",
    504: "Gateway timeout. Please try again.",
  };

  return messages[status] ?? `Request failed with status ${status}`;
}

/**
 * Type guard for Axios errors
 */
export function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as AxiosError).isAxiosError === true
  );
}

/**
 * Checks if an error is a 401 Unauthorized error
 */
export function isUnauthorizedError(error: unknown): boolean {
  return isAxiosError(error) && (error as AxiosError).response?.status === 401;
}

/**
 * Checks if an error is a 403 Forbidden error
 */
export function isForbiddenError(error: unknown): boolean {
  return isAxiosError(error) && (error as AxiosError).response?.status === 403;
}

/**
 * Checks if an error is a network error (no response)
 */
export function isNetworkError(error: unknown): boolean {
  return isAxiosError(error) && !(error as AxiosError).response;
}

/**
 * Extracts validation errors as a field-to-message map
 */
export function getValidationErrors(error: unknown): Record<string, string> {
  if (!isAxiosError(error)) return {};

  const axiosError = error as AxiosError<ApiError>;
  const errors = axiosError.response?.data?.errors;

  if (!errors) return {};

  return errors.reduce<Record<string, string>>((acc, { field, message }) => {
    acc[field] = message;
    return acc;
  }, {});
}
