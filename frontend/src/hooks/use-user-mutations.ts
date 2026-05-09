"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/utils/error";
import type { UpdateUserFormData } from "@/schemas/user.schema";
import {
  handleOptimisticMutate,
  handleOptimisticError,
  paginatedCacheUpdater,
} from "@/utils/optimistic-updates";

interface MutationOptions {
  onSuccess?: () => void;
  successMessage?: { title: string; description: string };
}

export function useCreateUser(options?: MutationOptions) {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.createUser,
    onMutate: async () => {
      // Apenas salva o snapshot (Não fazemos update de cache na criação porque não temos o ID gerado pelo DB ainda)
      await queryClient.cancelQueries({ queryKey: ["users"] });
      const previousData = queryClient.getQueriesData({ queryKey: ["users"] });
      return { previousData };
    },
    onError: (error, _, context) => {
      handleOptimisticError(queryClient, context as any);
      toast.error("Error", getErrorMessage(error));
    },
    onSuccess: () => {
      toast.success(
        options?.successMessage?.title ?? "User created",
        options?.successMessage?.description ?? "The user has been successfully created."
      );
      options?.onSuccess?.();
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser(options?: MutationOptions) {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateUserFormData> | any }) =>
      usersService.updateUser(id, data),
    onMutate: async ({ id, data }) => {
      return handleOptimisticMutate(queryClient, ["users"], { id, data }, (oldData, vars) =>
        paginatedCacheUpdater.update(oldData, vars.id, vars.data)
      );
    },
    onError: (error, _, context) => {
      handleOptimisticError(queryClient, context as any);
      toast.error("Error", getErrorMessage(error));
    },
    onSuccess: () => {
      toast.success(
        options?.successMessage?.title ?? "User updated",
        options?.successMessage?.description ?? "The user has been successfully updated."
      );
      options?.onSuccess?.();
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser(options?: MutationOptions) {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.deleteUser,
    onMutate: async (id) => {
      return handleOptimisticMutate(queryClient, ["users"], id, (oldData, deletedId) =>
        paginatedCacheUpdater.delete(oldData, deletedId)
      );
    },
    onError: (error, _, context) => {
      handleOptimisticError(queryClient, context as any);
      toast.error("Error", getErrorMessage(error));
    },
    onSuccess: () => {
      toast.success(
        options?.successMessage?.title ?? "User deleted",
        options?.successMessage?.description ?? "The user has been successfully removed."
      );
      options?.onSuccess?.();
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
