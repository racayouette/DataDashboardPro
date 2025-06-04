import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Header } from "@/components/header";
import { SummaryCards } from "@/components/summary-cards";
import { DataGrid } from "@/components/data-grid";
import { useToast } from "@/hooks/use-toast";
import type { DashboardSummary, Transaction, Product } from "@shared/schema";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);

  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary"],
  });

  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useQuery<{ transactions: Transaction[], total: number, totalPages: number, currentPage: number }>({
    queryKey: ["/api/transactions", transactionsPage],
    queryFn: () => fetch(`/api/transactions?page=${transactionsPage}&limit=4`).then(res => res.json()),
  });

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery<{ products: Product[], total: number, totalPages: number, currentPage: number }>({
    queryKey: ["/api/products/top", productsPage],
    queryFn: () => fetch(`/api/products/top?page=${productsPage}&limit=4`).then(res => res.json()),
  });

  const refreshDashboard = async () => {
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/transactions"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/products/top"] }),
      ]);
      toast({
        title: "Dashboard refreshed",
        description: "All data has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh dashboard data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show error messages
  if (summaryError || transactionsError || productsError) {
    const errorMessage = summaryError?.message || transactionsError?.message || productsError?.message;
    toast({
      title: "Error loading data",
      description: errorMessage || "Failed to load dashboard data.",
      variant: "destructive",
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="mt-2 text-gray-600">Monitor your key metrics and data insights</p>
        </div>

        {/* Summary Cards */}
        <SummaryCards data={summaryData} isLoading={summaryLoading} />

        {/* Data Grids Section */}
        <div className="grid grid-cols-2 gap-8">
          {/* Left Grid - Top Products */}
          <DataGrid
            title="Top Products"
            subtitle="Best performing products this month"
            data={products}
            isLoading={productsLoading}
            type="products"
          />

          {/* Right Grid - Recent Transactions */}
          <DataGrid
            title="Recent Transactions"
            subtitle="Latest customer transactions"
            data={transactions}
            isLoading={transactionsLoading}
            type="transactions"
          />
        </div>

        {/* Refresh Button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={refreshDashboard}
            className="inline-flex items-center px-6 py-3 text-base font-medium"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}
