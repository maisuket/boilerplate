// c:\Users\Daisuke\Desktop\Projetos\boilerplate\frontend\src\schemas\user.schema.ts
import { z } from "zod";
import { USER_ROLES } from "@/constants/roles";

export const getCreateUserSchema = (t: any) =>
  z.object({
    name: z.string().min(1, t("nameRequired")),
    email: z.string().min(1, t("emailRequired")).email(t("invalidEmail")),
    password: z
      .string()
      .min(8, t("passwordMinLength"))
      .max(100, t("passwordMaxLength"))
      .regex(/[a-z]/, t("passwordLowercase"))
      .regex(/[A-Z]/, t("passwordUppercase"))
      .regex(/[0-9]/, t("passwordNumber"))
      .regex(/[^A-Za-z0-9]/, t("passwordSpecial")),
    role: z.enum(USER_ROLES as unknown as [string, ...string[]]),
  });

export const getUpdateUserSchema = (t: any) =>
  z.object({
    name: z.string().min(1, t("nameRequired")),
    email: z.string().min(1, t("emailRequired")).email(t("invalidEmail")),
    role: z.enum(USER_ROLES as unknown as [string, ...string[]]),
    isActive: z.boolean(),
  });

export const getProfileSchema = (t: any) =>
  z.object({
    name: z.string().min(1, t("nameRequired")),
    email: z.string().min(1, t("emailRequired")).email(t("invalidEmail")),
    avatar: z.union([z.literal(""), z.string().url(t("invalidUrl"))]).optional(),
  });

export type CreateUserFormData = z.infer<ReturnType<typeof getCreateUserSchema>>;
export type UpdateUserFormData = z.infer<ReturnType<typeof getUpdateUserSchema>>;
export type ProfileFormData = z.infer<ReturnType<typeof getProfileSchema>>;
