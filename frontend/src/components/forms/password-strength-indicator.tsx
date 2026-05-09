"use client";

import { getPasswordStrength, getPasswordStrengthLabel } from "@/utils/password";

interface PasswordStrengthIndicatorProps {
  password?: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const strength = getPasswordStrength(password);

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
      <p className="text-xs text-muted-foreground">{getPasswordStrengthLabel(strength)}</p>
    </div>
  );
}
