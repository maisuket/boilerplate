"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Languages } from "lucide-react";

import { usePathname, useRouter } from "@/components/layout/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("header");

  const switchLanguage = (newLocale: string) => {
    startTransition(() => {
      // Reconstrói a URL preservando possíveis query params (ex: ?tab=legal ou ?page=2)
      const params = new URLSearchParams(searchParams.toString());
      const query = params.toString() ? `?${params.toString()}` : "";

      router.replace(`${pathname}${query}` as any, { locale: newLocale });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md" disabled={isPending}>
          <Languages className="h-5 w-5" />
          <span className="sr-only">{t("toggleLanguage")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => switchLanguage("en")}
          className={locale === "en" ? "bg-muted font-medium" : ""}
          disabled={isPending}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => switchLanguage("pt")}
          className={locale === "pt" ? "bg-muted font-medium" : ""}
          disabled={isPending}
        >
          Português
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
