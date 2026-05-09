"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Workaround temporário para ocultar o aviso inofensivo do React 19/Next.js sobre tags <script>.
// O next-themes e o nextjs-toploader injetam scripts intencionalmente para funcionar corretamente,
// mas as novas regras estritas do React disparam esse aviso no console de desenvolvimento.
if (typeof window !== "undefined") {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
