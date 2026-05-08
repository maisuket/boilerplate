"use client";

import { useState, useCallback, useMemo } from "react";

interface UsePaginationOptions {
  initialPage?: number;
  itemsPerPage?: number;
  initialTotal?: number;
}

interface UsePaginationReturn {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  total: number;
  setTotal: (total: number) => void;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  pageNumbers: number[];
  offset: number;
}

/**
 * Hook for managing pagination state
 *
 * @example
 * const { page, setPage, totalPages } = usePagination({ initialPage: 1, itemsPerPage: 10 });
 */
export function usePagination({
  initialPage = 1,
  itemsPerPage = 10,
  initialTotal = 0,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const [total, setTotalState] = useState(initialTotal);

  const setTotal = useCallback((newTotal: number) => {
    setTotalState(newTotal);
  }, []);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / itemsPerPage)),
    [total, itemsPerPage]
  );

  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const nextPage = useCallback(() => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToPage = useCallback(
    (targetPage: number) => {
      setPage(Math.max(1, Math.min(targetPage, totalPages)));
    },
    [totalPages]
  );

  // Generate page numbers for pagination UI (shows up to 7 pages with ellipsis)
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: number[] = [];

    if (page <= 4) {
      pages.push(1, 2, 3, 4, 5, -1, totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(
        1,
        -1,
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pages.push(1, -1, page - 1, page, page + 1, -1, totalPages);
    }

    return pages;
  }, [page, totalPages]);

  const offset = (page - 1) * itemsPerPage;

  return {
    page,
    setPage,
    itemsPerPage,
    total,
    setTotal,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToPage,
    pageNumbers,
    offset,
  };
}
