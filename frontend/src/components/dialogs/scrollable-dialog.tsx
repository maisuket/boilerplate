"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ScrollableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function ScrollableDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className = "sm:max-w-[600px]",
}: ScrollableDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* max-h-[90vh] e flex-col garantem que o modal não ultrapasse a tela */}
      <DialogContent className={`max-h-[90vh] flex flex-col ${className}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* flex-1 overflow-y-auto faz apenas o conteúdo interno rolar, mantendo header/footer fixos */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">{children}</div>

        {footer && (
          <DialogFooter className="mt-2 pt-4 border-t border-border">{footer}</DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
