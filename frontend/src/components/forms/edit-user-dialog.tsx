"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { getUpdateUserSchema, type UpdateUserFormData } from "@/schemas/user.schema";
import type { User } from "@/types/user.types";
import { useUpdateUser } from "@/hooks/use-user-mutations";
import { USER_ROLES } from "@/constants/roles";
import { useModalWarning } from "@/hooks/use-modal-warning";
import { UnsavedChangesDialog } from "@/components/dialogs/unsaved-changes-dialog";
import { useTranslations } from "next-intl";

interface EditUserDialogProps {
  user: User | null;
  onClose: () => void;
}

export function EditUserDialog({ user, onClose }: EditUserDialogProps) {
  const tValidation = useTranslations("validation");
  const t = useTranslations("editUser");
  const tRoles = useTranslations("roles");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(getUpdateUserSchema(tValidation)),
    defaultValues: {
      name: "",
      email: "",
      role: "USER",
      isActive: true,
    },
  });

  // Atualiza os dados do formulário quando o usuário for selecionado
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      });
    }
  }, [user, reset]);

  const updateMutation = useUpdateUser({
    onSuccess: () => {
      onClose();
    },
  });

  const handleEditUser = (data: UpdateUserFormData) => {
    updateMutation.mutate({ id: user!.id, data: { ...data, role: data.role as any } });
  };

  const closeDialog = () => {
    reset();
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

  return (
    <>
      <Dialog open={!!user} onOpenChange={handleOpenChange}>
        <DialogContent>
          <form onSubmit={handleSubmit(handleEditUser)}>
            <DialogHeader>
              <DialogTitle>{t("title")}</DialogTitle>
              <DialogDescription>{t("description")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">{t("name")}</Label>
                <Input
                  id="edit-name"
                  placeholder={t("namePlaceholder")}
                  error={!!errors.name}
                  disabled={updateMutation.isPending}
                  {...register("name")}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">{t("email")}</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  error={!!errors.email}
                  disabled={updateMutation.isPending}
                  {...register("email")}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">{t("role")}</Label>
                <select
                  id="edit-role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={updateMutation.isPending}
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
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  disabled={updateMutation.isPending}
                  {...register("isActive")}
                />
                <Label htmlFor="edit-isActive">{t("activeAccount")}</Label>
                {errors.isActive && (
                  <p className="text-sm text-destructive">{errors.isActive.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" loading={updateMutation.isPending} disabled={!isDirty}>
                {updateMutation.isPending ? t("saving") : t("submit")}
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
