"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell } from "@/components/ui/table";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { AddUserDialog } from "@/components/forms/add-user-dialog";
import { EditUserDialog } from "@/components/forms/edit-user-dialog";
import { DeleteUserDialog } from "@/components/dialogs/delete-user-dialog";
import { ResetPasswordDialog } from "@/components/forms/reset-password-dialog";
import { usePagination } from "@/hooks/use-pagination";
import { useUsers } from "@/hooks/use-users";
import { useUrlSync } from "@/hooks/use-url-sync";
import type { User } from "@/types/user.types";
import { USER_ROLES, type UserRole } from "@/constants/roles";
import { useTranslations, useFormatter } from "next-intl";
import { getColumns } from "./columns";

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
  const tTable = useTranslations("usersTable");
  const t = useTranslations("usersPage");
  const format = useFormatter();
  const {
    urlPage,
    changeUrlPage,
    search,
    setSearch,
    debouncedSearch,
    getFilter,
    setFilter,
    toggleSort,
  } = useUrlSync();
  const statusFilter = getFilter("status");
  const roleFilter = getFilter("role");

  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);

  const { page, setPage, totalPages, setTotal } = usePagination({
    initialPage: urlPage,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  useEffect(() => {
    setPage(urlPage);
  }, [urlPage, setPage]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    changeUrlPage(newPage);
  };

  const { users, total, isLoading, isError, refetch } = useUsers({
    page,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch,
    status: statusFilter || undefined,
    role: (roleFilter as UserRole) || undefined,
    sortBy: getFilter("sortBy") || undefined,
    sortOrder: (getFilter("sortOrder") as "asc" | "desc") || undefined,
  });

  useEffect(() => {
    if (total !== 0) {
      setTotal(total);
    }
  }, [total, setTotal]);

  const columns = useMemo(
    () =>
      getColumns(
        tTable,
        format,
        { getFilter, toggleSort },
        {
          onEdit: setUserToEdit,
          onResetPassword: setUserToResetPassword,
          onDelete: (user) => setUserToDelete(user.id),
        }
      ),
    [tTable, format, getFilter, toggleSort]
  );

  return (
    <div className="flex flex-col flex-1 space-y-4 h-[calc(100dvh-7rem)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("description")}</p>
        </div>
        <AddUserDialog />
      </div>

      <Card className="flex flex-col flex-1 min-h-0">
        <CardHeader className="shrink-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{t("allUsers")}</CardTitle>
              <CardDescription>
                {isLoading ? t("loading") : t("totalUsers", { total })}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    handlePageChange(1);
                  }}
                  className="pl-9 w-[220px]"
                />
              </div>
              <Select
                value={statusFilter || "all"}
                onValueChange={(val) => setFilter("status", val === "all" ? "" : val)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={t("allStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allStatus")}</SelectItem>
                  <SelectItem value="active">{t("active")}</SelectItem>
                  <SelectItem value="inactive">{t("inactive")}</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={roleFilter || "all"}
                onValueChange={(val) => setFilter("role", val === "all" ? "" : val)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={t("allRoles")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allRoles")}</SelectItem>
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0) + role.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-auto rounded-md border">
            <DataTable
              columns={columns}
              data={users}
              keyExtractor={(user) => user.id}
              isLoading={isLoading}
              isError={isError}
              skeletonRowCount={ITEMS_PER_PAGE}
              customSkeletonRow={
                <>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-16 ml-auto" />
                  </TableCell>
                </>
              }
              errorState={
                <EmptyState
                  title={t("errorTitle")}
                  description={t("errorDescription")}
                  action={{ label: t("tryAgain"), onClick: () => refetch() }}
                />
              }
              emptyState={
                <EmptyState
                  title={t("noUsersTitle")}
                  description={
                    debouncedSearch
                      ? t("noUsersMatch", { search: debouncedSearch })
                      : t("noUsersCreated")
                  }
                />
              }
            />
          </div>

          {!isLoading && totalPages > 0 && (
            <div className="flex items-center justify-between mt-4 shrink-0">
              <p className="text-sm text-muted-foreground">
                {t("page")} <span className="font-medium text-foreground">{page}</span> {t("of")}{" "}
                <span className="font-medium text-foreground">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page <= 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t("previous")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages || isLoading}
                >
                  {t("next")}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteUserDialog userId={userToDelete} onClose={() => setUserToDelete(null)} />

      <EditUserDialog user={userToEdit} onClose={() => setUserToEdit(null)} />

      <ResetPasswordDialog
        user={userToResetPassword}
        onClose={() => setUserToResetPassword(null)}
      />
    </div>
  );
}
