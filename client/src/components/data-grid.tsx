import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  Laptop, 
  Smartphone, 
  Headphones, 
  Tablet,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import type { Transaction, JobFamily, Reviewer } from "@shared/schema";

interface DataGridProps {
  title: string;
  subtitle: string;
  data?: Transaction[] | JobFamily[] | Reviewer[];
  isLoading: boolean;
  type: "transactions" | "jobFamilies" | "reviewers";
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onJobFamilyClick?: (jobFamily: JobFamily) => void;
}

export function DataGrid({ title, subtitle, data, isLoading, type, pagination, onJobFamilyClick }: DataGridProps) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortDirection === "asc" ? 
      <ArrowUp className="w-4 h-4" /> : 
      <ArrowDown className="w-4 h-4" />;
  };

  const sortedData = data ? [...data].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue: any;
    let bValue: any;
    
    if (type === "transactions") {
      const transA = a as Transaction;
      const transB = b as Transaction;
      switch (sortField) {
        case "customerName":
          aValue = transA.customerName;
          bValue = transB.customerName;
          break;
        case "amount":
          aValue = parseFloat(transA.amount);
          bValue = parseFloat(transB.amount);
          break;
        case "status":
          aValue = transA.status;
          bValue = transB.status;
          break;
        default:
          return 0;
      }
    } else if (type === "jobFamilies") {
      const jobA = a as JobFamily;
      const jobB = b as JobFamily;
      switch (sortField) {
        case "jobFamily":
          aValue = jobA.jobFamily;
          bValue = jobB.jobFamily;
          break;
        case "totalJobs":
          aValue = jobA.totalJobs;
          bValue = jobB.totalJobs;
          break;
        case "jobsReviewed":
          aValue = jobA.jobsReviewed;
          bValue = jobB.jobsReviewed;
          break;
        default:
          return 0;
      }
    } else if (type === "reviewers") {
      const revA = a as Reviewer;
      const revB = b as Reviewer;
      switch (sortField) {
        case "jobFamily":
          aValue = revA.jobFamily;
          bValue = revB.jobFamily;
          break;
        case "completed":
          aValue = revA.completed;
          bValue = revB.completed;
          break;
        case "inProgress":
          aValue = revA.inProgress;
          bValue = revB.inProgress;
          break;
        case "responsible":
          aValue = revA.responsible;
          bValue = revB.responsible;
          break;
        default:
          return 0;
      }
    }
    
    if (typeof aValue === "string" && typeof bValue === "string") {
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === "asc" ? comparison : -comparison;
    } else {
      const comparison = aValue - bValue;
      return sortDirection === "asc" ? comparison : -comparison;
    }
  }) : [];
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
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("customerName")}
                      >
                        <span>Customer</span>
                        {getSortIcon("customerName")}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("amount")}
                      >
                        <span>Amount</span>
                        {getSortIcon("amount")}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("status")}
                      >
                        <span>Status</span>
                        {getSortIcon("status")}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </>
                ) : type === "jobFamilies" ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("jobFamily")}
                      >
                        <span>Job Family</span>
                        {getSortIcon("jobFamily")}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("totalJobs")}
                      >
                        <span>Total Jobs</span>
                        {getSortIcon("totalJobs")}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("jobsReviewed")}
                      >
                        <span>Jobs Reviewed</span>
                        {getSortIcon("jobsReviewed")}
                      </button>
                    </th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("jobFamily")}
                      >
                        <span>Reviewer</span>
                        {getSortIcon("jobFamily")}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("responsible")}
                      >
                        <span>Responsible</span>
                        {getSortIcon("responsible")}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("completed")}
                      >
                        <span>Completed</span>
                        {getSortIcon("completed")}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("inProgress")}
                      >
                        <span>In Progress</span>
                        {getSortIcon("inProgress")}
                      </button>
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {type === "transactions"
                ? (sortedData as Transaction[]).map((transaction) => (
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
                : type === "jobFamilies"
                ? (sortedData as JobFamily[]).map((jobFamily) => (
                    <tr 
                      key={jobFamily.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => onJobFamilyClick?.(jobFamily)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className="text-blue-600 hover:text-blue-800 underline transition-colors">
                          {jobFamily.jobFamily}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {jobFamily.totalJobs}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {jobFamily.jobsReviewed}
                      </td>
                    </tr>
                  ))
                : (sortedData as Reviewer[]).map((reviewer) => (
                    <tr key={reviewer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a 
                          href={`/jobs-family?reviewer=${encodeURIComponent(reviewer.jobFamily)}`}
                          className="text-blue-600 hover:text-blue-800 underline transition-colors"
                        >
                          {reviewer.jobFamily}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reviewer.responsible}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reviewer.completed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reviewer.inProgress}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-end mt-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                &lt;
              </Button>
              
              {/* Dynamic cycling page buttons */}
              {(() => {
                const getVisiblePages = () => {
                  if (pagination.totalPages <= 2) {
                    return Array.from({ length: pagination.totalPages }, (_, i) => i + 1);
                  }
                  
                  // Always show 2 buttons, positioned based on current page
                  if (pagination.currentPage === 1) {
                    return [1, 2];
                  } else if (pagination.currentPage === pagination.totalPages) {
                    return [pagination.totalPages - 1, pagination.totalPages];
                  } else {
                    return [pagination.currentPage, pagination.currentPage + 1];
                  }
                };
                
                return getVisiblePages().map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pagination.currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => pagination.onPageChange(pageNum)}
                    className="w-8 h-8"
                  >
                    {pageNum}
                  </Button>
                ));
              })()}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                &gt;
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
