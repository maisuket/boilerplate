import type { Metadata } from "next";
import { Users, DollarSign, TrendingUp, ShoppingCart } from "lucide-react";

import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentTable } from "@/components/dashboard/recent-table";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboardPage" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const revenueData = [
  { month: "Jan", revenue: 4200, users: 240 },
  { month: "Feb", revenue: 3800, users: 198 },
  { month: "Mar", revenue: 5100, users: 305 },
  { month: "Apr", revenue: 4700, users: 280 },
  { month: "May", revenue: 6200, users: 390 },
  { month: "Jun", revenue: 5800, users: 352 },
  { month: "Jul", revenue: 7100, users: 421 },
  { month: "Aug", revenue: 6900, users: 408 },
  { month: "Sep", revenue: 8200, users: 487 },
  { month: "Oct", revenue: 7800, users: 463 },
  { month: "Nov", revenue: 9100, users: 541 },
  { month: "Dec", revenue: 10400, users: 623 },
];

const categoryData = [
  { category: "Electronics", sales: 4200 },
  { category: "Clothing", sales: 3100 },
  { category: "Books", sales: 1800 },
  { category: "Home", sales: 2700 },
  { category: "Sports", sales: 2100 },
  { category: "Beauty", sales: 1500 },
];

const recentOrders = [
  {
    id: "#ORD-001",
    customer: "Alice Johnson",
    email: "alice@example.com",
    amount: "$240.00",
    status: "completed" as const,
    date: "2024-01-15",
  },
  {
    id: "#ORD-002",
    customer: "Bob Smith",
    email: "bob@example.com",
    amount: "$180.50",
    status: "processing" as const,
    date: "2024-01-14",
  },
  {
    id: "#ORD-003",
    customer: "Carol White",
    email: "carol@example.com",
    amount: "$95.00",
    status: "completed" as const,
    date: "2024-01-14",
  },
  {
    id: "#ORD-004",
    customer: "David Brown",
    email: "david@example.com",
    amount: "$420.00",
    status: "pending" as const,
    date: "2024-01-13",
  },
  {
    id: "#ORD-005",
    customer: "Eva Martinez",
    email: "eva@example.com",
    amount: "$310.75",
    status: "failed" as const,
    date: "2024-01-13",
  },
];

export default function DashboardPage() {
  const t = useTranslations("dashboardPage");

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("totalRevenue")}
          value="$84,254"
          description={`+20.1% ${t("fromLastMonth")}`}
          trend={20.1}
          icon={DollarSign}
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />
        <StatsCard
          title={t("activeUsers")}
          value="4,623"
          description={`+15.3% ${t("fromLastMonth")}`}
          trend={15.3}
          icon={Users}
          iconColor="text-[hsl(var(--chart-2))]"
          iconBg="bg-[hsl(var(--chart-2))/0.1]"
        />
        <StatsCard
          title={t("newOrders")}
          value="1,284"
          description={`+8.7% ${t("fromLastMonth")}`}
          trend={8.7}
          icon={ShoppingCart}
          iconColor="text-[hsl(var(--chart-3))]"
          iconBg="bg-[hsl(var(--chart-3))/0.1]"
        />
        <StatsCard
          title={t("growthRate")}
          value="12.5%"
          description={`-2.4% ${t("fromLastMonth")}`}
          trend={-2.4}
          icon={TrendingUp}
          iconColor="text-[hsl(var(--chart-4))]"
          iconBg="bg-[hsl(var(--chart-4))/0.1]"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <AreaChartComponent
            title={t("revenueOverview")}
            description={t("revenueDescription")}
            data={revenueData}
            areas={[
              { dataKey: "revenue", name: t("revenue"), color: "hsl(var(--chart-1))" },
              { dataKey: "users", name: t("users"), color: "hsl(var(--chart-2))" },
            ]}
            xAxisKey="month"
          />
        </div>
        <div className="lg:col-span-3">
          <BarChartComponent
            title={t("salesByCategory")}
            description={t("salesDescription")}
            data={categoryData}
            bars={[{ dataKey: "sales", name: t("sales"), color: "hsl(var(--chart-1))" }]}
            xAxisKey="category"
          />
        </div>
      </div>

      <RecentTable
        title={t("recentOrdersTitle")}
        description={t("recentOrdersDescription", { count: "1,284" })}
        data={recentOrders}
      />
    </div>
  );
}
