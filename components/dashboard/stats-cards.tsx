import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownLeft, ArrowUpRight, Scale, Hash } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { DashboardStats } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      title: "Total Received",
      value: formatCurrency(stats.totalReceived),
      icon: ArrowDownLeft,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Total Sent",
      value: formatCurrency(stats.totalSent),
      icon: ArrowUpRight,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Net Balance",
      value: formatCurrency(stats.netBalance),
      icon: Scale,
      color: stats.netBalance >= 0 ? "text-green-600" : "text-red-600",
      bg: stats.netBalance >= 0 ? "bg-green-50" : "bg-red-50",
    },
    {
      title: "Transactions",
      value: stats.transactionCount.toString(),
      icon: Hash,
      color: "text-gray-600",
      bg: "bg-gray-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(({ title, value, icon: Icon, color, bg }) => (
        <Card key={title} className="border border-gray-200 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
            <div className={cn("p-2 rounded-md", bg)}>
              <Icon className={cn("w-4 h-4", color)} />
            </div>
          </CardHeader>
          <CardContent>
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
