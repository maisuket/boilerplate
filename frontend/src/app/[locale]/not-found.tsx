import { useTranslations } from "next-intl";
import { FileQuestion } from "lucide-react";

import { Link } from "@/components/layout/routing";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function NotFoundPage() {
  // O next-intl suporta traduções em server components na página de not-found
  const t = useTranslations("notFound");

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-4rem)] bg-background px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-8">
        <FileQuestion className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-2">404</h1>
      <h2 className="text-2xl font-semibold tracking-tight mb-4">{t("title")}</h2>
      <p className="text-muted-foreground mb-8 max-w-[500px]">{t("description")}</p>
      <Button asChild size="lg">
        <Link href={ROUTES.DASHBOARD}>{t("backHome")}</Link>
      </Button>
    </div>
  );
}
