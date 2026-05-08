export type UserRole = "admin" | "user" | "moderator";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  avatar?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserProfile extends User {
  preferences?: UserPreferences;
  stats?: UserStats;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  lastLoginAt: string;
  loginCount: number;
}
