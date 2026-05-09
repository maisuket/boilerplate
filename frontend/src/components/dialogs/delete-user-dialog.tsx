"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";
import { usersService } from "@/services/users.service";
import { getErrorMessage } from "@/utils/error";

interface DeleteUserDialogProps {
  userId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteUserDialog({ userId, onClose, onSuccess }: DeleteUserDialogProps) {
  const toast = useToast();

  const deleteMutation = useMutation({
    mutationFn: usersService.deleteUser,
    onSuccess: () => {
      toast.success("User deleted", "The user has been successfully removed.");
      onSuccess?.(); // Atualiza a tabela
      onClose(); // Fecha o modal
    },
    onError: (error) => {
      toast.error("Error", getErrorMessage(error));
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
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
