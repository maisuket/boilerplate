"use client";

import { MoreHorizontal, Edit2, Trash2, Key, ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@/components/ui/data-table";
import type { User } from "@/types/user.types";

interface ColumnSort {
  getFilter: (key: string) => string;
  toggleSort: (column: string) => void;
}

interface ColumnActions {
  onEdit: (user: User) => void;
  onResetPassword: (user: User) => void;
  onDelete: (user: User) => void;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const renderSortableHeader = (label: string, column: string, sort: ColumnSort) => {
  const isActive = sort.getFilter("sortBy") === column;
  const currentOrder = sort.getFilter("sortOrder");

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[active=true]:text-foreground"
      data-active={isActive}
      onClick={() => sort.toggleSort(column)}
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

export const getColumns = (
  t: any,
  format: any,
  sort: ColumnSort,
  actions: ColumnActions
): ColumnDef<User>[] => [
  {
    header: renderSortableHeader(t("name"), "name", sort),
    cell: (user) => {
      return (
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
      );
    },
  },
  {
    header: renderSortableHeader(t("role"), "role", sort),
    cell: (user) => {
      return (
        <Badge variant={user.role?.toUpperCase() === "ADMIN" ? "default" : "secondary"}>
          {user.role}
        </Badge>
      );
    },
  },
  {
    header: renderSortableHeader(t("status"), "isActive", sort),
    cell: (user) => {
      return (
        <Badge variant={user.isActive ? "success" : "destructive"}>
          {user.isActive ? t("active") : t("inactive")}
        </Badge>
      );
    },
  },
  {
    header: renderSortableHeader(t("joined"), "createdAt", sort),
    cellClassName: "text-muted-foreground",
    cell: (user) =>
      format.dateTime(new Date(user.createdAt), {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
  {
    header: t("actions"),
    headerClassName: "text-right",
    cellClassName: "text-right",
    cell: (user) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer" onClick={() => actions.onEdit(user)}>
              <Edit2 className="mr-2 h-4 w-4" />
              <span>{t("edit")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => actions.onResetPassword(user)}
            >
              <Key className="mr-2 h-4 w-4" />
              <span>{t("resetPassword")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={() => actions.onDelete(user)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>{t("delete")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
