"use client";

import { toast } from "sonner";

interface ToastOptions {
  duration?: number;
  id?: string;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Wrapper around Sonner toast for consistent usage across the app
 */
export function useToast() {
  return {
    success(title: string, description?: string, options?: ToastOptions) {
      return toast.success(title, {
        description,
        ...options,
      });
    },

    error(title: string, description?: string, options?: ToastOptions) {
      return toast.error(title, {
        description,
        ...options,
      });
    },

    warning(title: string, description?: string, options?: ToastOptions) {
      return toast.warning(title, {
        description,
        ...options,
      });
    },

    info(title: string, description?: string, options?: ToastOptions) {
      return toast.info(title, {
        description,
        ...options,
      });
    },

    message(title: string, description?: string, options?: ToastOptions) {
      return toast(title, {
        description,
        ...options,
      });
    },

    loading(title: string, description?: string) {
      return toast.loading(title, { description });
    },

    promise<T>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: unknown) => string);
      }
    ) {
      return toast.promise(promise, messages);
    },

    dismiss(id?: string | number) {
      toast.dismiss(id);
    },
  };
}
