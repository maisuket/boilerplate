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
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export function SettingsClient() {
  const [isDirty, setIsDirty] = useState(false);
  const [pendingProceed, setPendingProceed] = useState<(() => void) | null>(null);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const t = useTranslations("settingsPage");
  const { isLoading } = useAuth();

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

      {isLoading ? (
        <div className="space-y-6">
          <div className="flex w-full border-b pb-[1px] mb-4 gap-4">
            <Skeleton className="h-8 w-20 rounded-none" />
            <Skeleton className="h-8 w-24 rounded-none" />
            <Skeleton className="h-8 w-20 rounded-none" />
            <Skeleton className="h-8 w-16 rounded-none" />
          </div>
          <Card>
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-2/4" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Skeleton className="h-20 w-20 rounded-full shrink-0" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-24 mt-2" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-24" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
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
      )}

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
