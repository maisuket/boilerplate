import { apiClient } from "@/lib/axios";
import type { PaginatedResponse } from "@/types/api.types";
import type { User, CreateUserPayload, UpdateUserPayload } from "@/types/user.types";

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const usersService = {
  /**
   * Get a paginated list of users
   */
  async getUsers(params?: GetUsersParams): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>("/users", { params });
    return response.data;
  },

  /**
   * Get a single user by ID
   */
  async getUser(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  /**
   * Create a new user
   */
  async createUser(payload: CreateUserPayload): Promise<User> {
    const response = await apiClient.post<User>("/users", payload);
    return response.data;
  },

  /**
   * Update an existing user
   */
  async updateUser(id: string, payload: Partial<UpdateUserPayload>): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${id}`, payload);
    return response.data;
  },

  /**
   * Delete a user by ID
   */
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  /**
   * Activate or deactivate a user
   */
  async toggleUserStatus(id: string, isActive: boolean): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${id}/status`, { isActive });
    return response.data;
  },

  /**
   * Change a user's role
   */
  async changeUserRole(id: string, role: string): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${id}/role`, { role });
    return response.data;
  },

  /**
   * Bulk delete users
   */
  async bulkDelete(ids: string[]): Promise<{ deleted: number }> {
    const response = await apiClient.delete<{ deleted: number }>("/users/bulk", {
      data: { ids },
    });
    return response.data;
  },
};
