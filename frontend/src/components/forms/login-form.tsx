"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
  const [isRedirecting, setIsRedirecting] = useState(false);
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
      setIsRedirecting(true);
      setTimeout(() => {
        router.push(ROUTES.DASHBOARD);
      }, 500); // Aguarda a animação de fade-out terminar
    } catch (error) {
      toast.error("Sign in failed", getErrorMessage(error));
    }
  };

  const isSubmitting = isLoading || isRedirecting;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-4 transition-all duration-500 ease-in-out ${isRedirecting ? "opacity-0 translate-y-2 pointer-events-none" : "opacity-100 translate-y-0"}`}
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={!!errors.email}
          disabled={isSubmitting}
          {...register("email")}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <button
            type="button"
            className="text-xs text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            tabIndex={-1}
            disabled={isSubmitting}
          >
            Forgot password?
          </button>
        </div>
        <PasswordInput
          id="password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={!!errors.password}
          disabled={isSubmitting}
          {...register("password")}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <Button
        type="submit"
        className={`w-full transition-all duration-300 ${isSubmitting ? "bg-blue-600 text-white disabled:opacity-90 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-700" : ""}`}
        loading={isSubmitting}
      >
        {isRedirecting ? "Redirecting..." : isLoading ? "Authenticating securely..." : "Sign In"}
      </Button>
    </form>
  );
}
