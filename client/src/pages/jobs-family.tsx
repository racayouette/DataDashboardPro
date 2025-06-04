import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { DataGrid } from "@/components/data-grid";
import type { JobFamily } from "@shared/schema";

export default function JobsFamily() {
  const [jobFamiliesPage, setJobFamiliesPage] = useState(1);

  const {
    data: jobFamiliesData,
    isLoading: jobFamiliesLoading,
    error: jobFamiliesError,
  } = useQuery<{ jobFamilies: JobFamily[], total: number, totalPages: number, currentPage: number }>({
    queryKey: ["/api/job-families", jobFamiliesPage],
    queryFn: () => fetch(`/api/job-families?page=${jobFamiliesPage}&limit=10`).then(res => res.json()),
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Jobs Family</h1>
            <p className="text-gray-600 mt-2">
              Manage and view all job families and their associated metrics
            </p>
          </div>

          {/* Jobs Family Grid */}
          <div className="max-w-4xl">
            <DataGrid
              title="All Job Families"
              subtitle="Complete list of job families with detailed metrics"
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
          </div>
        </div>
      </main>
    </div>
  );
}