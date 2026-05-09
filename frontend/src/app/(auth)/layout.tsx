import type { Metadata } from "next";
import Link from "next/link";

import { APP_NAME } from "@/constants/app";

export const metadata: Metadata = {
  title: {
    default: "Authentication",
    template: `%s | ${APP_NAME}`,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Imagem Inspiradora (Esquerda - Escondido no Mobile) */}
      <div className="relative hidden w-full lg:block lg:w-1/2 xl:w-7/12">
        <div
          className="absolute inset-0 bg-zinc-900 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=1920&auto=format&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-zinc-900/40 mix-blend-multiply" />
        </div>
        <div className="relative z-20 flex h-full flex-col justify-end p-10 text-white lg:p-14">
          <blockquote className="space-y-2 max-w-lg">
            <p className="text-xl font-medium leading-relaxed">
              &ldquo;This boilerplate has saved our team hundreds of hours. The combination of
              Next.js, NestJS, and clean architecture is absolutely incredible.&rdquo;
            </p>
            <footer className="text-sm font-medium text-zinc-300">
              &mdash; Daisuke, Lead Developer
            </footer>
          </blockquote>
        </div>
      </div>
      {/* Formulário (Direita) */}
      <div className="flex w-full flex-col justify-center bg-background px-4 sm:px-8 lg:w-1/2 xl:w-5/12">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md">
              <span className="text-xl font-bold text-primary-foreground">
                {APP_NAME.charAt(0)}
              </span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">{APP_NAME}</span>
          </Link>

          <main className="animate-in fade-in zoom-in-95 duration-300">{children}</main>

          <footer className="mt-8 text-sm text-muted-foreground animate-in fade-in duration-500 delay-300">
            <p>
              &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
