"use client";

export function getPasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
}

export function getPasswordStrengthLabel(strength: number): string {
  switch (strength) {
    case 0:
    case 1:
      return "Weak password";
    case 2:
      return "Fair password";
    case 3:
      return "Good password";
    case 4:
      return "Strong password";
    default:
      return "";
  }
}

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
