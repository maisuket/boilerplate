"use client";

import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";
import { QUERY_KEYS } from "@/constants/query-keys";

interface UseUsersOptions {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useUsers({
  page,
  limit,
  search,
  status,
  role,
  sortBy,
  sortOrder,
}: UseUsersOptions) {
  const query = useQuery({
    queryKey: QUERY_KEYS.users.list({ page, search, status, role, sortBy, sortOrder }),
    queryFn: () => usersService.getUsers({ page, limit, search, status, role, sortBy, sortOrder }),
    placeholderData: (prev) => prev,
  });

  return {
    ...query,
    users: query.data?.data ?? [],
    total: query.data?.meta?.total ?? 0,
  };
}
