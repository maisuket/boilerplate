"use client";

import { usePathname } from "next/navigation";

export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className="flex flex-1 flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
    >
      {children}
    </div>
  );
}
