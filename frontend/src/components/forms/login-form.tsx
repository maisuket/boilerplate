"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";
import { ROUTES } from "@/constants/routes";
import { getErrorMessage } from "@/utils/error";
import { PasswordInput } from "./password-input";

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!", "You have been signed in successfully.");
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      toast.error("Sign in failed", getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={!!errors.email}
          disabled={isLoading}
          {...register("email")}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <button type="button" className="text-xs text-primary hover:underline" tabIndex={-1}>
            Forgot password?
          </button>
        </div>
        <PasswordInput
          id="password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={!!errors.password}
          disabled={isLoading}
          {...register("password")}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
