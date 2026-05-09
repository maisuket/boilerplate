"use client";

import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";
import { QUERY_KEYS } from "@/constants/query-keys";

interface UseUsersOptions {
  page: number;
  limit: number;
  search?: string;
}

export function useUsers({ page, limit, search }: UseUsersOptions) {
  const query = useQuery({
    queryKey: QUERY_KEYS.users.list({ page, search }),
    queryFn: () => usersService.getUsers({ page, limit, search }),
    placeholderData: (prev) => prev,
  });

  return {
    ...query,
    users: query.data?.data ?? [],
    total: query.data?.meta?.total ?? 0,
  };
}
