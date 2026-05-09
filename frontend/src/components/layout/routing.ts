import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "pt"],
  defaultLocale: "en",
});

// Exporte as versões traduzidas dos hooks do Next.js
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
