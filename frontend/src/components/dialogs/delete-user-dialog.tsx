"use client";

import { useDeleteUser } from "@/hooks/use-user-mutations";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";

interface DeleteUserDialogProps {
  userId: string | null;
  onClose: () => void;
}

export function DeleteUserDialog({ userId, onClose }: DeleteUserDialogProps) {
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
      title="Are you absolutely sure?"
      description="This action cannot be undone. This will permanently delete the user and remove their data from our servers."
      confirmText="Delete"
      loadingText="Deleting..."
      onConfirm={handleDelete}
      isPending={deleteMutation.isPending}
      variant="destructive"
    />
  );
}
