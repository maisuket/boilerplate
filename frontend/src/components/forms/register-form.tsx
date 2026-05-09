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
import { registerSchema, type RegisterFormData } from "@/schemas/auth.schema";
import { ROUTES } from "@/constants/routes";
import { getErrorMessage } from "@/utils/error";
import { PasswordInput } from "./password-input";
import { generateRandomPassword } from "@/utils/password";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success("Account created!", "Welcome! Your account has been created successfully.");
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      toast.error("Registration failed", getErrorMessage(error));
    }
  };

  const handleGeneratePassword = () => {
    const generated = generateRandomPassword();

    setValue("password", generated, { shouldValidate: true, shouldDirty: true });
    setValue("confirmPassword", generated, { shouldValidate: true, shouldDirty: true });
    setShowPassword(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          autoComplete="name"
          error={!!errors.name}
          disabled={isLoading}
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
          <button
            type="button"
            onClick={handleGeneratePassword}
            className="text-xs text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            tabIndex={-1}
            disabled={isLoading}
          >
            Generate random password
          </button>
        </div>
        <PasswordInput
          id="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={!!errors.password}
          disabled={isLoading}
          showCopy
          passwordValue={password}
          showPassword={showPassword}
          onShowPasswordChange={setShowPassword}
          showStrengthIndicator
          {...register("password")}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <PasswordInput
          id="confirmPassword"
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={!!errors.confirmPassword}
          disabled={isLoading}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" loading={isLoading}>
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        By creating an account, you agree to our{" "}
        <a href="#" className="text-primary hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-primary hover:underline">
          Privacy Policy
        </a>
      </p>
    </form>
  );
}
