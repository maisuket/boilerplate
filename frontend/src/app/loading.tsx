import { LoadingSpinner } from "@/components/feedback/loading-spinner";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-[80vh] w-full flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
