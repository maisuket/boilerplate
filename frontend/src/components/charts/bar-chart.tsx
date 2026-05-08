"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BarConfig {
  dataKey: string;
  name: string;
  color: string;
  radius?: number;
}

interface BarChartProps {
  title: string;
  description?: string;
  data: Record<string, unknown>[];
  bars: BarConfig[];
  xAxisKey: string;
  height?: number;
  formatValue?: (value: number) => string;
  formatXAxis?: (value: string) => string;
  colorByValue?: boolean;
  colors?: string[];
}

const DEFAULT_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

export function BarChartComponent({
  title,
  description,
  data,
  bars,
  xAxisKey,
  height = 300,
  formatValue,
  formatXAxis,
  colorByValue = false,
  colors = DEFAULT_COLORS,
}: BarChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={formatXAxis}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={formatValue}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                fontSize: "12px",
                color: "hsl(var(--popover-foreground))",
              }}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
              formatter={formatValue ? (value) => [formatValue(value as number)] : undefined}
            />
            {bars.length > 1 && (
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} />
            )}
            {bars.map((bar) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                name={bar.name}
                fill={bar.color}
                radius={[bar.radius ?? 4, bar.radius ?? 4, 0, 0]}
              >
                {colorByValue &&
                  data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length] ?? bar.color}
                    />
                  ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
