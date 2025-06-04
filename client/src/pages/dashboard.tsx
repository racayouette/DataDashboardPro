import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search, Bell } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { SummaryCards } from "@/components/summary-cards";
import { DataGrid } from "@/components/data-grid";
import { useToast } from "@/hooks/use-toast";
import type { DashboardSummary, Transaction, JobFamily, Reviewer } from "@shared/schema";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [jobFamiliesPage, setJobFamiliesPage] = useState(1);
  const [reviewersPage, setReviewersPage] = useState(1);

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
    data: jobFamiliesData,
    isLoading: jobFamiliesLoading,
    error: jobFamiliesError,
  } = useQuery<{ jobFamilies: JobFamily[], total: number, totalPages: number, currentPage: number }>({
    queryKey: ["/api/job-families", jobFamiliesPage],
    queryFn: () => fetch(`/api/job-families?page=${jobFamiliesPage}&limit=4`).then(res => res.json()),
  });

  const {
    data: reviewersData,
    isLoading: reviewersLoading,
    error: reviewersError,
  } = useQuery<{ reviewers: Reviewer[], total: number, totalPages: number, currentPage: number }>({
    queryKey: ["/api/reviewers", reviewersPage],
    queryFn: () => fetch(`/api/reviewers?page=${reviewersPage}&limit=4`).then(res => res.json()),
  });

  const refreshDashboard = async () => {
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/transactions", transactionsPage] }),
        queryClient.invalidateQueries({ queryKey: ["/api/job-families", jobFamiliesPage] }),
        queryClient.invalidateQueries({ queryKey: ["/api/reviewers", reviewersPage] }),
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
  if (summaryError || transactionsError || jobFamiliesError || reviewersError) {
    const errorMessage = summaryError?.message || transactionsError?.message || jobFamiliesError?.message || reviewersError?.message;
    toast({
      title: "Error loading data",
      description: errorMessage || "Failed to load dashboard data.",
      variant: "destructive",
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <main className="flex-1 p-6">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded"></div>
              <span className="text-xl font-semibold text-gray-900">Dashboard</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <SummaryCards data={summaryData} isLoading={summaryLoading} />

        {/* Data Grids Section */}
        <div className="grid grid-cols-2 gap-8">
          {/* Left Grid - Job Family */}
          <DataGrid
            title="Job Family"
            subtitle=""
            data={jobFamiliesData?.jobFamilies}
            isLoading={jobFamiliesLoading}
            type="jobFamilies"
            pagination={jobFamiliesData ? {
              currentPage: jobFamiliesData.currentPage,
              totalPages: jobFamiliesData.totalPages,
              total: jobFamiliesData.total,
              onPageChange: setJobFamiliesPage
            } : undefined}
          />

          {/* Right Grid - Reviewer */}
          <DataGrid
            title="Reviewer"
            subtitle=""
            data={reviewersData?.reviewers}
            isLoading={reviewersLoading}
            type="reviewers"
            pagination={reviewersData ? {
              currentPage: reviewersData.currentPage,
              totalPages: reviewersData.totalPages,
              total: reviewersData.total,
              onPageChange: setReviewersPage
            } : undefined}
          />
        </div>

        {/* TO-DO Items Section */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">TO-DO ITEMS</h3>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr. No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Family</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">01.</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">10001</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Patient Care Technician</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Clinical Support</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">In Progress</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">May 29, 2025</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">👁 🗑</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">02.</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">10002</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Radiology Tech</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Clinical Support</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Not Started</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">May 29, 2025</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">👁 🗑</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">03.</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">10003</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Billing Specialist</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Revenue Cycle</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">May 29, 2025</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">👁 🗑</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">04.</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">10004</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Financial Analyst</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Finance</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">In Progress</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">May 29, 2025</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">👁 🗑</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Showing 1 to 10 of 18 entries
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  &lt;
                </Button>
                <Button variant="default" size="sm">01</Button>
                <Button variant="outline" size="sm">02</Button>
                <Button variant="outline" size="sm">
                  &gt;
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
