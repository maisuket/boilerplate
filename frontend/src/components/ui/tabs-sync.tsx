"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/components/layout/routing";
import { Tabs } from "@/components/ui/tabs";

interface TabsSyncProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Tabs>,
  "value" | "onValueChange"
> {
  defaultValue: string;
  queryKey?: string;
  onTabChangeIntercept?: (value: string, proceed: () => void) => void;
}

export function TabsSync({
  defaultValue,
  queryKey = "tab",
  onTabChangeIntercept,
  children,
  ...props
}: TabsSyncProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get(queryKey) || defaultValue;

  const handleTabChange = (value: string) => {
    const proceed = () => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(queryKey, value);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    if (onTabChangeIntercept) {
      onTabChangeIntercept(value, proceed);
    } else {
      proceed();
    }
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} {...props}>
      {children}
    </Tabs>
  );
}
