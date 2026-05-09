import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import UsersClient from "./client-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "usersPage" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function UsersPage() {
  return <UsersClient />;
}
