import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import { Search, Filter, Bell, FilterX, ChevronDown, Calendar, Trash2, Users, ArrowUpDown, ArrowUp, ArrowDown, UserCircle } from "lucide-react";
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
  status: "In Progress" | "Not Started" | "Completed" | "Reviewed";
  lastUpdated: string;
}

export default function JobsFamily() {
  const [, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobFamily, setSelectedJobFamily] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // State for reviewer assignments - first 2 rows start as null (unset)
  const [reviewerAssignments, setReviewerAssignments] = useState<{ [key: number]: string | null }>({
    1: null, // First row - unset
    2: null, // Second row - unset
  });
  
  // Available users for reviewer assignment
  const availableUsers = [
    "John Smith",
    "Sarah Johnson", 
    "Michael Brown",
    "Emily Davis",
    "David Wilson",
    "John Mark",
    "Sarah Mitchell",
    "Kelly Johnson",
    "Robert Kennedy",
    "Adam Lambert",
    "Jennifer Williams",
    "Michael Roberts",
    "Linda Taylor",
    "David Phillips",
    "Emma Sullivan",
    "Chris Harrison"
  ];

  // Check for reviewer parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reviewerParam = urlParams.get('reviewer');
    if (reviewerParam) {
      setSearchTerm(reviewerParam);
    }
  }, []);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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

  // Sample data based on the image
  const jobEntries: JobEntry[] = [
    { id: 1, jobCode: "10001", jobTitle: "Patient Care Technician", jobFamily: "Clinical Support", reviewer: "Sarah Mitchell", responsible: "Jennifer Collins", status: "In Progress", lastUpdated: "June 15, 2025" },
    { id: 2, jobCode: "10002", jobTitle: "Radiology Tech", jobFamily: "Clinical Support", reviewer: "Kelly Johnson", responsible: "Robert Wilson", status: "Not Started", lastUpdated: "January 8, 2025" },
    { id: 3, jobCode: "10003", jobTitle: "Billing Specialist", jobFamily: "Revenue Cycle", reviewer: "Robert Kennedy", responsible: "David Thompson", status: "Reviewed", lastUpdated: "March 22, 2025" },
    { id: 4, jobCode: "10004", jobTitle: "Financial Analyst", jobFamily: "Finance", reviewer: "Adam Lambert", responsible: "Susan Davis", status: "In Progress", lastUpdated: "May 10, 2025" },
    { id: 5, jobCode: "10005", jobTitle: "Nurse Practitioner", jobFamily: "Clinical Support", reviewer: "Jennifer Williams", responsible: "Patricia Miller", status: "In Progress", lastUpdated: "April 18, 2025" },
    { id: 6, jobCode: "10006", jobTitle: "HR Generalist", jobFamily: "Human Resources", reviewer: "Michael Roberts", responsible: "Kevin Garcia", status: "Not Started", lastUpdated: "February 14, 2025" },
    { id: 7, jobCode: "10007", jobTitle: "IT Support Technician", jobFamily: "IT Services", reviewer: "Linda Taylor", responsible: "Carlos Martinez", status: "Completed", lastUpdated: "June 3, 2025" },
    { id: 8, jobCode: "10008", jobTitle: "Pharmacy Tech", jobFamily: "Pharmacy", reviewer: "David Phillips", responsible: "Amanda Wilson", status: "In Progress", lastUpdated: "March 5, 2025" },
    { id: 9, jobCode: "10009", jobTitle: "Lab Assistant", jobFamily: "Lab Services", reviewer: "Emma Sullivan", responsible: "Nicole Taylor", status: "In Progress", lastUpdated: "January 30, 2025" },
    { id: 10, jobCode: "10010", jobTitle: "Social Worker", jobFamily: "Behavioral Health", reviewer: "Chris Harrison", responsible: "Thomas Anderson", status: "Not Started", lastUpdated: "June 28, 2025" },
    { id: 11, jobCode: "10011", jobTitle: "Medical Assistant", jobFamily: "Clinical Support", reviewer: "Sarah Mitchell", responsible: "Linda Johnson", status: "In Progress", lastUpdated: "May 22, 2025" },
    { id: 12, jobCode: "10012", jobTitle: "Revenue Cycle Analyst", jobFamily: "Revenue Cycle", reviewer: "Kelly Johnson", responsible: "Brian Wilson", status: "Completed", lastUpdated: "April 12, 2025" },
    { id: 13, jobCode: "10013", jobTitle: "Physical Therapist", jobFamily: "Clinical Support", reviewer: "Robert Kennedy", responsible: "Michael Brown", status: "Not Started", lastUpdated: "March 8, 2025" },
    { id: 14, jobCode: "10014", jobTitle: "Clinical Coordinator", jobFamily: "Clinical Support", reviewer: "Adam Lambert", responsible: "Angela Martinez", status: "In Progress", lastUpdated: "June 5, 2025" },
    { id: 15, jobCode: "10015", jobTitle: "Security Officer", jobFamily: "Security", reviewer: "Jennifer Williams", responsible: "Christine Lee", status: "Completed", lastUpdated: "February 28, 2025" },
    { id: 16, jobCode: "10016", jobTitle: "Quality Assurance Specialist", jobFamily: "Quality", reviewer: "Michael Roberts", responsible: "Daniel Garcia", status: "In Progress", lastUpdated: "May 15, 2025" },
    { id: 17, jobCode: "10017", jobTitle: "Respiratory Therapist", jobFamily: "Clinical Support", reviewer: "Linda Taylor", responsible: "Mary Thompson", status: "Not Started", lastUpdated: "January 20, 2025" },
    { id: 18, jobCode: "10018", jobTitle: "Dietician", jobFamily: "Nutrition", reviewer: "David Phillips", responsible: "Jason Clark", status: "In Progress", lastUpdated: "April 25, 2025" },
    { id: 19, jobCode: "10019", jobTitle: "Case Manager", jobFamily: "Behavioral Health", reviewer: "Emma Sullivan", responsible: "Christopher Hall", status: "Completed", lastUpdated: "March 18, 2025" },
    { id: 20, jobCode: "10020", jobTitle: "Maintenance Technician", jobFamily: "Facilities", reviewer: "Chris Harrison", responsible: "Rebecca Allen", status: "In Progress", lastUpdated: "June 10, 2025" },
    { id: 21, jobCode: "10021", jobTitle: "Environmental Services", jobFamily: "Facilities", reviewer: "Sarah Mitchell", responsible: "Kevin Wright", status: "Not Started", lastUpdated: "February 5, 2025" },
    { id: 22, jobCode: "10022", jobTitle: "Occupational Therapist", jobFamily: "Clinical Support", reviewer: "Kelly Johnson", responsible: "Timothy King", status: "In Progress", lastUpdated: "May 8, 2025" },
    { id: 23, jobCode: "10023", jobTitle: "Registration Clerk", jobFamily: "Patient Access", reviewer: "Robert Kennedy", responsible: "Brandon Scott", status: "Completed", lastUpdated: "April 2, 2025" },
    { id: 24, jobCode: "10024", jobTitle: "Surgical Technician", jobFamily: "Clinical Support", reviewer: "Adam Lambert", responsible: "Melissa Torres", status: "In Progress", lastUpdated: "June 12, 2025" },
    { id: 25, jobCode: "10025", jobTitle: "Emergency Room Clerk", jobFamily: "Patient Access", reviewer: "Jennifer Williams", responsible: "Jacob Rivera", status: "Not Started", lastUpdated: "March 15, 2025" },
    { id: 26, jobCode: "10026", jobTitle: "Infection Control Specialist", jobFamily: "Quality", reviewer: "Michael Roberts", responsible: "Ryan Cooper", status: "In Progress", lastUpdated: "May 20, 2025" },
    { id: 27, jobCode: "10027", jobTitle: "Medical Records Clerk", jobFamily: "Health Information", reviewer: "Linda Taylor", responsible: "Anthony Reed", status: "Completed", lastUpdated: "February 18, 2025" },
    { id: 28, jobCode: "10028", jobTitle: "Chaplain", jobFamily: "Spiritual Care", reviewer: "David Phillips", responsible: "Nicholas Bailey", status: "In Progress", lastUpdated: "April 30, 2025" },
    { id: 29, jobCode: "10029", jobTitle: "Transport Aide", jobFamily: "Patient Support", reviewer: "Emma Sullivan", responsible: "Victoria Cox", status: "Not Started", lastUpdated: "January 25, 2025" },
    { id: 30, jobCode: "10030", jobTitle: "Ultrasound Technician", jobFamily: "Clinical Support", reviewer: "Chris Harrison", responsible: "Stephen Richardson", status: "In Progress", lastUpdated: "June 8, 2025" },
    { id: 31, jobCode: "10031", jobTitle: "Chief Medical Officer", jobFamily: "Leadership", reviewer: "Sarah Mitchell", responsible: "Executive Team", status: "Completed", lastUpdated: "March 25, 2025" },
    { id: 32, jobCode: "10032", jobTitle: "Compliance Officer", jobFamily: "Legal", reviewer: "Kelly Johnson", responsible: "Matthew Foster", status: "In Progress", lastUpdated: "May 18, 2025" },
    { id: 33, jobCode: "10033", jobTitle: "Wound Care Specialist", jobFamily: "Clinical Support", reviewer: "Robert Kennedy", responsible: "Andrew Powell", status: "Not Started", lastUpdated: "February 8, 2025" },
    { id: 34, jobCode: "10034", jobTitle: "Pediatric Nurse", jobFamily: "Clinical Support", reviewer: "Adam Lambert", responsible: "Samantha Hughes", status: "In Progress", lastUpdated: "April 22, 2025" },
    { id: 35, jobCode: "10035", jobTitle: "Anesthesia Technician", jobFamily: "Clinical Support", reviewer: "Jennifer Williams", responsible: "Rachel Flores", status: "Completed", lastUpdated: "March 10, 2025" },
    { id: 36, jobCode: "10036", jobTitle: "Clinical Pharmacist", jobFamily: "Pharmacy", reviewer: "Michael Roberts", responsible: "Justin Washington", status: "In Progress", lastUpdated: "June 1, 2025" },
    { id: 37, jobCode: "10037", jobTitle: "Patient Financial Counselor", jobFamily: "Revenue Cycle", reviewer: "Linda Taylor", responsible: "Eric Simmons", status: "Not Started", lastUpdated: "January 15, 2025" },
    { id: 38, jobCode: "10038", jobTitle: "ICU Nurse", jobFamily: "Clinical Support", reviewer: "David Phillips", responsible: "Jesse Henderson", status: "In Progress", lastUpdated: "May 12, 2025" },
    { id: 39, jobCode: "10039", jobTitle: "Biomedical Technician", jobFamily: "IT Services", reviewer: "Emma Sullivan", responsible: "Kimberly Patterson", status: "Completed", lastUpdated: "April 5, 2025" },
    { id: 40, jobCode: "10040", jobTitle: "Health Information Manager", jobFamily: "Health Information", reviewer: "Chris Harrison", responsible: "Sean Alexander", status: "In Progress", lastUpdated: "June 18, 2025" },
    { id: 41, jobCode: "10041", jobTitle: "Cardiac Technician", jobFamily: "Clinical Support", reviewer: "Sarah Mitchell", responsible: "Crystal Watson", status: "Not Started", lastUpdated: "February 22, 2025" },
    { id: 42, jobCode: "10042", jobTitle: "Emergency Department Manager", jobFamily: "Leadership", reviewer: "Kelly Johnson", responsible: "Jonathan Kelly", status: "In Progress", lastUpdated: "May 28, 2025" },
    { id: 43, jobCode: "10043", jobTitle: "Hospice Coordinator", jobFamily: "Behavioral Health", reviewer: "Robert Kennedy", responsible: "Tyler Sanders", status: "Completed", lastUpdated: "March 12, 2025" },
    { id: 44, jobCode: "10044", jobTitle: "Sterile Processing Technician", jobFamily: "Clinical Support", reviewer: "Adam Lambert", responsible: "Lauren Wood", status: "In Progress", lastUpdated: "June 20, 2025" },
    { id: 45, jobCode: "10045", jobTitle: "Sleep Technologist", jobFamily: "Clinical Support", reviewer: "Jennifer Williams", responsible: "Adam Bennett", status: "Not Started", lastUpdated: "January 10, 2025" }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Not Started":
        return "bg-red-100 text-red-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Reviewed":
        return "bg-purple-100 text-purple-800";
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

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedJobFamily("");
    setSelectedStatus("");
    setDateRange({ from: undefined, to: undefined });
    setSortBy("");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  const hasFilters = searchTerm !== "" || selectedJobFamily !== "" || selectedStatus !== "" || dateRange.from || dateRange.to;

  const totalPages = Math.ceil(filteredEntries.length / 10);
  const startIndex = (currentPage - 1) * 10;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + 10);

  // Function to handle reviewer assignment
  const handleReviewerAssignment = (entryId: number, userName: string) => {
    setReviewerAssignments(prev => ({
      ...prev,
      [entryId]: userName
    }));
  };

  // Function to get the reviewer display for a given entry
  const getReviewerDisplay = (entry: JobEntry, index: number) => {
    const actualIndex = startIndex + index + 1; // Calculate actual row number
    
    // For first 2 rows, show icon or assigned name
    if (actualIndex <= 2) {
      const assignedReviewer = reviewerAssignments[actualIndex];
      
      if (assignedReviewer) {
        return <span className="text-sm text-gray-900">{assignedReviewer}</span>;
      }
      
      // Show empty person icon dropdown
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <UserCircle className="w-4 h-4 text-gray-400 hover:text-blue-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {availableUsers.map((user) => (
              <DropdownMenuItem
                key={user}
                onClick={() => handleReviewerAssignment(actualIndex, user)}
                className="cursor-pointer"
              >
                {user}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    
    // For other rows, show original reviewer name
    return <span className="text-sm text-gray-600">{entry.reviewer}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">Jobs Family</span>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("jobCode")}
                      >
                        <span>Job Code</span>
                        {getSortIcon("jobCode")}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("jobTitle")}
                      >
                        <span>Job Title</span>
                        {getSortIcon("jobTitle")}
                      </button>
                    </th>
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
                        onClick={() => handleSort("reviewer")}
                      >
                        <span>Reviewer</span>
                        {getSortIcon("reviewer")}
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
                        onClick={() => handleSort("status")}
                      >
                        <span>Status</span>
                        {getSortIcon("status")}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("lastUpdated")}
                      >
                        <span>Last Updated</span>
                        {getSortIcon("lastUpdated")}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedEntries.map((entry, index) => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setLocation(`/editing?jobCode=${entry.jobCode}`)}
                          className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                        >
                          {entry.jobCode}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.jobTitle}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.jobFamily}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getReviewerDisplay(entry, index)}</td>
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
                      {pageNum}
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