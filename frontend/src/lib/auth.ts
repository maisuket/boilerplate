import Cookies from "js-cookie";

import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/app";

const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

const REFRESH_COOKIE_OPTIONS = {
  expires: 30, // 30 days
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

/**
 * Retrieves the access token from cookies
 */
export function getAccessToken(): string | undefined {
  return Cookies.get(AUTH_TOKEN_KEY);
}

/**
 * Retrieves the refresh token from cookies
 */
export function getRefreshToken(): string | undefined {
  return Cookies.get(REFRESH_TOKEN_KEY);
}

/**
 * Stores both access and refresh tokens in cookies
 */
export function setTokens(accessToken: string, refreshToken?: string): void {
  Cookies.set(AUTH_TOKEN_KEY, accessToken, COOKIE_OPTIONS);
  if (refreshToken) {
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, REFRESH_COOKIE_OPTIONS);
  }
}

/**
 * Removes all auth tokens from cookies
 */
export function clearTokens(): void {
  Cookies.remove(AUTH_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
}

/**
 * Checks if a valid access token exists
 */
export function isAuthenticated(): boolean {
  const token = getAccessToken();
  return !!token;
}

/**
 * Parses the JWT payload without verifying the signature
 * Note: Only use for reading non-sensitive claims - NEVER for auth decisions on server
 */
export function parseJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as T;
  } catch {
    return null;
  }
}

/**
 * Checks if an access token is expired (based on exp claim)
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload<{ exp?: number }>(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}
