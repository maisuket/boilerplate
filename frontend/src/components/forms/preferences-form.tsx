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
  const [colorTheme, setColorTheme] = useState("zinc");
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("preferencesForm");

  useEffect(() => {
    setMounted(true);

    // Carrega a paleta salva anteriormente
    const savedColor = localStorage.getItem("color-theme") || "zinc";
    setColorTheme(savedColor);
    document.documentElement.setAttribute("data-theme", savedColor);
  }, []);

  const handleColorChange = (value: string) => {
    setColorTheme(value);
    localStorage.setItem("color-theme", value);
    document.documentElement.setAttribute("data-theme", value);
  };

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
          <Label>{t("colorPalette")}</Label>
          {!mounted ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={colorTheme} onValueChange={handleColorChange}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectColorPalette")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zinc">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-zinc-500" />
                    <span>{t("palettes.zinc")}</span>
                  </div>
                </SelectItem>
                <SelectItem value="rose">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-rose-500" />
                    <span>{t("palettes.rose")}</span>
                  </div>
                </SelectItem>
                <SelectItem value="blue">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-blue-500" />
                    <span>{t("palettes.blue")}</span>
                  </div>
                </SelectItem>
                <SelectItem value="green">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-green-500" />
                    <span>{t("palettes.green")}</span>
                  </div>
                </SelectItem>
                <SelectItem value="orange">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-orange-500" />
                    <span>{t("palettes.orange")}</span>
                  </div>
                </SelectItem>
                <SelectItem value="purple">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-purple-500" />
                    <span>{t("palettes.purple")}</span>
                  </div>
                </SelectItem>
                <SelectItem value="yellow">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-yellow-500" />
                    <span>{t("palettes.yellow")}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
          <p className="text-sm text-muted-foreground">{t("paletteDescription")}</p>
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
