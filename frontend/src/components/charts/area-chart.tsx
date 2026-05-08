"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AreaConfig {
  dataKey: string;
  name: string;
  color: string;
  fillOpacity?: number;
}

interface AreaChartProps {
  title: string;
  description?: string;
  data: Record<string, unknown>[];
  areas: AreaConfig[];
  xAxisKey: string;
  height?: number;
  formatValue?: (value: number) => string;
  formatXAxis?: (value: string) => string;
}

export function AreaChartComponent({
  title,
  description,
  data,
  areas,
  xAxisKey,
  height = 300,
  formatValue,
  formatXAxis,
}: AreaChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              {areas.map((area) => (
                <linearGradient
                  key={area.dataKey}
                  id={`gradient-${area.dataKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={area.color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={area.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
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
              formatter={formatValue ? (value) => [formatValue(value as number)] : undefined}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
            />
            {areas.map((area) => (
              <Area
                key={area.dataKey}
                type="monotone"
                dataKey={area.dataKey}
                name={area.name}
                stroke={area.color}
                strokeWidth={2}
                fill={`url(#gradient-${area.dataKey})`}
                fillOpacity={area.fillOpacity ?? 1}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
