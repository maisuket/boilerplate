import { apiClient } from "@/lib/axios";
import type { AuthResponse, LoginPayload, RegisterPayload } from "@/types/auth.types";
import type { User } from "@/types/user.types";

export const authService = {
  /**
   * Authenticate user with email and password
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", payload);
    return response.data;
  },

  /**
   * Register a new user account
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", payload);
    return response.data;
  },

  /**
   * Refresh the access token using the refresh token
   */
  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await apiClient.post<{ accessToken: string; refreshToken: string }>(
      "/auth/refresh",
      { refreshToken }
    );
    return response.data;
  },

  /**
   * Logout the current user (invalidate tokens server-side)
   */
  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  /**
   * Get the currently authenticated user's profile
   */
  async me(): Promise<User> {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  },

  /**
   * Request a password reset email
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>("/auth/forgot-password", {
      email,
    });
    return response.data;
  },

  /**
   * Reset password using a valid token
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  },

  /**
   * Change password for the authenticated user
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};
