import type { Metadata } from "next";
import { Users, DollarSign, TrendingUp, ShoppingCart } from "lucide-react";

import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentTable } from "@/components/dashboard/recent-table";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { BarChartComponent } from "@/components/charts/bar-chart";

export const metadata: Metadata = {
  title: "Dashboard",
};

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
  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s an overview of your business.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value="$84,254"
          description="+20.1% from last month"
          trend={20.1}
          icon={DollarSign}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-500/10"
        />
        <StatsCard
          title="Active Users"
          value="4,623"
          description="+15.3% from last month"
          trend={15.3}
          icon={Users}
          iconColor="text-blue-500"
          iconBg="bg-blue-500/10"
        />
        <StatsCard
          title="New Orders"
          value="1,284"
          description="+8.7% from last month"
          trend={8.7}
          icon={ShoppingCart}
          iconColor="text-violet-500"
          iconBg="bg-violet-500/10"
        />
        <StatsCard
          title="Growth Rate"
          value="12.5%"
          description="-2.4% from last month"
          trend={-2.4}
          icon={TrendingUp}
          iconColor="text-orange-500"
          iconBg="bg-orange-500/10"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <AreaChartComponent
            title="Revenue Overview"
            description="Monthly revenue and user growth"
            data={revenueData}
            areas={[
              { dataKey: "revenue", name: "Revenue", color: "#3b82f6" },
              { dataKey: "users", name: "Users", color: "#8b5cf6" },
            ]}
            xAxisKey="month"
          />
        </div>
        <div className="lg:col-span-3">
          <BarChartComponent
            title="Sales by Category"
            description="Top performing product categories"
            data={categoryData}
            bars={[
              { dataKey: "sales", name: "Sales", color: "#3b82f6" },
            ]}
            xAxisKey="category"
          />
        </div>
      </div>

      <RecentTable
        title="Recent Orders"
        description="You have 1,284 orders this month"
        data={recentOrders}
      />
    </div>
  );
}
