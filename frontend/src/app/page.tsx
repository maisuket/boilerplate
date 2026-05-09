import { redirect } from "next/navigation";

// Este é um fallback físico. Na prática, o middleware.ts intercepta a rota '/'
// antes de chegar aqui e já faz o redirecionamento baseado no idioma do navegador.
export default function RootPage() {
  redirect("/en");
}
