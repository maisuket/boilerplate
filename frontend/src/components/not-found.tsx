"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center space-y-6 text-center">
        <div className="relative">
          <div className="text-[120px] font-bold leading-none text-emerald-500/10 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="h-16 w-16 text-emerald-500/50" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
          <p className="max-w-md text-muted-foreground">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved,
            deleted, or the URL might be incorrect.
          </p>
        </div>

        <div className="flex gap-3">
          <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Link href={ROUTES.DASHBOARD}>
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
