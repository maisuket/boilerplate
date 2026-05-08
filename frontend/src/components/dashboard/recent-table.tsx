import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OrderStatus = "completed" | "processing" | "pending" | "failed";

interface RecentOrder {
  id: string;
  customer: string;
  email: string;
  amount: string;
  status: OrderStatus;
  date: string;
}

interface RecentTableProps {
  title: string;
  description?: string;
  data: RecentOrder[];
  isLoading?: boolean;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  completed: {
    label: "Completed",
    className: "bg-success/10 text-success border-0",
  },
  processing: {
    label: "Processing",
    className: "bg-info/10 text-info border-0",
  },
  pending: {
    label: "Pending",
    className: "bg-warning/10 text-warning border-0",
  },
  failed: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive border-0",
  },
};

export function RecentTable({ title, description, data, isLoading = false }: RecentTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription className="mt-1">{description}</CardDescription>}
        </div>
        <Button variant="outline" size="sm">
          View all
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-36" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              : data.map((order) => {
                  const status = statusConfig[order.status];
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm font-medium">
                        {order.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer}</p>
                          <p className="text-sm text-muted-foreground">{order.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell font-medium">
                        {order.amount}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "text-xs font-medium",
                            status.className
                          )}
                        >
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                        {order.date}
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
