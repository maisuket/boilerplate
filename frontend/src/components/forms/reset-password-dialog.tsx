"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { User } from "@/types/user.types";
import { PasswordInput } from "./password-input";
import { useUpdateUser } from "@/hooks/use-user-mutations";
import { generateRandomPassword } from "@/utils/password";
import { useModalWarning } from "@/hooks/use-modal-warning";
import { UnsavedChangesDialog } from "@/components/dialogs/unsaved-changes-dialog";
import { useTranslations } from "next-intl";

const getResetPasswordSchema = (t: any) =>
  z
    .object({
      password: z
        .string()
        .min(8, t("passwordMinLength"))
        .regex(/[A-Z]/, t("passwordUppercase"))
        .regex(/[0-9]/, t("passwordNumber"))
        .regex(/[^A-Za-z0-9]/, t("passwordSpecial")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsMismatch"),
      path: ["confirmPassword"],
    });

type ResetPasswordFormData = z.infer<ReturnType<typeof getResetPasswordSchema>>;

interface ResetPasswordDialogProps {
  user: User | null;
  onClose: () => void;
}

export function ResetPasswordDialog({ user, onClose }: ResetPasswordDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const t = useTranslations("validation");
  const resetPasswordSchema = getResetPasswordSchema(t);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const resetMutation = useUpdateUser({
    successMessage: {
      title: "Password reset",
      description: "The user's password has been successfully updated.",
    },
    onSuccess: () => {
      reset();
      onClose();
    },
  });

  const handleResetPassword = (data: ResetPasswordFormData) => {
    resetMutation.mutate({ id: user!.id, data: { password: data.password } });
  };

  const closeDialog = () => {
    reset();
    setShowPassword(false);
    onClose();
  };

  const { showWarning, setShowWarning, checkWarning, handleConfirmClose } = useModalWarning(
    isDirty,
    closeDialog
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      checkWarning();
    }
  };

  const handleGeneratePassword = () => {
    const generated = generateRandomPassword();

    setValue("password", generated, { shouldValidate: true, shouldDirty: true });
    setValue("confirmPassword", generated, { shouldValidate: true, shouldDirty: true });
    setShowPassword(true); // Mostra a senha em texto limpo
  };

  return (
    <>
      <Dialog open={!!user} onOpenChange={handleOpenChange}>
        <DialogContent>
          <form onSubmit={handleSubmit(handleResetPassword)}>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Set a new password for <strong>{user?.name}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="new-password">New Password</Label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-xs text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    tabIndex={-1}
                    disabled={resetMutation.isPending}
                  >
                    Generate random password
                  </button>
                </div>
                <PasswordInput
                  id="new-password"
                  placeholder="••••••••"
                  error={!!errors.password}
                  disabled={resetMutation.isPending}
                  showCopy
                  passwordValue={password}
                  showPassword={showPassword}
                  onShowPasswordChange={setShowPassword}
                  showStrengthIndicator
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <PasswordInput
                  id="confirm-password"
                  placeholder="••••••••"
                  error={!!errors.confirmPassword}
                  disabled={resetMutation.isPending}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={resetMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" loading={resetMutation.isPending} disabled={!isDirty}>
                {resetMutation.isPending ? "Saving..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        open={showWarning}
        onOpenChange={setShowWarning}
        onConfirm={handleConfirmClose}
      />
    </>
  );
}
