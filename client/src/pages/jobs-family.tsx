import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Search, Filter, Bell, FilterX, ChevronDown, Calendar } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

interface JobEntry {
  id: number;
  jobCode: string;
  jobTitle: string;
  jobFamily: string;
  status: "In Progress" | "Not Started" | "Completed";
  lastUpdated: string;
}

export default function JobsFamily() {
  const [, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobFamily, setSelectedJobFamily] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Sample data based on the image
  const jobEntries: JobEntry[] = [
    {
      id: 1,
      jobCode: "10001",
      jobTitle: "Patient Care Technician",
      jobFamily: "Clinical Support",
      status: "In Progress",
      lastUpdated: "June 15, 2025"
    },
    {
      id: 2,
      jobCode: "10002",
      jobTitle: "Radiology Tech",
      jobFamily: "Clinical Support",
      status: "Not Started",
      lastUpdated: "January 8, 2025"
    },
    {
      id: 3,
      jobCode: "10003",
      jobTitle: "Billing Specialist",
      jobFamily: "Revenue Cycle",
      status: "Completed",
      lastUpdated: "March 22, 2025"
    },
    {
      id: 4,
      jobCode: "10004",
      jobTitle: "Financial Analyst",
      jobFamily: "Finance",
      status: "In Progress",
      lastUpdated: "May 10, 2025"
    },
    {
      id: 5,
      jobCode: "10005",
      jobTitle: "Nurse Practitioner",
      jobFamily: "Clinical Support",
      status: "In Progress",
      lastUpdated: "April 18, 2025"
    },
    {
      id: 6,
      jobCode: "10006",
      jobTitle: "HR Generalist",
      jobFamily: "Human Resources",
      status: "Not Started",
      lastUpdated: "February 14, 2025"
    },
    {
      id: 7,
      jobCode: "10007",
      jobTitle: "IT Support Technician",
      jobFamily: "IT Services",
      status: "Completed",
      lastUpdated: "June 3, 2025"
    },
    {
      id: 8,
      jobCode: "10008",
      jobTitle: "Pharmacy Tech",
      jobFamily: "Pharmacy",
      status: "In Progress",
      lastUpdated: "March 5, 2025"
    },
    {
      id: 9,
      jobCode: "10009",
      jobTitle: "Lab Assistant",
      jobFamily: "Lab Services",
      status: "In Progress",
      lastUpdated: "January 30, 2025"
    },
    {
      id: 10,
      jobCode: "10010",
      jobTitle: "Social Worker",
      jobFamily: "Behavioral Health",
      status: "Not Started",
      lastUpdated: "June 28, 2025"
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

  // Helper function to parse date strings
  const parseDate = (dateString: string): Date => {
    return new Date(dateString);
  };

  // Get unique job families and statuses for dropdowns
  const uniqueJobFamilies = Array.from(new Set(jobEntries.map(entry => entry.jobFamily))).sort();
  const uniqueStatuses = Array.from(new Set(jobEntries.map(entry => entry.status))).sort();

  const filteredEntries = jobEntries.filter(entry => {
    const matchesSearch = entry.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.jobFamily.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.jobCode.includes(searchTerm);
    
    const matchesJobFamily = selectedJobFamily === "" || entry.jobFamily === selectedJobFamily;
    const matchesStatus = selectedStatus === "" || entry.status === selectedStatus;
    
    // Date range filtering
    let matchesDateRange = true;
    if (dateRange.from || dateRange.to) {
      const entryDate = parseDate(entry.lastUpdated);
      if (dateRange.from && entryDate < dateRange.from) {
        matchesDateRange = false;
      }
      if (dateRange.to && entryDate > dateRange.to) {
        matchesDateRange = false;
      }
    }
    
    return matchesSearch && matchesJobFamily && matchesStatus && matchesDateRange;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedJobFamily("");
    setSelectedStatus("");
    setDateRange({ from: undefined, to: undefined });
    setCurrentPage(1);
  };

  const hasFilters = searchTerm !== "" || selectedJobFamily !== "" || selectedStatus !== "" || dateRange.from || dateRange.to;

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
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-500" />
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold leading-none scale-75">1</span>
                </div>
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearFilters}
                  disabled={!hasFilters}
                >
                  {hasFilters ? <FilterX className="w-4 h-4 mr-2" /> : <Filter className="w-4 h-4 mr-2" />}
                  {hasFilters ? "Clear Filters" : "Filters"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {selectedJobFamily || "Select Job Family"}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedJobFamily("")}>
                      All Job Families
                    </DropdownMenuItem>
                    {uniqueJobFamilies.map((jobFamily) => (
                      <DropdownMenuItem
                        key={jobFamily}
                        onClick={() => setSelectedJobFamily(jobFamily)}
                      >
                        {jobFamily}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {selectedStatus || "Select Status"}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedStatus("")}>
                      All Statuses
                    </DropdownMenuItem>
                    {uniqueStatuses.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      {dateRange.from || dateRange.to ? (
                        <>
                          {dateRange.from ? format(dateRange.from, "MMM dd") : "Start"} - {dateRange.to ? format(dateRange.to, "MMM dd") : "End"}
                        </>
                      ) : (
                        "Last Updated"
                      )}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="start">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-600">From</label>
                          <CalendarComponent
                            mode="single"
                            selected={dateRange.from}
                            onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                            disabled={(date: Date) => 
                              date > new Date() || Boolean(dateRange.to && date > dateRange.to)
                            }
                            className="scale-75 origin-top-left"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-600">To</label>
                          <CalendarComponent
                            mode="single"
                            selected={dateRange.to}
                            onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                            disabled={(date: Date) => 
                              date > new Date() || Boolean(dateRange.from && date < dateRange.from)
                            }
                            className="scale-75 origin-top-left"
                          />
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDateRange({ from: undefined, to: undefined })}
                        className="w-full text-xs"
                      >
                        Clear Dates
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Job Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Job Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Job Family</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setLocation("/editing")}
                          className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                        >
                          {entry.jobCode}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.jobTitle}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.jobFamily}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(entry.status)}`}>
                          {entry.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.lastUpdated}</td>
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