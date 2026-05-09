"use client";

import { getPasswordStrength } from "@/utils/password";
import { useTranslations } from "next-intl";

interface PasswordStrengthIndicatorProps {
  password?: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const t = useTranslations("passwordStrength");
  if (!password) return null;

  const strength = getPasswordStrength(password);

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 1:
        return t("weak");
      case 2:
        return t("fair");
      case 3:
        return t("good");
      case 4:
        return t("strong");
      default:
        return t("weak");
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors ${
              level <= strength
                ? strength === 1
                  ? "bg-destructive"
                  : strength === 2
                    ? "bg-warning"
                    : strength === 3
                      ? "bg-info"
                      : "bg-success"
                : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{getStrengthLabel(strength)}</p>
    </div>
  );
}
