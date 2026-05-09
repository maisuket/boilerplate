"use client";

import { useState, useCallback } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsSync } from "@/components/ui/tabs-sync";
import { ProfileForm } from "@/components/forms/profile-form";
import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { PreferencesForm } from "@/components/forms/preferences-form";
import { useLeaveWarning } from "@/hooks/use-leave-warning";
import { UnsavedChangesDialog } from "@/components/dialogs/unsaved-changes-dialog";
import { TermsOfServiceDialog } from "@/components/dialogs/terms-of-service-dialog";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const [isDirty, setIsDirty] = useState(false);
  const [pendingProceed, setPendingProceed] = useState<(() => void) | null>(null);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const t = useTranslations("settingsPage");

  // Evita fechamento da página ou botão de 'voltar' do navegador se tiver alterações não salvas
  useLeaveWarning(isDirty, (proceed) => setPendingProceed(() => proceed));

  const handleTabIntercept = useCallback(
    (value: string, proceed: () => void) => {
      if (isDirty) {
        setPendingProceed(() => proceed);
      } else {
        proceed();
      }
    },
    [isDirty]
  );

  const confirmTabChange = () => {
    if (pendingProceed) {
      setIsDirty(false); // Reseta para evitar loops, já que o conteúdo será desmontado
      pendingProceed();
      setPendingProceed(null);
    }
  };

  return (
    <div className="flex flex-col space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <TabsSync
        defaultValue="profile"
        className="space-y-6"
        onTabChangeIntercept={handleTabIntercept}
      >
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="profile"
            className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            {t("tabs.profile")}
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            {t("tabs.preferences")}
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            {t("tabs.security")}
          </TabsTrigger>
          <TabsTrigger
            value="legal"
            className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            {t("tabs.legal")}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="profile"
          className="space-y-6 focus-visible:outline-none focus-visible:ring-0"
        >
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.title")}</CardTitle>
              <CardDescription>{t("profile.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm onDirtyChange={setIsDirty} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="preferences"
          className="space-y-6 focus-visible:outline-none focus-visible:ring-0"
        >
          <Card>
            <CardHeader>
              <CardTitle>{t("preferences.title")}</CardTitle>
              <CardDescription>{t("preferences.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <PreferencesForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="security"
          className="space-y-6 focus-visible:outline-none focus-visible:ring-0"
        >
          <Card>
            <CardHeader>
              <CardTitle>{t("security.title")}</CardTitle>
              <CardDescription>{t("security.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm onDirtyChange={setIsDirty} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="legal"
          className="space-y-6 focus-visible:outline-none focus-visible:ring-0"
        >
          <Card>
            <CardHeader>
              <CardTitle>{t("legal.title")}</CardTitle>
              <CardDescription>{t("legal.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm font-medium">{t("legal.termsTitle")}</h3>
                <p className="text-sm text-muted-foreground">{t("legal.termsDescription")}</p>
                <Button
                  variant="outline"
                  className="w-fit mt-2"
                  onClick={() => setIsTermsOpen(true)}
                >
                  {t("legal.viewTerms")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </TabsSync>

      <UnsavedChangesDialog
        open={!!pendingProceed}
        onOpenChange={(open) => !open && setPendingProceed(null)}
        onConfirm={confirmTabChange}
        description={t("unsavedChanges")}
      />
      <TermsOfServiceDialog open={isTermsOpen} onOpenChange={setIsTermsOpen} />
    </div>
  );
}
