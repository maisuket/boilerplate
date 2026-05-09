"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";

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
  DialogTrigger,
} from "@/components/ui/dialog";
import { getCreateUserSchema, type CreateUserFormData } from "@/schemas/user.schema";
import { PasswordInput } from "./password-input";
import { useCreateUser } from "@/hooks/use-user-mutations";
import { USER_ROLES } from "@/constants/roles";
import { generateRandomPassword } from "@/utils/password";
import { useModalWarning } from "@/hooks/use-modal-warning";
import { UnsavedChangesDialog } from "@/components/dialogs/unsaved-changes-dialog";
import { useTranslations } from "next-intl";

export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const tValidation = useTranslations("validation");
  const t = useTranslations("addUser");
  const tRoles = useTranslations("roles");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(getCreateUserSchema(tValidation)),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER",
    },
  });

  const password = watch("password");

  const createMutation = useCreateUser({
    onSuccess: () => {
      setOpen(false);
      reset();
    },
  });

  const handleAddUser = (data: CreateUserFormData) => {
    createMutation.mutate({ ...data, role: data.role as any, isActive: true });
  };

  const closeDialog = () => {
    setOpen(false);
    reset();
    setShowPassword(false);
  };

  const { showWarning, setShowWarning, checkWarning, handleConfirmClose } = useModalWarning(
    isDirty,
    closeDialog
  );

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      checkWarning();
    } else {
      setOpen(true);
    }
  };

  const handleGeneratePassword = () => {
    const generated = generateRandomPassword();

    setValue("password", generated, { shouldValidate: true, shouldDirty: true });
    setShowPassword(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Plus className="mr-2 h-4 w-4" />
            {t("trigger")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={handleSubmit(handleAddUser)}>
            <DialogHeader>
              <DialogTitle>{t("title")}</DialogTitle>
              <DialogDescription>{t("description")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("name")}</Label>
                <Input
                  id="name"
                  placeholder={t("namePlaceholder")}
                  error={!!errors.name}
                  disabled={createMutation.isPending}
                  {...register("name")}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  error={!!errors.email}
                  disabled={createMutation.isPending}
                  {...register("email")}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("password")}</Label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-xs text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    tabIndex={-1}
                    disabled={createMutation.isPending}
                  >
                    {t("generateRandom")}
                  </button>
                </div>
                <PasswordInput
                  id="password"
                  placeholder={t("passwordPlaceholder")}
                  error={!!errors.password}
                  disabled={createMutation.isPending}
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
                <Label htmlFor="role">{t("role")}</Label>
                <select
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={createMutation.isPending}
                  {...register("role")}
                >
                  {USER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {tRoles(role as any)}
                    </option>
                  ))}
                </select>
                {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={createMutation.isPending}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {createMutation.isPending ? t("creating") : t("submit")}
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
