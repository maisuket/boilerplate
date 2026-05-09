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
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
        {/* Logo Area */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-sidebar-border px-4 shrink-0 overflow-hidden transition-all duration-300",
            collapsed ? "justify-center gap-2" : "justify-between"
          )}
        >
          <Link href={ROUTES.DASHBOARD} className="flex items-center overflow-hidden">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
              <span className="font-bold text-white">{collapsed ? "V" : "Z"}</span>
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                  animate={{ width: "auto", opacity: 1, marginLeft: 8 }}
                  exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl font-bold tracking-tight whitespace-nowrap"
                >
                  ota
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
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
              <AnimatePresence>
                {!collapsed && (
                  <motion.h3
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="text-xs font-semibold text-emerald-400/60 uppercase tracking-wider px-2 whitespace-nowrap overflow-hidden"
                  >
                    Main Menu
                  </motion.h3>
                )}
              </AnimatePresence>
              <nav className="space-y-1">
                {mainNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  const link = (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-2.5 rounded-lg transition-colors overflow-hidden",
                        isActive
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "text-gray-400 hover:text-white hover:bg-white/5",
                        collapsed ? "justify-center px-2" : ""
                      )}
                    >
                      <Icon size={20} className="shrink-0" />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                            animate={{ opacity: 1, width: "auto", marginLeft: 12 }}
                            exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                            className="font-medium whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  );

                  return collapsed ? (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right" sideOffset={15}>
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div key={item.href}>{link}</div>
                  );
                })}
              </nav>
            </div>

            {/* Other Menu */}
            <div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.h3
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="text-xs font-semibold text-emerald-400/60 uppercase tracking-wider px-2 whitespace-nowrap overflow-hidden"
                  >
                    Other
                  </motion.h3>
                )}
              </AnimatePresence>
              <nav className="space-y-1">
                {otherNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  const link = (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-2.5 rounded-lg transition-colors overflow-hidden",
                        isActive
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "text-gray-400 hover:text-white hover:bg-white/5",
                        collapsed ? "justify-center px-2" : ""
                      )}
                    >
                      <Icon size={20} className="shrink-0" />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                            animate={{ opacity: 1, width: "auto", marginLeft: 12 }}
                            exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                            className="font-medium whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  );

                  return collapsed ? (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right" sideOffset={15}>
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div key={item.href}>{link}</div>
                  );
                })}
              </nav>
            </div>
          </div>
        </ScrollArea>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-sidebar-border overflow-hidden">
          {(() => {
            const profileContent = (
              <div
                onClick={() => logout()}
                className={cn(
                  "flex items-center p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors overflow-hidden",
                  collapsed ? "justify-center" : ""
                )}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {getInitials(user?.name)}
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                      animate={{ opacity: 1, width: "auto", marginLeft: 12 }}
                      exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                      className="flex-1 flex items-center min-w-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user?.name || "Tech Lead"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user?.email || "admin@erp.com"}
                        </p>
                      </div>
                      <LogOut size={16} className="text-gray-400 shrink-0 ml-3" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );

            return collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>{profileContent}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={15}>
                  Logout
                </TooltipContent>
              </Tooltip>
            ) : (
              profileContent
            );
          })()}
        </div>
      </div>
    </TooltipProvider>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex flex-col h-full shrink-0 border-r border-sidebar-border bg-sidebar overflow-hidden"
      >
        {sidebarContent}
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Mobile overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={onMobileClose}
            />

            {/* Mobile sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col lg:hidden bg-sidebar"
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
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
