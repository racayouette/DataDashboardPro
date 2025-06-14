import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RefreshCw, Search, Bell, X, Trash2, LayoutDashboard, Lock, Eye, EyeOff } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { SummaryCards } from "@/components/summary-cards";
import { DataGrid } from "@/components/data-grid";
import { MiniBarChart } from "@/components/mini-bar-chart";

import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import type { DashboardSummary, Transaction, JobFamily, Reviewer } from "@shared/schema";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [jobFamiliesPage, setJobFamiliesPage] = useState(1);
  const [reviewersPage, setReviewersPage] = useState(1);
  const [selectedJobFamily, setSelectedJobFamily] = useState<JobFamily | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [jobFamilySearch, setJobFamilySearch] = useState("");
  const [reviewerSearch, setReviewerSearch] = useState("");
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Password protection state - check sessionStorage for existing authentication
  const [isPasswordProtected, setIsPasswordProtected] = useState(() => {
    return !sessionStorage.getItem('dashboardAuthenticated');
  });
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Sample notifications
  const [notifications, setNotifications] = useState([
    "Review deadline approaching",
    "New job submitted", 
    "Status update required",
    "Feedback pending approval"
  ]);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Handle password submission
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Welcome123") {
      setIsPasswordProtected(false);
      setPasswordError("");
      // Store authentication state in sessionStorage
      sessionStorage.setItem('dashboardAuthenticated', 'true');
    } else {
      setPasswordError("Incorrect password");
      setPassword("");
    }
  };

  // Handle dialog close - redirect to Jobs Family page
  const handleDialogClose = () => {
    setLocation("/jobs-family");
  };

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
    select: (data) => ({
      ...data,
      jobFamilies: data.jobFamilies.sort((a, b) => a.jobFamily.localeCompare(b.jobFamily))
    })
  });

  const {
    data: reviewersData,
    isLoading: reviewersLoading,
    error: reviewersError,
  } = useQuery<{ reviewers: Reviewer[], total: number, totalPages: number, currentPage: number }>({
    queryKey: ["/api/reviewers", reviewersPage],
    queryFn: () => fetch(`/api/reviewers?page=${reviewersPage}&limit=4`).then(res => res.json()),
    select: (data) => ({
      ...data,
      reviewers: data.reviewers.sort((a, b) => b.completed - a.completed)
    })
  });

  // Filter data based on search terms
  const filteredJobFamilies = jobFamiliesData?.jobFamilies?.filter((jobFamily: JobFamily) => {
    if (jobFamilySearch === "") return true;
    return jobFamily.jobFamily.toLowerCase().includes(jobFamilySearch.toLowerCase()) ||
           (jobFamily.description && jobFamily.description.toLowerCase().includes(jobFamilySearch.toLowerCase()));
  }) || [];

  const filteredReviewers = reviewersData?.reviewers?.filter((reviewer: Reviewer) => {
    if (reviewerSearch === "") return true;
    return (reviewer.fullName && reviewer.fullName.toLowerCase().includes(reviewerSearch.toLowerCase())) ||
           (reviewer.email && reviewer.email.toLowerCase().includes(reviewerSearch.toLowerCase())) ||
           (reviewer.username && reviewer.username.toLowerCase().includes(reviewerSearch.toLowerCase())) ||
           (reviewer.jobFamily && reviewer.jobFamily.toLowerCase().includes(reviewerSearch.toLowerCase())) ||
           (reviewer.responsible && reviewer.responsible.toLowerCase().includes(reviewerSearch.toLowerCase()));
  }) || [];

  const handleJobFamilyClick = (jobFamily: JobFamily) => {
    setSelectedJobFamily(jobFamily);
  };

  const clearFilter = () => {
    setSelectedJobFamily(null);
  };

  const getFilteredSummary = (): DashboardSummary | undefined => {
    if (!summaryData || !selectedJobFamily) return summaryData;
    
    // Calculate filtered totals based on selected job family
    const filteredSummary: DashboardSummary = {
      ...summaryData,
      totalUsers: selectedJobFamily.totalJobs,
      revenue: (selectedJobFamily.jobsReviewed * 4500).toString(), // Approximate value per job
      orders: selectedJobFamily.totalJobs - selectedJobFamily.jobsReviewed, // In progress jobs
      growthRate: ((selectedJobFamily.jobsReviewed / selectedJobFamily.totalJobs) * 100).toFixed(1) + "%"
    };
    
    return filteredSummary;
  };

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
      
      {/* Show password dialog if protected */}
      {isPasswordProtected ? (
        <main className="flex-1 flex items-center justify-center">
          <Dialog open={true} onOpenChange={handleDialogClose}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <div className="flex items-center space-x-2 mb-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <DialogTitle>Dashboard Access Required</DialogTitle>
                </div>
                <DialogDescription>
                  Please enter the password to access the Dashboard
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pr-10 ${passwordError ? "border-red-500" : ""}`}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  Access Dashboard
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      ) : (
        <main className="flex-1 p-6">
        {/* Beta Banner */}
        <div className="mb-4 bg-orange-100 border border-orange-300 text-orange-800 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-center">
            <span className="font-semibold text-sm">⚠️ PRE-PROD RELEASE BETA 1.0</span>
          </div>
        </div>

        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">Dashboard</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="w-6 h-6 text-gray-600" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{notifications.length}</span>
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification, index) => (
                      <div
                        key={index}
                        className="p-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 cursor-pointer">
                            <p className="text-sm text-gray-700">{notification}</p>
                            <p className="text-xs text-gray-400 mt-1">Just now</p>
                          </div>
                          <button
                            className="ml-2 p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-500 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotifications(prev => prev.filter((_, i) => i !== index));
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-100">
                    <Link 
                      href="/notifications"
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
                      onClick={() => setShowNotifications(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter indicator and clear button */}
        {selectedJobFamily && (
          <div className="mb-6 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-900">
                Filtered by: {selectedJobFamily.jobFamily}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilter}
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filter
            </Button>
          </div>
        )}

        {/* Summary Cards */}
        <SummaryCards data={getFilteredSummary()} isLoading={summaryLoading} variant="default" />
        
        {/* Second Row of Summary Cards with Mini Chart */}
        <div className="mt-6 grid grid-cols-4 gap-6">
          <div className="col-span-2">
            <SummaryCards data={getFilteredSummary()} isLoading={summaryLoading} variant="second" />
          </div>
          <div className="col-span-1">
            <MiniBarChart data={getFilteredSummary()} isLoading={summaryLoading} />
          </div>
          <div className="col-span-1">
            {/* Empty space for alignment */}
          </div>
        </div>

        {/* Data Grids Section */}
        <div className="grid grid-cols-2 gap-8">
          {/* Job Family Grid */}
          <DataGrid
            title="Job Family"
            subtitle=""
            data={jobFamiliesData?.jobFamilies}
            isLoading={jobFamiliesLoading}
            type="jobFamilies"
            onJobFamilyClick={handleJobFamilyClick}
            reviewersData={reviewersData?.reviewers}
            searchValue={jobFamilySearch}
            onSearchChange={setJobFamilySearch}
            pagination={jobFamiliesData ? {
              currentPage: jobFamiliesData.currentPage,
              totalPages: jobFamiliesData.totalPages,
              total: jobFamiliesData.total,
              onPageChange: setJobFamiliesPage
            } : undefined}
          />

          {/* Reviewer Grid */}
          <DataGrid
            title="Reviewer"
            subtitle=""
            data={reviewersData?.reviewers}
            isLoading={reviewersLoading}
            type="reviewers"
            searchValue={reviewerSearch}
            onSearchChange={setReviewerSearch}
            pagination={reviewersData ? {
              currentPage: reviewersData.currentPage,
              totalPages: reviewersData.totalPages,
              total: reviewersData.total,
              onPageChange: setReviewersPage
            } : undefined}
          />
        </div>
        </main>
      )}
    </div>
  );
}
