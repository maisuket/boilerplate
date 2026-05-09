"use client";

import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export interface ColumnDef<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  isError?: boolean;
  skeletonRowCount?: number;
  emptyState?: React.ReactNode;
  errorState?: React.ReactNode;
  customSkeletonRow?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading,
  isError,
  skeletonRowCount = 5,
  emptyState,
  errorState,
  customSkeletonRow,
}: DataTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col, index) => (
            <TableHead key={index} className={col.headerClassName}>
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: skeletonRowCount }).map((_, i) => (
            <TableRow key={i}>
              {customSkeletonRow
                ? customSkeletonRow
                : columns.map((col, j) => (
                    <TableCell key={j} className={col.cellClassName}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
            </TableRow>
          ))
        ) : isError ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="p-0">
              {errorState || (
                <div className="text-center text-muted-foreground p-6">
                  An error occurred while loading data.
                </div>
              )}
            </TableCell>
          </TableRow>
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="p-0">
              {emptyState || (
                <div className="text-center text-muted-foreground p-6">No results found.</div>
              )}
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <TableRow key={keyExtractor(item)}>
              {columns.map((col, index) => (
                <TableCell key={index} className={col.cellClassName}>
                  {col.cell
                    ? col.cell(item)
                    : col.accessorKey
                      ? String(item[col.accessorKey])
                      : null}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
