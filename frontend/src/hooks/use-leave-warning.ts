"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/components/layout/routing";

export function useLeaveWarning(isDirty: boolean, onIntercept?: (proceed: () => void) => void) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("dialogs.unsavedChanges");

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!isDirty) return;

      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor || !anchor.href) return;

      // Ignora cliques que abrem em nova aba (ctrl+click, target="_blank")
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || anchor.target === "_blank") return;

      try {
        const url = new URL(anchor.href);
        const currentUrl = new URL(window.location.href);

        // Verifica se é uma rota interna e diferente da atual
        if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
          e.preventDefault();
          e.stopPropagation(); // Impede o Next.js <Link> de navegar

          // Remove o prefixo do idioma da URL para usar o router do next-intl corretamente
          let targetPath = url.pathname;
          const localePrefix = `/${locale}`;
          if (targetPath.startsWith(`${localePrefix}/`) || targetPath === localePrefix) {
            targetPath = targetPath.slice(localePrefix.length) || "/";
          }

          const proceed = () => router.push((targetPath + url.search + url.hash) as any);

          if (onIntercept) onIntercept(proceed);
          else if (window.confirm(t("description"))) proceed();
        }
      } catch (err) {
        // Ignora links inválidos
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    // Intercepta o clique na fase de captura (antes do Next.js Link agir)
    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, [isDirty, onIntercept, router, locale, t]);
}
