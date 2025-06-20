import { Users, DollarSign, ShoppingCart, TrendingUp, Briefcase, Eye, XCircle, Shield, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardSummary } from "@shared/schema";

interface SummaryCardsProps {
  data?: DashboardSummary;
  isLoading: boolean;
  variant?: 'default' | 'second';
}

export function SummaryCards({ data, isLoading, variant = 'default' }: SummaryCardsProps) {
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

  const totalJobs = data.totalUsers; // 9000
  const jobsReviewed = parseFloat(data.revenue); // 71
  const inProgress = data.orders; // 132
  const notStarted = parseFloat(data.growthRate); // 8560
  const reviewedPercentage = totalJobs > 0 ? ((jobsReviewed / totalJobs) * 100).toFixed(1) : "0.0";
  const inProgressPercentage = totalJobs > 0 ? ((inProgress / totalJobs) * 100).toFixed(1) : "0.0";
  const notStartedPercentage = totalJobs > 0 ? ((notStarted / totalJobs) * 100).toFixed(1) : "0.0";
  
  // Calculate percentages for second row using totalJobs as denominator
  const hrReviewPercentage = totalJobs > 0 ? ((90 / totalJobs) * 100).toFixed(1) : "0.0";
  const completedPercentage = totalJobs > 0 ? ((147 / totalJobs) * 100).toFixed(1) : "0.0";

  // Default row configuration (first row)
  const defaultCards = [
    {
      title: "Total Jobs",
      value: data.totalUsers.toLocaleString(),
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-primary",
      change: "100%",
      changeColor: "text-green-600",
      statusText: "",
    },
    {
      title: "Not Started",
      value: parseFloat(data.growthRate).toLocaleString(),
      icon: XCircle,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      change: `${notStartedPercentage}%`,
      changeColor: "text-green-600",
      statusText: "",
    },
    {
      title: "In Progress",
      value: data.orders.toLocaleString(),
      icon: TrendingUp,
      iconBg: "bg-purple-100",
      iconColor: "text-green-600",
      change: `${inProgressPercentage}%`,
      changeColor: "text-green-600",
      statusText: "",
    },
    {
      title: "Functional Leader Review Complete",
      value: parseFloat(data.revenue).toLocaleString(),
      icon: Briefcase,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      change: `${reviewedPercentage}%`,
      changeColor: "text-green-600",
      statusText: "",
    },
  ];

  // Second row configuration - only showing 2 cards but in 4-column grid
  const secondCards = [
    {
      title: "HR Review Complete",
      value: "90",
      icon: Shield,
      iconBg: "bg-blue-100",
      iconColor: "text-primary",
      change: `${hrReviewPercentage}%`,
      changeColor: "text-green-600",
      statusText: "",
    },
    {
      title: "Completed",
      value: "147",
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      change: `${completedPercentage}%`,
      changeColor: "text-green-600",
      statusText: "",
    },
  ];

  const cards = variant === 'second' ? secondCards : defaultCards;

  return (
    <div className={`grid ${variant === 'second' ? 'grid-cols-2' : 'grid-cols-4'} gap-6 mb-8`}>
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <Card key={index} className="p-6 hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                {Icon && (
                  <div className="w-12 h-12 flex items-center justify-center mt-1">
                    <Icon className={`${card.iconColor} text-xl`} />
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center">
                <span className={`${card.changeColor} text-sm font-medium`}>{card.change}</span>
                <span className="text-gray-500 text-sm ml-2">{card.statusText}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
