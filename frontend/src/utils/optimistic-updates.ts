import { QueryClient, QueryKey } from "@tanstack/react-query";

/**
 * Cancela as requisições em andamento e atualiza o cache otimisticamente.
 * Retorna o snapshot anterior para possibilitar rollback em caso de erro.
 */
export async function handleOptimisticMutate<TVariables>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  variables: TVariables,
  updater: (oldData: any, variables: TVariables) => any
) {
  await queryClient.cancelQueries({ queryKey });
  const previousData = queryClient.getQueriesData({ queryKey });

  queryClient.setQueriesData({ queryKey }, (oldData: any) => {
    if (!oldData) return oldData;
    return updater(oldData, variables);
  });

  return { previousData };
}

/**
 * Em caso de erro, restaura o cache para o snapshot anterior.
 */
export function handleOptimisticError(
  queryClient: QueryClient,
  context?: { previousData?: [QueryKey, unknown][] }
) {
  if (context?.previousData) {
    context.previousData.forEach(([queryKey, data]) => {
      queryClient.setQueryData(queryKey, data);
    });
  }
}

/**
 * Utilitários para atualizar a estrutura padrão de paginação { data: [], meta: {} }
 */
export const paginatedCacheUpdater = {
  update: (oldData: any, id: string | number, updatedData: any) => {
    if (!oldData?.data) return oldData;
    return {
      ...oldData,
      data: oldData.data.map((item: any) => (item.id === id ? { ...item, ...updatedData } : item)),
    };
  },
  delete: (oldData: any, id: string | number) => {
    if (!oldData?.data) return oldData;
    return {
      ...oldData,
      data: oldData.data.filter((item: any) => item.id !== id),
      meta: oldData.meta
        ? { ...oldData.meta, total: Math.max(0, oldData.meta.total - 1) }
        : undefined,
    };
  },
};
