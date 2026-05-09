import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/forms/register-form";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a new account",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
        <p className="text-muted-foreground">Enter your details to create your account</p>
      </div>

      <RegisterForm />

      <div className="flex flex-col gap-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Already have an account?
            </span>
          </div>
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link href={ROUTES.LOGIN}>Sign in instead</Link>
        </Button>
      </div>
    </div>
  );
}
