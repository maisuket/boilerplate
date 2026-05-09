"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteUser } from "@/hooks/use-user-mutations";

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
    <AlertDialog open={!!userId} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user and remove their
            data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            loading={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
