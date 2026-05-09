"use client";

import { useState, useCallback } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsSync } from "@/components/ui/tabs-sync";
import { ProfileForm } from "@/components/forms/profile-form";
import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { useLeaveWarning } from "@/hooks/use-leave-warning";
import { UnsavedChangesDialog } from "@/components/dialogs/unsaved-changes-dialog";
import { TermsOfServiceDialog } from "@/components/dialogs/terms-of-service-dialog";

export default function SettingsPage() {
  const [isDirty, setIsDirty] = useState(false);
  const [pendingProceed, setPendingProceed] = useState<(() => void) | null>(null);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

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
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and security preferences.
        </p>
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
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Security
          </TabsTrigger>
          <TabsTrigger
            value="legal"
            className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Legal
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="profile"
          className="space-y-6 focus-visible:outline-none focus-visible:ring-0"
        >
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and how others see you on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm onDirtyChange={setIsDirty} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="security"
          className="space-y-6 focus-visible:outline-none focus-visible:ring-0"
        >
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
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
              <CardTitle>Legal Information</CardTitle>
              <CardDescription>Review the terms and policies of our platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm font-medium">Terms of Service</h3>
                <p className="text-sm text-muted-foreground">
                  Read our terms of service to understand your rights and responsibilities.
                </p>
                <Button
                  variant="outline"
                  className="w-fit mt-2"
                  onClick={() => setIsTermsOpen(true)}
                >
                  View Terms of Service
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
        description="You have unsaved changes in this tab. If you leave now, all your modifications will be permanently lost. Are you sure you want to discard them?"
      />
      <TermsOfServiceDialog open={isTermsOpen} onOpenChange={setIsTermsOpen} />
    </div>
  );
}
