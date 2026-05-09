import { z } from "zod";

export const getLoginSchema = (t: any) =>
  z.object({
    email: z.string().min(1, t("emailRequired")).email(t("invalidEmail")),
    password: z.string().min(1, t("passwordRequired")).min(6, t("passwordMinLengthLogin")),
  });

export const getRegisterSchema = (t: any) =>
  z
    .object({
      name: z
        .string()
        .min(1, t("nameRequired"))
        .min(2, t("nameMinLength"))
        .max(100, t("nameMaxLength"))
        .regex(/^[a-zA-Z\s'-]+$/, t("nameInvalidCharacters")),
      email: z.string().min(1, t("emailRequired")).email(t("invalidEmail")),
      password: z
        .string()
        .min(1, t("passwordRequired"))
        .min(8, t("passwordMinLength"))
        .max(100, t("passwordMaxLength"))
        .regex(/[a-z]/, t("passwordLowercase"))
        .regex(/[A-Z]/, t("passwordUppercase"))
        .regex(/[0-9]/, t("passwordNumber"))
        .regex(/[^A-Za-z0-9]/, t("passwordSpecial")),
      confirmPassword: z.string().min(1, t("confirmPasswordRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsMismatch"),
      path: ["confirmPassword"],
    });

export const getForgotPasswordSchema = (t: any) =>
  z.object({
    email: z.string().min(1, t("emailRequired")).email(t("invalidEmail")),
  });

export const getResetPasswordSchema = (t: any) =>
  z
    .object({
      password: z
        .string()
        .min(8, t("passwordMinLength"))
        .max(100, t("passwordMaxLength"))
        .regex(/[a-z]/, t("passwordLowercase"))
        .regex(/[A-Z]/, t("passwordUppercase"))
        .regex(/[0-9]/, t("passwordNumber"))
        .regex(/[^A-Za-z0-9]/, t("passwordSpecial")),
      confirmPassword: z.string().min(1, t("confirmPasswordRequired")),
      token: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsMismatch"),
      path: ["confirmPassword"],
    });

export const getChangePasswordSchema = (t: any) =>
  z
    .object({
      currentPassword: z.string().min(1, t("currentPasswordRequired")),
      newPassword: z
        .string()
        .min(8, t("passwordMinLength"))
        .max(100, t("passwordMaxLength"))
        .regex(/[a-z]/, t("passwordLowercase"))
        .regex(/[A-Z]/, t("passwordUppercase"))
        .regex(/[0-9]/, t("passwordNumber"))
        .regex(/[^A-Za-z0-9]/, t("passwordSpecial")),
      confirmNewPassword: z.string().min(1, t("confirmNewPasswordRequired")),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: t("passwordsMismatch"),
      path: ["confirmNewPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: t("newPasswordDifferent"),
      path: ["newPassword"],
    });

export type LoginFormData = z.infer<ReturnType<typeof getLoginSchema>>;
export type RegisterFormData = z.infer<ReturnType<typeof getRegisterSchema>>;
export type ForgotPasswordFormData = z.infer<ReturnType<typeof getForgotPasswordSchema>>;
export type ResetPasswordFormData = z.infer<ReturnType<typeof getResetPasswordSchema>>;
export type ChangePasswordFormData = z.infer<ReturnType<typeof getChangePasswordSchema>>;
