import { Users, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardSummary } from "@shared/schema";

interface SummaryCardsProps {
  data?: DashboardSummary;
  isLoading: boolean;
}

export function SummaryCards({ data, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <Skeleton className="w-12 h-12 rounded-lg" />
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <CardContent className="p-0">
            <p className="text-center text-gray-500">No summary data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Job Descriptions",
      value: data.totalUsers.toLocaleString(),
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-primary",
      change: "+12.5%",
      changeColor: "text-green-600",
    },
    {
      title: "Revenue",
      value: `$${parseFloat(data.revenue).toLocaleString()}`,
      icon: DollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      change: "+8.2%",
      changeColor: "text-green-600",
    },
    {
      title: "Orders",
      value: data.orders.toLocaleString(),
      icon: ShoppingCart,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      change: "-2.1%",
      changeColor: "text-red-600",
    },
    {
      title: "Growth Rate",
      value: `${parseFloat(data.growthRate)}%`,
      icon: TrendingUp,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      change: "+5.4%",
      changeColor: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="p-6 hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${card.iconColor} text-xl`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`${card.changeColor} text-sm font-medium`}>{card.change}</span>
                <span className="text-gray-500 text-sm ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
