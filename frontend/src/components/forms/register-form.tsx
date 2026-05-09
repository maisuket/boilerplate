"use client";

import { useState } from "react";
import { useRouter } from "@/components/layout/routing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getRegisterSchema, type RegisterFormData } from "@/schemas/auth.schema";
import { ROUTES } from "@/constants/routes";
import { getErrorMessage } from "@/utils/error";
import { PasswordInput } from "./password-input";
import { generateRandomPassword } from "@/utils/password";
import { useTranslations } from "next-intl";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const tValidation = useTranslations("validation");
  const t = useTranslations("registerForm");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(getRegisterSchema(tValidation)),
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
      toast.success(t("toastSuccessTitle"), t("toastSuccessDescription"));
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      toast.error(t("toastErrorTitle"), getErrorMessage(error));
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
        <Label htmlFor="name">{t("fullName")}</Label>
        <Input
          id="name"
          type="text"
          placeholder={t("namePlaceholder")}
          autoComplete="name"
          error={!!errors.name}
          disabled={isLoading}
          {...register("name")}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t("emailAddress")}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          error={!!errors.email}
          disabled={isLoading}
          {...register("email")}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t("password")}</Label>
          <button
            type="button"
            onClick={handleGeneratePassword}
            className="text-xs text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            tabIndex={-1}
            disabled={isLoading}
          >
            {t("generateRandom")}
          </button>
        </div>
        <PasswordInput
          id="password"
          placeholder={t("passwordPlaceholder")}
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
        <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
        <PasswordInput
          id="confirmPassword"
          placeholder={t("confirmPasswordPlaceholder")}
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
        {isLoading ? t("creatingAccount") : t("createAccount")}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {t("termsAgreement")}{" "}
        <a href="#" className="text-primary hover:underline">
          {t("termsOfService")}
        </a>{" "}
        {t("and")}{" "}
        <a href="#" className="text-primary hover:underline">
          {t("privacyPolicy")}
        </a>
      </p>
    </form>
  );
}
