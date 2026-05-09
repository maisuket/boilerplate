export const USER_ROLES = ["USER", "ADMIN", "MODERATOR"] as const;
export type UserRole = (typeof USER_ROLES)[number];
