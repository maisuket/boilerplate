"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit2,
  Trash2,
  Key,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableCell } from "@/components/ui/table";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { formatDate } from "@/utils/format";
import { useUsers } from "@/hooks/use-users";
import { useUrlSync } from "@/hooks/use-url-sync";
import type { User } from "@/types/user.types";
import { USER_ROLES, type UserRole } from "@/constants/roles";

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderSortableHeader = (label: string, column: string) => {
    const isActive = getFilter("sortBy") === column;
    const currentOrder = getFilter("sortOrder");

    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[active=true]:text-foreground"
        data-active={isActive}
        onClick={() => toggleSort(column)}
      >
        <span>{label}</span>
        {isActive && currentOrder === "asc" ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : isActive && currentOrder === "desc" ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
        )}
      </Button>
    );
  };

  const columns: ColumnDef<User>[] = [
    {
      header: renderSortableHeader("User", "name"),
      cell: (user) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium leading-none">{user.name}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: renderSortableHeader("Role", "role"),
      cell: (user) => (
        <Badge variant={user.role?.toUpperCase() === "ADMIN" ? "default" : "secondary"}>
          {user.role}
        </Badge>
      ),
    },
    {
      header: renderSortableHeader("Status", "isActive"),
      cell: (user) => (
        <Badge variant={user.isActive ? "success" : "destructive"}>
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: renderSortableHeader("Joined", "createdAt"),
      cellClassName: "text-muted-foreground",
      cell: (user) => formatDate(user.createdAt),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (user) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer" onClick={() => setUserToEdit(user)}>
              <Edit2 className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setUserToResetPassword(user)}
            >
              <Key className="mr-2 h-4 w-4" />
              <span>Reset Password</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={() => setUserToDelete(user.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 space-y-4 animate-in h-[calc(100dvh-7rem)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1">Manage your application users</p>
        </div>
        <AddUserDialog />
      </div>

      <Card className="flex flex-col flex-1 min-h-0">
        <CardHeader className="shrink-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>{isLoading ? "Loading..." : `${total} total users`}</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
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
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={roleFilter || "all"}
                onValueChange={(val) => setFilter("role", val === "all" ? "" : val)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
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
                  title="Failed to load users"
                  description="There was an error loading the users list."
                  action={{ label: "Try again", onClick: () => refetch() }}
                />
              }
              emptyState={
                <EmptyState
                  title="No users found"
                  description={
                    debouncedSearch
                      ? `No users match "${debouncedSearch}"`
                      : "No users have been created yet."
                  }
                />
              }
            />
          </div>

          {!isLoading && totalPages > 0 && (
            <div className="flex items-center justify-between mt-4 shrink-0">
              <p className="text-sm text-muted-foreground">
                Page <span className="font-medium text-foreground">{page}</span> of{" "}
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
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages || isLoading}
                >
                  Next
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
