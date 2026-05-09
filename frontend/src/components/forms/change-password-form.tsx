"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { changePasswordSchema, type ChangePasswordFormData } from "@/schemas/auth.schema";
import { PasswordInput } from "./password-input";
import { getErrorMessage } from "@/utils/error";
import { usersService } from "@/services/users.service";
import { generateRandomPassword } from "@/utils/password";

export function ChangePasswordForm() {
  const toast = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const newPasswordValue = watch("newPassword");

  const passwordMutation = useMutation({
    mutationFn: (data: ChangePasswordFormData) => usersService.changePassword(data),
    onSuccess: () => {
      toast.success("Password updated", "Your password has been changed successfully.");
      reset();
    },
    onError: (error) => {
      toast.error("Error", getErrorMessage(error));
    },
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    passwordMutation.mutate(data);
  };

  const handleGeneratePassword = () => {
    const generated = generateRandomPassword();

    setValue("newPassword", generated, { shouldValidate: true, shouldDirty: true });
    setValue("confirmNewPassword", generated, { shouldValidate: true, shouldDirty: true });
    setShowNewPassword(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <PasswordInput
          id="currentPassword"
          placeholder="Enter current password"
          error={!!errors.currentPassword}
          disabled={passwordMutation.isPending}
          showPassword={showCurrentPassword}
          onShowPasswordChange={setShowCurrentPassword}
          {...register("currentPassword")}
        />
        {errors.currentPassword && (
          <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="newPassword">New Password</Label>
          <button
            type="button"
            onClick={handleGeneratePassword}
            className="text-xs text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            tabIndex={-1}
            disabled={passwordMutation.isPending}
          >
            Generate random password
          </button>
        </div>
        <PasswordInput
          id="newPassword"
          placeholder="Create a new password"
          error={!!errors.newPassword}
          disabled={passwordMutation.isPending}
          showCopy
          passwordValue={newPasswordValue}
          showPassword={showNewPassword}
          onShowPasswordChange={setShowNewPassword}
          showStrengthIndicator
          {...register("newPassword")}
        />
        {errors.newPassword && (
          <p className="text-sm text-destructive">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
        <PasswordInput
          id="confirmNewPassword"
          placeholder="Confirm your new password"
          error={!!errors.confirmNewPassword}
          disabled={passwordMutation.isPending}
          showPassword={showConfirmPassword}
          onShowPasswordChange={setShowConfirmPassword}
          {...register("confirmNewPassword")}
        />
        {errors.confirmNewPassword && (
          <p className="text-sm text-destructive">{errors.confirmNewPassword.message}</p>
        )}
      </div>

      <Button type="submit" loading={passwordMutation.isPending} disabled={!isDirty}>
        {passwordMutation.isPending ? "Updating password..." : "Update Password"}
      </Button>
    </form>
  );
}
