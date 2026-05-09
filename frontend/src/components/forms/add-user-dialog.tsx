"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";
import { usersService } from "@/services/users.service";
import { createUserSchema, type CreateUserFormData } from "@/schemas/user.schema";
import { getErrorMessage } from "@/utils/error";
import { PasswordStrengthIndicator } from "./password-strength-indicator";
import { PasswordInput } from "./password-input";

interface AddUserDialogProps {
  onSuccess?: () => void;
}

export function AddUserDialog({ onSuccess }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER",
    },
  });

  const password = watch("password");

  const createMutation = useMutation({
    mutationFn: usersService.createUser,
    onSuccess: () => {
      toast.success("User created", "The user has been successfully created.");
      setOpen(false);
      reset();
      onSuccess?.(); // Chama a função para recarregar a tabela passada pela prop
    },
    onError: (error) => {
      toast.error("Error", getErrorMessage(error));
    },
  });

  const handleAddUser = (data: CreateUserFormData) => {
    createMutation.mutate({ ...data, isActive: true });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
      setShowPassword(false);
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
    setShowPassword(true);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(handleAddUser)}>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. They will be able to log in immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                error={!!errors.name}
                disabled={createMutation.isPending}
                {...register("name")}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                error={!!errors.email}
                disabled={createMutation.isPending}
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
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
                id="password"
                placeholder="••••••••"
                error={!!errors.password}
                disabled={createMutation.isPending}
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
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={createMutation.isPending}
                {...register("role")}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="MODERATOR">Moderator</option>
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
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {createMutation.isPending ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
