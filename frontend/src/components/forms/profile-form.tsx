"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { profileSchema, type ProfileFormData } from "@/schemas/user.schema";
import { usersService } from "@/services/users.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { getErrorMessage } from "@/utils/error";

export function ProfileForm() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      avatar: user?.avatar ?? "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        avatar: user.avatar ?? "",
      });
    }
  }, [user, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormData) => usersService.updateUser(user!.id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me() });
      await refreshUser();
      toast.success("Profile updated", "Your profile has been saved successfully.");
    },
    onError: (error) => {
      toast.error("Update failed", getErrorMessage(error));
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateMutation.mutate(data);
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user?.avatar ?? undefined} alt={user?.name} />
          <AvatarFallback className="text-xl">{getInitials(user?.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <button type="button" className="mt-2 text-xs text-primary hover:underline">
            Change avatar
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            error={!!errors.name}
            disabled={updateMutation.isPending}
            {...register("name")}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            error={!!errors.email}
            disabled={updateMutation.isPending}
            {...register("email")}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="avatar">Avatar URL</Label>
          <Input
            id="avatar"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            error={!!errors.avatar}
            disabled={updateMutation.isPending}
            {...register("avatar")}
          />
          {errors.avatar && <p className="text-sm text-destructive">{errors.avatar.message}</p>}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={updateMutation.isPending} disabled={!isDirty}>
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={!isDirty || updateMutation.isPending}
        >
          Discard
        </Button>
      </div>
    </form>
  );
}
