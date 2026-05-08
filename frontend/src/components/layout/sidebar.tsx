"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { ScrollArea } from "../ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onToggleCollapse: () => void;
}

const mainNavItems = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Projetos", href: "/projects", icon: Package },
  { label: "Financeiro", href: "/financial", icon: ShoppingCart },
  { label: "Equipe", href: ROUTES.USERS, icon: Users },
];

const otherNavItems = [{ label: "Settings", href: "/settings", icon: Settings }];

export function Sidebar({ collapsed, mobileOpen, onMobileClose, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo Area */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border px-4 shrink-0",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed && (
          <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
              <span className="font-bold text-white">V</span>
            </div>
            <span className="text-xl font-bold tracking-tight">ZendaTracker</span>
          </Link>
        )}
        {collapsed && (
          <Link href={ROUTES.DASHBOARD}>
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
              <span className="font-bold text-white">V</span>
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="hidden lg:flex h-8 w-8 shrink-0 text-gray-400 hover:bg-white/10 hover:text-white"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Main Menu */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-6">
          <div>
            {!collapsed && (
              <h3 className="text-xs font-semibold text-emerald-400/60 uppercase tracking-wider mb-3 px-2">
                Main Menu
              </h3>
            )}
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-gray-400 hover:text-white hover:bg-white/5",
                      collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={20} className="shrink-0" />
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Other Menu */}
          <div>
            {!collapsed && (
              <h3 className="text-xs font-semibold text-emerald-400/60 uppercase tracking-wider mb-3 px-2">
                Other
              </h3>
            )}
            <nav className="space-y-1">
              {otherNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-gray-400 hover:text-white hover:bg-white/5",
                      collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={20} className="shrink-0" />
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </ScrollArea>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div
          onClick={() => logout()}
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {getInitials(user?.name)}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || "Tech Lead"}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email || "admin@erp.com"}</p>
              </div>
              <LogOut size={16} className="text-gray-400 shrink-0" />
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out border-r border-sidebar-border bg-sidebar",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onMobileClose} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col lg:hidden transition-transform duration-300 ease-in-out bg-sidebar",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileClose}
          className="absolute right-3 top-3 z-10 h-8 w-8 text-gray-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
        {sidebarContent}
      </aside>
    </>
  );
}
