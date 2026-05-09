"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";
import { usersService } from "@/services/users.service";
import type { User } from "@/types/user.types";
import { getErrorMessage } from "@/utils/error";
import { PasswordStrengthIndicator } from "./password-strength-indicator";
import { PasswordInput } from "./password-input";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordDialogProps {
  user: User | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ResetPasswordDialog({ user, onClose, onSuccess }: ResetPasswordDialogProps) {
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);

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

  const resetMutation = useMutation({
    // Nota: Estamos usando o updateUser, assumindo que a sua API de PATCH permite atualizar a senha.
    // Caso o backend possua uma rota separada (ex: resetPassword), você deve atualizar aqui.
    mutationFn: (data: ResetPasswordFormData) =>
      usersService.updateUser(user!.id, { password: data.password } as any),
    onSuccess: () => {
      toast.success("Password reset", "The user's password has been successfully updated.");
      reset();
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Error", getErrorMessage(error));
    },
  });

  const handleResetPassword = (data: ResetPasswordFormData) => {
    resetMutation.mutate(data);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      setShowPassword(false);
      onClose();
    }
  };

  const handleGeneratePassword = () => {
    const length = 12;
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specials = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    let generated = "";
    generated += uppercase[Math.floor(Math.random() * uppercase.length)];
    generated += lowercase[Math.floor(Math.random() * lowercase.length)];
    generated += numbers[Math.floor(Math.random() * numbers.length)];
    generated += specials[Math.floor(Math.random() * specials.length)];

    const allChars = uppercase + lowercase + numbers + specials;
    for (let i = generated.length; i < length; i++) {
      generated += allChars[Math.floor(Math.random() * allChars.length)];
    }

    generated = generated
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");

    setValue("password", generated, { shouldValidate: true, shouldDirty: true });
    setValue("confirmPassword", generated, { shouldValidate: true, shouldDirty: true });
    setShowPassword(true); // Mostra a senha em texto limpo
  };

  return (
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
                  className="text-xs text-primary hover:underline"
                  tabIndex={-1}
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
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
              <div className="pt-2">
                <PasswordStrengthIndicator password={password} />
              </div>
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
              onClick={onClose}
              disabled={resetMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={resetMutation.isPending || !isDirty}>
              {resetMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {resetMutation.isPending ? "Saving..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
