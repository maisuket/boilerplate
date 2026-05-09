"use client";

import { useDeleteUser } from "@/hooks/use-user-mutations";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { useTranslations } from "next-intl";

interface DeleteUserDialogProps {
  userId: string | null;
  onClose: () => void;
}

export function DeleteUserDialog({ userId, onClose }: DeleteUserDialogProps) {
  const t = useTranslations("dialogs.deleteUser");

  const deleteMutation = useDeleteUser({
    onSuccess: () => {
      onClose();
    },
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault(); // Impede o fechamento imediato para mostrar o loading
    if (userId) {
      deleteMutation.mutate(userId);
    }
  };

  return (
    <ConfirmDialog
      open={!!userId}
      onOpenChange={(open) => !open && onClose()}
      title={t("title")}
      description={t("description")}
      confirmText={t("confirm")}
      loadingText={t("loading")}
      onConfirm={handleDelete}
      isPending={deleteMutation.isPending}
      variant="destructive"
    />
  );
}
