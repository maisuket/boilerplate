import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export function StatsCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
}: StatsCardProps) {
  const isPositive = trend !== undefined && trend >= 0;
  const isNegative = trend !== undefined && trend < 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {description && (
              <div className="flex items-center gap-1 text-sm">
                {trend !== undefined && (
                  <>
                    {isPositive ? (
                      <TrendingUp className="h-3.5 w-3.5 text-success" />
                    ) : isNegative ? (
                      <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                    ) : null}
                    <span
                      className={cn(
                        "font-medium",
                        isPositive ? "text-success" : "text-destructive"
                      )}
                    >
                      {trend > 0 ? "+" : ""}{trend}%
                    </span>
                  </>
                )}
                <span className="text-muted-foreground">{description}</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
              iconBg
            )}
          >
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
