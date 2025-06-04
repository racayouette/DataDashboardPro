import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Laptop, 
  Smartphone, 
  Headphones, 
  Tablet,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import type { Transaction, Product } from "@shared/schema";

interface DataGridProps {
  title: string;
  subtitle: string;
  data?: Transaction[] | Product[];
  isLoading: boolean;
  type: "transactions" | "products";
}

export function DataGrid({ title, subtitle, data, isLoading, type }: DataGridProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      Completed: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Failed: "bg-red-100 text-red-800",
    };
    return statusMap[status as keyof typeof statusMap] || "bg-gray-100 text-gray-800";
  };

  const getProductIcon = (category: string) => {
    const iconMap = {
      Electronics: Laptop,
      Mobile: Smartphone,
      Audio: Headphones,
      Tablets: Tablet,
    };
    return iconMap[category as keyof typeof iconMap] || Laptop;
  };

  const getProductIconBg = (category: string) => {
    const bgMap = {
      Electronics: "bg-primary bg-opacity-10",
      Mobile: "bg-purple-100",
      Audio: "bg-green-100",
      Tablets: "bg-orange-100",
    };
    return bgMap[category as keyof typeof bgMap] || "bg-gray-100";
  };

  const getProductIconColor = (category: string) => {
    const colorMap = {
      Electronics: "text-primary",
      Mobile: "text-purple-600",
      Audio: "text-green-600",
      Tablets: "text-orange-600",
    };
    return colorMap[category as keyof typeof colorMap] || "text-gray-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {type === "transactions" ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trend
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {type === "transactions"
                ? (data as Transaction[]).map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-700">
                              {transaction.customerName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.customerName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${parseFloat(transaction.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusBadge(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                : (data as Product[]).map((product) => {
                    const Icon = getProductIcon(product.category);
                    const isPositiveTrend = product.trend.startsWith("+");
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 ${getProductIconBg(product.category)} rounded-lg flex items-center justify-center`}>
                              <Icon className={getProductIconColor(product.category)} />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.category}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.sales.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${parseFloat(product.revenue).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {isPositiveTrend ? (
                              <TrendingUp className="text-green-500 text-sm mr-1" />
                            ) : (
                              <TrendingDown className="text-red-500 text-sm mr-1" />
                            )}
                            <span className={`text-sm font-medium ${isPositiveTrend ? "text-green-600" : "text-red-600"}`}>
                              {product.trend}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
