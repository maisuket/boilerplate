"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TermsOfServiceDialog } from "@/components/dialogs/terms-of-service-dialog";
// Exemplo usando next-intl. Adapte a importação para a biblioteca i18n do seu projeto:
import { useTranslations } from "next-intl";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const t = useTranslations("cookieConsent"); // Namespace para as chaves deste componente

  // Verifica no lado do cliente se o usuário já aceitou os cookies
  useEffect(() => {
    const hasConsented = localStorage.getItem("cookieConsent");
    if (!hasConsented) {
      // Um pequeno delay para não ser tão agressivo assim que a página carrega
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm sm:left-auto sm:right-8 sm:max-w-md"
          >
            <div className="flex flex-col gap-4 rounded-lg border bg-background p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Cookie className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1 text-sm">
                  <h3 className="font-semibold leading-none tracking-tight">{t("title")}</h3>
                  <p className="text-muted-foreground">{t("description")}</p>
                </div>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="ghost"
                  className="w-full sm:w-auto"
                  onClick={() => setIsTermsOpen(true)}
                >
                  {t("readTerms")}
                </Button>
                <Button className="w-full sm:w-auto" onClick={handleAccept}>
                  {t("accept")}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reaproveitando o modal criado anteriormente */}
      <TermsOfServiceDialog open={isTermsOpen} onOpenChange={setIsTermsOpen} />
    </>
  );
}
