"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";

interface TabsSyncProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Tabs>,
  "value" | "onValueChange"
> {
  defaultValue: string;
  queryKey?: string;
}

export function TabsSync({ defaultValue, queryKey = "tab", children, ...props }: TabsSyncProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get(queryKey) || defaultValue;

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(queryKey, value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} {...props}>
      {children}
    </Tabs>
  );
}
