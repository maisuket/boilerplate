import { redirect } from "@/components/layout/routing";
import { cookies } from "next/headers";

import { ROUTES } from "@/constants/routes";
import { AUTH_TOKEN_KEY } from "@/constants/app";

export default async function RootPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const cookieStore = await cookies();

  const token = cookieStore.get(AUTH_TOKEN_KEY);

  if (token?.value) {
    redirect({ href: ROUTES.DASHBOARD, locale });
  } else {
    redirect({ href: ROUTES.LOGIN, locale });
  }
}
