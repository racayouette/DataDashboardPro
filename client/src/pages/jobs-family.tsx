import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter, Eye, Trash2, Bell } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";

interface JobEntry {
  id: number;
  srNo: string;
  jobCode: string;
  jobTitle: string;
  jobFamily: string;
  level: number;
  status: "In Progress" | "Not Started" | "Completed";
  lastUpdated: string;
}

export default function JobsFamily() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Sample data based on the image
  const jobEntries: JobEntry[] = [
    {
      id: 1,
      srNo: "01.",
      jobCode: "10001",
      jobTitle: "Patient Care Technician",
      jobFamily: "Clinical Support",
      level: 1,
      status: "In Progress",
      lastUpdated: "May 29, 2025"
    },
    {
      id: 2,
      srNo: "02.",
      jobCode: "10002",
      jobTitle: "Radiology Tech",
      jobFamily: "Clinical Support",
      level: 2,
      status: "Not Started",
      lastUpdated: "May 29, 2025"
    },
    {
      id: 3,
      srNo: "03.",
      jobCode: "10003",
      jobTitle: "Billing Specialist",
      jobFamily: "Revenue Cycle",
      level: 2,
      status: "Completed",
      lastUpdated: "May 29, 2025"
    },
    {
      id: 4,
      srNo: "04.",
      jobCode: "10004",
      jobTitle: "Financial Analyst",
      jobFamily: "Finance",
      level: 1,
      status: "In Progress",
      lastUpdated: "May 29, 2025"
    },
    {
      id: 5,
      srNo: "05.",
      jobCode: "10005",
      jobTitle: "Nurse Practitioner",
      jobFamily: "Clinical Support",
      level: 3,
      status: "In Progress",
      lastUpdated: "May 29, 2025"
    },
    {
      id: 6,
      srNo: "06.",
      jobCode: "10006",
      jobTitle: "HR Generalist",
      jobFamily: "Human Resources",
      level: 2,
      status: "Not Started",
      lastUpdated: "May 29, 2025"
    },
    {
      id: 7,
      srNo: "07.",
      jobCode: "10007",
      jobTitle: "IT Support Technician",
      jobFamily: "IT Services",
      level: 1,
      status: "Completed",
      lastUpdated: "May 29, 2025"
    },
    {
      id: 8,
      srNo: "08.",
      jobCode: "10008",
      jobTitle: "Pharmacy Tech",
      jobFamily: "Pharmacy",
      level: 2,
      status: "In Progress",
      lastUpdated: "May 29, 2025"
    },
    {
      id: 9,
      srNo: "09.",
      jobCode: "10009",
      jobTitle: "Lab Assistant",
      jobFamily: "Lab Services",
      level: 3,
      status: "In Progress",
      lastUpdated: "May 29, 2025"
    },
    {
      id: 10,
      srNo: "10.",
      jobCode: "10010",
      jobTitle: "Social Worker",
      jobFamily: "Behavioral Health",
      level: 1,
      status: "Not Started",
      lastUpdated: "May 29, 2025"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Not Started":
        return "bg-red-100 text-red-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredEntries = jobEntries.filter(entry =>
    entry.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.jobFamily.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.jobCode.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredEntries.length / 10);
  const startIndex = (currentPage - 1) * 10;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + 10);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <span className="text-gray-500">Job Family</span>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="w-5 h-5 text-gray-500" />
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">1</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" size="sm">
                  Select Job Family
                </Button>
                <Button variant="outline" size="sm">
                  Select Status
                </Button>
                <Button variant="outline" size="sm">
                  Last Updated
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Sr. No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Job Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Job Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Job Family</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Last Updated</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.srNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.jobCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.jobTitle}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.jobFamily}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.level}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(entry.status)}`}>
                          {entry.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.lastUpdated}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        <div className="flex space-x-2">
                          <Eye className="w-4 h-4 cursor-pointer hover:text-gray-600" />
                          <Trash2 className="w-4 h-4 cursor-pointer hover:text-red-600" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Showing 1 to {Math.min(10, filteredEntries.length)} of {filteredEntries.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  &lt;
                </Button>
                <Button
                  variant={currentPage === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                >
                  01
                </Button>
                {totalPages > 1 && (
                  <Button
                    variant={currentPage === 2 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(2)}
                  >
                    02
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
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