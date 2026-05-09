import { z } from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  avatar: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
});

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
  role: z.enum(["ADMIN", "USER", "MODERATOR"]).default("USER"),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  email: z.string().email("Please enter a valid email address").optional(),
  avatar: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
  role: z.enum(["ADMIN", "USER", "MODERATOR"]).optional(),
  isActive: z.boolean().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
