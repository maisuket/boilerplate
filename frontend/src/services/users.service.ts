import { apiClient } from "@/lib/axios";
import type { User, CreateUserPayload, UpdateUserPayload } from "@/types/user.types";
import type {
  ApiResponse,
  PaginatedResponse,
  ListQueryParams,
  PaginationMeta,
} from "@/types/api.types";
import { ChangePasswordFormData } from "@/schemas/auth.schema";

export const usersService = {
  getUsers: async (params?: ListQueryParams): Promise<PaginatedResponse<User>> => {
    // Agora o interceptor coloca o 'meta' na raiz do ApiResponse
    const { data } = await apiClient.get<ApiResponse<User[]>>("/users", {
      params,
    });

    return { data: data.data, meta: data.meta as PaginationMeta };
  },

  getUser: async (id: string): Promise<User> => {
    const { data } = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return data.data;
  },

  createUser: async (payload: CreateUserPayload): Promise<User> => {
    const { data } = await apiClient.post<ApiResponse<User>>("/users", payload);
    return data.data;
  },

  updateUser: async (id: string, payload: UpdateUserPayload): Promise<User> => {
    const { data } = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, payload);
    return data.data;
  },

  // Adicione isto no seu arquivo users.service.ts (Frontend)
  async changePassword(data: ChangePasswordFormData) {
    const response = await apiClient.patch("/users/change-password", {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    return response.data;
  },
  deleteUser: async (id: string): Promise<void> => {
    // Delete (NO_CONTENT) geralmente não retorna payload, mas desestruturamos por segurança
    const { data } = await apiClient.delete<ApiResponse<void>>(`/users/${id}`);
    return data?.data;
  },

  toggleActive: async (id: string): Promise<User> => {
    const { data } = await apiClient.patch<ApiResponse<User>>(`/users/${id}/toggle-active`);
    return data.data;
  },
};
