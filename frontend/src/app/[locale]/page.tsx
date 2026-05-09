import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { ROUTES } from "@/constants/routes";
import { AUTH_TOKEN_KEY } from "@/constants/app";

export default async function RootPage() {
  const cookieStore = await cookies();

  const token = cookieStore.get(AUTH_TOKEN_KEY);

  if (token?.value) {
    redirect(ROUTES.DASHBOARD);
  } else {
    redirect(ROUTES.LOGIN);
  }
}
