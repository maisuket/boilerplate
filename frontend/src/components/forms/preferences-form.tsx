"use client";

import { useEffect, useState, useTransition } from "react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Moon, Sun, Monitor, Languages } from "lucide-react";

import { usePathname, useRouter } from "@/components/layout/routing";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export function PreferencesForm() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("preferencesForm");

  useEffect(() => {
    setMounted(true);
  }, []);

  const switchLanguage = (newLocale: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      const query = params.toString() ? `?${params.toString()}` : "";
      router.replace(`${pathname}${query}` as any, { locale: newLocale });
    });
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>{t("theme")}</Label>
          {!mounted ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectTheme")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>{t("light")}</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>{t("dark")}</span>
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span>{t("system")}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
          <p className="text-sm text-muted-foreground">{t("themeDescription")}</p>
        </div>

        <div className="space-y-2">
          <Label>{t("language")}</Label>
          <Select value={locale} onValueChange={switchLanguage} disabled={isPending}>
            <SelectTrigger>
              <SelectValue placeholder={t("selectLanguage")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  <span>English</span>
                </div>
              </SelectItem>
              <SelectItem value="pt">
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  <span>Português</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">{t("languageDescription")}</p>
        </div>
      </div>
    </div>
  );
}
