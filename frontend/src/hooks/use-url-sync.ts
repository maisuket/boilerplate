"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/components/layout/routing";
import { useDebounce } from "@/hooks/use-debounce";

export function useUrlSync(delayMs = 400) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlPage = Number(searchParams.get("page")) || 1;
  const urlSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebounce(search, delayMs);

  // Sincroniza o estado local de busca caso a URL mude externamente (ex: Botão "Voltar" do navegador)
  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  // Atualiza a URL silenciosamente quando o termo pesquisado for processado pelo debounce
  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (currentSearch === debouncedSearch) return; // Evita loop de atualização

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, pathname, router, searchParams]);

  const changeUrlPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newPage <= 1) {
        params.delete("page");
      } else {
        params.set("page", newPage.toString());
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const getFilter = useCallback((key: string) => searchParams.get(key) || "", [searchParams]);

  const setFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reseta a página para 1 sempre que um filtro for adicionado ou removido
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const toggleSort = useCallback(
    (column: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentSortBy = params.get("sortBy");
      const currentSortOrder = params.get("sortOrder");

      if (currentSortBy === column) {
        if (currentSortOrder === "asc") {
          params.set("sortOrder", "desc");
        } else if (currentSortOrder === "desc") {
          params.delete("sortBy");
          params.delete("sortOrder");
        } else {
          params.set("sortOrder", "asc");
        }
      } else {
        params.set("sortBy", column);
        params.set("sortOrder", "asc");
      }

      params.delete("page"); // Reseta para a página 1 ao alterar a ordem
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return {
    urlPage,
    changeUrlPage,
    search,
    setSearch,
    debouncedSearch,
    getFilter,
    setFilter,
    toggleSort,
  };
}
