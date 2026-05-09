import { notFound } from "next/navigation";

// Esta rota "catch-all" intercepta URLs inexistentes em qualquer lugar do sistema
export default function CatchAllPage() {
  notFound();
}
