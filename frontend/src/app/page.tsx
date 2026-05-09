import { notFound } from "next/navigation";

// Esta rota "catch-all" intercepta URLs inexistentes dentro do idioma (ex: /pt/financial)
// e as direciona para o not-found.tsx local, sem quebrar o layout do Next.js!
export default function CatchAllPage() {
  notFound();
}
