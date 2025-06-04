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
  reviewer: string;
  responsible: string;
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
    { id: 1, jobCode: "10001", jobTitle: "Patient Care Technician", jobFamily: "Clinical Support", reviewer: "Sarah Martinez", responsible: "Jennifer Collins", status: "In Progress", lastUpdated: "June 15, 2025" },
    { id: 2, jobCode: "10002", jobTitle: "Radiology Tech", jobFamily: "Clinical Support", reviewer: "Michael Chen", responsible: "Robert Wilson", status: "Not Started", lastUpdated: "January 8, 2025" },
    { id: 3, jobCode: "10003", jobTitle: "Billing Specialist", jobFamily: "Revenue Cycle", reviewer: "Lisa Anderson", responsible: "David Thompson", status: "Completed", lastUpdated: "March 22, 2025" },
    { id: 4, jobCode: "10004", jobTitle: "Financial Analyst", jobFamily: "Finance", reviewer: "Mark Johnson", responsible: "Susan Davis", status: "In Progress", lastUpdated: "May 10, 2025" },
    { id: 5, jobCode: "10005", jobTitle: "Nurse Practitioner", jobFamily: "Clinical Support", reviewer: "Emily Rodriguez", responsible: "Patricia Miller", status: "In Progress", lastUpdated: "April 18, 2025" },
    { id: 6, jobCode: "10006", jobTitle: "HR Generalist", jobFamily: "Human Resources", reviewer: "Michelle Brown", responsible: "Kevin Garcia", status: "Not Started", lastUpdated: "February 14, 2025" },
    { id: 7, jobCode: "10007", jobTitle: "IT Support Technician", jobFamily: "IT Services", reviewer: "Alex Wang", responsible: "Carlos Martinez", status: "Completed", lastUpdated: "June 3, 2025" },
    { id: 8, jobCode: "10008", jobTitle: "Pharmacy Tech", jobFamily: "Pharmacy", reviewer: "Rachel Kim", responsible: "Amanda Wilson", status: "In Progress", lastUpdated: "March 5, 2025" },
    { id: 9, jobCode: "10009", jobTitle: "Lab Assistant", jobFamily: "Lab Services", reviewer: "James Lee", responsible: "Nicole Taylor", status: "In Progress", lastUpdated: "January 30, 2025" },
    { id: 10, jobCode: "10010", jobTitle: "Social Worker", jobFamily: "Behavioral Health", reviewer: "Maria Gonzalez", responsible: "Thomas Anderson", status: "Not Started", lastUpdated: "June 28, 2025" },
    { id: 11, jobCode: "10011", jobTitle: "Medical Assistant", jobFamily: "Clinical Support", reviewer: "William Davis", responsible: "Linda Johnson", status: "In Progress", lastUpdated: "May 22, 2025" },
    { id: 12, jobCode: "10012", jobTitle: "Revenue Cycle Analyst", jobFamily: "Revenue Cycle", reviewer: "Helen Clark", responsible: "Brian Wilson", status: "Completed", lastUpdated: "April 12, 2025" },
    { id: 13, jobCode: "10013", jobTitle: "Physical Therapist", jobFamily: "Clinical Support", reviewer: "Jennifer White", responsible: "Michael Brown", status: "Not Started", lastUpdated: "March 8, 2025" },
    { id: 14, jobCode: "10014", jobTitle: "Clinical Coordinator", jobFamily: "Clinical Support", reviewer: "Steven Miller", responsible: "Angela Martinez", status: "In Progress", lastUpdated: "June 5, 2025" },
    { id: 15, jobCode: "10015", jobTitle: "Security Officer", jobFamily: "Security", reviewer: "Paul Rodriguez", responsible: "Christine Lee", status: "Completed", lastUpdated: "February 28, 2025" },
    { id: 16, jobCode: "10016", jobTitle: "Quality Assurance Specialist", jobFamily: "Quality", reviewer: "Sandra Young", responsible: "Daniel Garcia", status: "In Progress", lastUpdated: "May 15, 2025" },
    { id: 17, jobCode: "10017", jobTitle: "Respiratory Therapist", jobFamily: "Clinical Support", reviewer: "Robert Taylor", responsible: "Mary Thompson", status: "Not Started", lastUpdated: "January 20, 2025" },
    { id: 18, jobCode: "10018", jobTitle: "Dietician", jobFamily: "Nutrition", reviewer: "Karen Lewis", responsible: "Jason Clark", status: "In Progress", lastUpdated: "April 25, 2025" },
    { id: 19, jobCode: "10019", jobTitle: "Case Manager", jobFamily: "Behavioral Health", reviewer: "Lisa Moore", responsible: "Christopher Hall", status: "Completed", lastUpdated: "March 18, 2025" },
    { id: 20, jobCode: "10020", jobTitle: "Maintenance Technician", jobFamily: "Facilities", reviewer: "Greg Phillips", responsible: "Rebecca Allen", status: "In Progress", lastUpdated: "June 10, 2025" },
    { id: 21, jobCode: "10021", jobTitle: "Environmental Services", jobFamily: "Facilities", reviewer: "Maria Santos", responsible: "Kevin Wright", status: "Not Started", lastUpdated: "February 5, 2025" },
    { id: 22, jobCode: "10022", jobTitle: "Occupational Therapist", jobFamily: "Clinical Support", reviewer: "Nancy Lopez", responsible: "Timothy King", status: "In Progress", lastUpdated: "May 8, 2025" },
    { id: 23, jobCode: "10023", jobTitle: "Registration Clerk", jobFamily: "Patient Access", reviewer: "Sharon Adams", responsible: "Brandon Scott", status: "Completed", lastUpdated: "April 2, 2025" },
    { id: 24, jobCode: "10024", jobTitle: "Surgical Technician", jobFamily: "Clinical Support", reviewer: "Jeffrey Green", responsible: "Melissa Torres", status: "In Progress", lastUpdated: "June 12, 2025" },
    { id: 25, jobCode: "10025", jobTitle: "Emergency Room Clerk", jobFamily: "Patient Access", reviewer: "Linda Baker", responsible: "Jacob Rivera", status: "Not Started", lastUpdated: "March 15, 2025" },
    { id: 26, jobCode: "10026", jobTitle: "Infection Control Specialist", jobFamily: "Quality", reviewer: "Patricia Nelson", responsible: "Ryan Cooper", status: "In Progress", lastUpdated: "May 20, 2025" },
    { id: 27, jobCode: "10027", jobTitle: "Medical Records Clerk", jobFamily: "Health Information", reviewer: "Carol Mitchell", responsible: "Anthony Reed", status: "Completed", lastUpdated: "February 18, 2025" },
    { id: 28, jobCode: "10028", jobTitle: "Chaplain", jobFamily: "Spiritual Care", reviewer: "Margaret Carter", responsible: "Nicholas Bailey", status: "In Progress", lastUpdated: "April 30, 2025" },
    { id: 29, jobCode: "10029", jobTitle: "Transport Aide", jobFamily: "Patient Support", reviewer: "John Howard", responsible: "Victoria Cox", status: "Not Started", lastUpdated: "January 25, 2025" },
    { id: 30, jobCode: "10030", jobTitle: "Ultrasound Technician", jobFamily: "Clinical Support", reviewer: "Barbara Ward", responsible: "Stephen Richardson", status: "In Progress", lastUpdated: "June 8, 2025" },
    { id: 31, jobCode: "10031", jobTitle: "Chief Medical Officer", jobFamily: "Leadership", reviewer: "Board of Directors", responsible: "Executive Team", status: "Completed", lastUpdated: "March 25, 2025" },
    { id: 32, jobCode: "10032", jobTitle: "Compliance Officer", jobFamily: "Legal", reviewer: "Janet Price", responsible: "Matthew Foster", status: "In Progress", lastUpdated: "May 18, 2025" },
    { id: 33, jobCode: "10033", jobTitle: "Wound Care Specialist", jobFamily: "Clinical Support", reviewer: "Dorothy Gray", responsible: "Andrew Powell", status: "Not Started", lastUpdated: "February 8, 2025" },
    { id: 34, jobCode: "10034", jobTitle: "Pediatric Nurse", jobFamily: "Clinical Support", reviewer: "Helen Evans", responsible: "Samantha Hughes", status: "In Progress", lastUpdated: "April 22, 2025" },
    { id: 35, jobCode: "10035", jobTitle: "Anesthesia Technician", jobFamily: "Clinical Support", reviewer: "Edward Butler", responsible: "Rachel Flores", status: "Completed", lastUpdated: "March 10, 2025" },
    { id: 36, jobCode: "10036", jobTitle: "Clinical Pharmacist", jobFamily: "Pharmacy", reviewer: "Ruth Coleman", responsible: "Justin Washington", status: "In Progress", lastUpdated: "June 1, 2025" },
    { id: 37, jobCode: "10037", jobTitle: "Patient Financial Counselor", jobFamily: "Revenue Cycle", reviewer: "Deborah Jenkins", responsible: "Eric Simmons", status: "Not Started", lastUpdated: "January 15, 2025" },
    { id: 38, jobCode: "10038", jobTitle: "ICU Nurse", jobFamily: "Clinical Support", reviewer: "Frances Perry", responsible: "Jesse Henderson", status: "In Progress", lastUpdated: "May 12, 2025" },
    { id: 39, jobCode: "10039", jobTitle: "Biomedical Technician", jobFamily: "IT Services", reviewer: "Gary Russell", responsible: "Kimberly Patterson", status: "Completed", lastUpdated: "April 5, 2025" },
    { id: 40, jobCode: "10040", jobTitle: "Health Information Manager", jobFamily: "Health Information", reviewer: "Diana Brooks", responsible: "Sean Alexander", status: "In Progress", lastUpdated: "June 18, 2025" },
    { id: 41, jobCode: "10041", jobTitle: "Cardiac Technician", jobFamily: "Clinical Support", reviewer: "Betty Griffin", responsible: "Crystal Watson", status: "Not Started", lastUpdated: "February 22, 2025" },
    { id: 42, jobCode: "10042", jobTitle: "Emergency Department Manager", jobFamily: "Leadership", reviewer: "Chief Nursing Officer", responsible: "Jonathan Kelly", status: "In Progress", lastUpdated: "May 28, 2025" },
    { id: 43, jobCode: "10043", jobTitle: "Hospice Coordinator", jobFamily: "Behavioral Health", reviewer: "Gloria Barnes", responsible: "Tyler Sanders", status: "Completed", lastUpdated: "March 12, 2025" },
    { id: 44, jobCode: "10044", jobTitle: "Sterile Processing Technician", jobFamily: "Clinical Support", reviewer: "Eugene Ross", responsible: "Lauren Wood", status: "In Progress", lastUpdated: "June 20, 2025" },
    { id: 45, jobCode: "10045", jobTitle: "Sleep Technologist", jobFamily: "Clinical Support", reviewer: "Virginia Long", responsible: "Adam Bennett", status: "Not Started", lastUpdated: "January 10, 2025" }
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
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === "" || 
      entry.jobCode.toLowerCase().includes(searchLower) ||
      entry.jobTitle.toLowerCase().includes(searchLower) ||
      entry.jobFamily.toLowerCase().includes(searchLower) ||
      entry.reviewer.toLowerCase().includes(searchLower) ||
      entry.responsible.toLowerCase().includes(searchLower) ||
      entry.status.toLowerCase().includes(searchLower) ||
      entry.lastUpdated.toLowerCase().includes(searchLower);
    
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
                    placeholder="Search job code, title, family, reviewer, responsible, status, or date..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-96"
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Reviewer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Responsible</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.reviewer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.responsible}</td>
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
                
                {/* Dynamic cycling page buttons */}
                {(() => {
                  const getVisiblePages = () => {
                    if (totalPages <= 2) {
                      return Array.from({ length: totalPages }, (_, i) => i + 1);
                    }
                    
                    // Always show 2 buttons, positioned based on current page
                    if (currentPage === 1) {
                      return [1, 2];
                    } else if (currentPage === totalPages) {
                      return [totalPages - 1, totalPages];
                    } else {
                      return [currentPage, currentPage + 1];
                    }
                  };
                  
                  return getVisiblePages().map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum.toString().padStart(2, '0')}
                    </Button>
                  ));
                })()}
                
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