"use client";

import { useState, forwardRef } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

import { Input, type InputProps } from "@/components/ui/input";
import { PasswordStrengthIndicator } from "./password-strength-indicator";

export interface PasswordInputProps extends Omit<InputProps, "type"> {
  error?: boolean;
  showCopy?: boolean;
  passwordValue?: string;
  showPassword?: boolean;
  onShowPasswordChange?: (show: boolean) => void;
  showStrengthIndicator?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      error,
      showCopy,
      passwordValue,
      showPassword: controlledShowPassword,
      onShowPasswordChange,
      showStrengthIndicator,
      ...props
    },
    ref
  ) => {
    const [internalShowPassword, setInternalShowPassword] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // Suporta tanto o modo controlado (pelo pai) quanto não controlado (interno)
    const isControlled = controlledShowPassword !== undefined;
    const showPassword = isControlled ? controlledShowPassword : internalShowPassword;

    const togglePassword = () => {
      if (isControlled && onShowPasswordChange) {
        onShowPasswordChange(!showPassword);
      } else {
        setInternalShowPassword((prev) => !prev);
      }
    };

    const handleCopy = () => {
      if (!passwordValue) return;
      navigator.clipboard.writeText(passwordValue);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    };

    return (
      <div className="w-full">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            error={error}
            className={`${showCopy ? "pr-16" : "pr-10"} ${className || ""}`.trim()}
            ref={ref}
            {...props}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {showCopy && (
              <button
                type="button"
                onClick={handleCopy}
                disabled={!passwordValue}
                className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                tabIndex={-1}
                title="Copy password"
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={togglePassword}
              className="text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {showStrengthIndicator && (
          <div className="pt-2">
            <PasswordStrengthIndicator password={passwordValue} />
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
