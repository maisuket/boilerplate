import { LoadingSpinner } from "./loading-spinner";
import { APP_NAME } from "@/constants/app";

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = "Loading..." }: PageLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <span className="text-lg font-bold text-primary-foreground">
            {APP_NAME.charAt(0)}
          </span>
        </div>
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      </div>
    </div>
  );
}
