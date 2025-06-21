import { useState } from "react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Bell, Check, X, Clock, AlertCircle, Info, CheckCircle, FileSpreadsheet, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import * as XLSX from 'xlsx';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: string;
  read: boolean;
  priority: "high" | "medium" | "low";
  category: string;
}

export default function Notifications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'timestamp' | 'title' | 'type' | 'priority'>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Sample notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "New Job Submitted",
      message: "Radiology Tech position (10002) has been submitted for review by Michael Chen",
      type: "info",
      timestamp: "2025-06-21 12:15",
      read: false,
      priority: "medium",
      category: "Received"
    },
    {
      id: 2,
      title: "Feedback Pending Approval",
      message: "HR Generalist job description feedback is awaiting approval from Michelle Brown",
      type: "info",
      timestamp: "2025-06-21 09:20",
      read: false,
      priority: "low",
      category: "Received"
    },
    {
      id: 3,
      title: "Job Description Completed",
      message: "IT Support Technician position (10007) has been successfully completed and approved",
      type: "success",
      timestamp: "2025-06-20 16:30",
      read: true,
      priority: "low",
      category: "Received"
    },
    {
      id: 4,
      title: "Reviewer Assignment",
      message: "You have been assigned as reviewer for Pharmacy Tech position (10008)",
      type: "info",
      timestamp: "2025-06-20 11:30",
      read: true,
      priority: "medium",
      category: "Received"
    },
    {
      id: 5,
      title: "System Maintenance Scheduled",
      message: "System maintenance is scheduled for June 22, 2025 from 2:00 AM to 4:00 AM EST",
      type: "warning",
      timestamp: "2025-06-19 14:00",
      read: false,
      priority: "high",
      category: "System"
    },
    {
      id: 6,
      title: "New User Registration",
      message: "Sarah Johnson has registered and requires account approval",
      type: "info",
      timestamp: "2025-06-19 10:45",
      read: true,
      priority: "medium",
      category: "Admin"
    },
    {
      id: 7,
      title: "Job Family Updated",
      message: "Clinical Support job family has been updated with new requirements",
      type: "info",
      timestamp: "2025-06-18 15:20",
      read: false,
      priority: "low",
      category: "Update"
    },
    {
      id: 8,
      title: "Review Deadline Approaching",
      message: "Nursing Supervisor position (10045) review is due in 2 days",
      type: "warning",
      timestamp: "2025-06-18 08:30",
      read: false,
      priority: "high",
      category: "Deadline"
    },
    {
      id: 9,
      title: "Password Reset Request",
      message: "User David Miller has requested a password reset",
      type: "info",
      timestamp: "2025-06-17 13:15",
      read: true,
      priority: "low",
      category: "Security"
    },
    {
      id: 10,
      title: "Bulk Import Completed",
      message: "Successfully imported 25 new job descriptions from HR department",
      type: "success",
      timestamp: "2025-06-17 11:00",
      read: true,
      priority: "medium",
      category: "Import"
    },
    {
      id: 11,
      title: "Active Directory Sync",
      message: "Active Directory synchronization completed successfully with 147 users updated",
      type: "success",
      timestamp: "2025-06-16 09:00",
      read: false,
      priority: "medium",
      category: "System"
    },
    {
      id: 12,
      title: "Job Description Rejected",
      message: "Medical Assistant position (10033) has been rejected and requires revision",
      type: "error",
      timestamp: "2025-06-16 14:22",
      read: false,
      priority: "high",
      category: "Rejection"
    },
    {
      id: 13,
      title: "Approval Required",
      message: "Emergency Room Nurse position (10067) is pending your approval",
      type: "warning",
      timestamp: "2025-06-15 16:45",
      read: true,
      priority: "high",
      category: "Approval"
    },
    {
      id: 14,
      title: "Database Backup Completed",
      message: "Weekly database backup completed successfully at 3:00 AM",
      type: "success",
      timestamp: "2025-06-15 03:05",
      read: true,
      priority: "low",
      category: "System"
    },
    {
      id: 15,
      title: "New Comment Added",
      message: "Jennifer Williams added a comment to Physical Therapist position (10089)",
      type: "info",
      timestamp: "2025-06-14 12:30",
      read: false,
      priority: "low",
      category: "Comment"
    },
    {
      id: 16,
      title: "Role Assignment Changed",
      message: "Michael Roberts has been assigned as primary reviewer for Laboratory Department",
      type: "info",
      timestamp: "2025-06-14 09:15",
      read: true,
      priority: "medium",
      category: "Admin"
    },
    {
      id: 17,
      title: "Document Upload Failed",
      message: "Failed to upload attachment for Pharmacist position (10112) - file size exceeds limit",
      type: "error",
      timestamp: "2025-06-13 14:55",
      read: false,
      priority: "medium",
      category: "Error"
    },
    {
      id: 18,
      title: "Training Reminder",
      message: "Mandatory compliance training is due by June 30, 2025",
      type: "warning",
      timestamp: "2025-06-13 08:00",
      read: true,
      priority: "medium",
      category: "Training"
    },
    {
      id: 19,
      title: "Version Comparison Requested",
      message: "Comparison requested between versions 1.2 and 1.3 of Surgical Technician position",
      type: "info",
      timestamp: "2025-06-12 15:40",
      read: false,
      priority: "low",
      category: "Comparison"
    },
    {
      id: 20,
      title: "Email Configuration Updated",
      message: "SMTP settings have been updated for notification delivery",
      type: "success",
      timestamp: "2025-06-12 10:20",
      read: true,
      priority: "low",
      category: "Configuration"
    },
    {
      id: 21,
      title: "Duplicate Job Detected",
      message: "Potential duplicate detected: Registered Nurse positions (10056 and 10124)",
      type: "warning",
      timestamp: "2025-06-11 13:25",
      read: false,
      priority: "medium",
      category: "Duplicate"
    },
    {
      id: 22,
      title: "Export Completed",
      message: "Job family export to Excel completed - 177 records exported",
      type: "success",
      timestamp: "2025-06-11 11:10",
      read: true,
      priority: "low",
      category: "Export"
    },
    {
      id: 23,
      title: "Security Alert",
      message: "Multiple failed login attempts detected for user admin@adventhealth.com",
      type: "error",
      timestamp: "2025-06-10 17:30",
      read: false,
      priority: "high",
      category: "Security"
    },
    {
      id: 24,
      title: "Job Description Archived",
      message: "Outdated Respiratory Therapist position (10098) has been archived",
      type: "info",
      timestamp: "2025-06-10 14:15",
      read: true,
      priority: "low",
      category: "Archive"
    },
    {
      id: 25,
      title: "Workflow Updated",
      message: "Approval workflow has been updated to include additional review steps",
      type: "info",
      timestamp: "2025-06-09 16:00",
      read: false,
      priority: "medium",
      category: "Workflow"
    },
    {
      id: 26,
      title: "License Renewal Reminder",
      message: "SSL certificate expires in 30 days - renewal required",
      type: "warning",
      timestamp: "2025-06-09 09:00",
      read: true,
      priority: "high",
      category: "License"
    },
    {
      id: 27,
      title: "Performance Report",
      message: "Monthly system performance report is available for review",
      type: "info",
      timestamp: "2025-06-08 08:30",
      read: false,
      priority: "low",
      category: "Report"
    },
    {
      id: 28,
      title: "Integration Success",
      message: "Successfully integrated with new HR management system",
      type: "success",
      timestamp: "2025-06-07 12:45",
      read: true,
      priority: "medium",
      category: "Integration"
    },
    {
      id: 29,
      title: "Comment Resolved",
      message: "All comments for Occupational Therapist position (10134) have been addressed",
      type: "success",
      timestamp: "2025-06-07 10:20",
      read: false,
      priority: "low",
      category: "Resolution"
    },
    {
      id: 30,
      title: "Maintenance Window",
      message: "Scheduled maintenance completed - all systems operational",
      type: "success",
      timestamp: "2025-06-06 05:00",
      read: true,
      priority: "medium",
      category: "Maintenance"
    },
    {
      id: 31,
      title: "User Access Granted",
      message: "Emma Sullivan has been granted access to Behavioral Health job family",
      type: "info",
      timestamp: "2025-06-05 14:30",
      read: false,
      priority: "medium",
      category: "Access"
    },
    {
      id: 32,
      title: "Audit Log Cleared",
      message: "Audit logs older than 90 days have been automatically archived",
      type: "info",
      timestamp: "2025-06-05 02:00",
      read: true,
      priority: "low",
      category: "Audit"
    },
    {
      id: 33,
      title: "Template Updated",
      message: "Job description template has been updated with new compliance requirements",
      type: "info",
      timestamp: "2025-06-04 15:45",
      read: false,
      priority: "medium",
      category: "Template"
    },
    {
      id: 34,
      title: "Backup Verification",
      message: "Backup integrity verification completed successfully",
      type: "success",
      timestamp: "2025-06-04 04:00",
      read: true,
      priority: "low",
      category: "Backup"
    },
    {
      id: 35,
      title: "Holiday Schedule",
      message: "System will operate on reduced hours during Independence Day weekend",
      type: "info",
      timestamp: "2025-06-03 10:00",
      read: false,
      priority: "low",
      category: "Schedule"
    },
    {
      id: 36,
      title: "Feature Request",
      message: "Request received for bulk editing functionality in job descriptions",
      type: "info",
      timestamp: "2025-06-02 13:20",
      read: true,
      priority: "low",
      category: "Request"
    },
    {
      id: 37,
      title: "Data Migration Complete",
      message: "Legacy job data migration completed - 245 records processed",
      type: "success",
      timestamp: "2025-06-01 18:00",
      read: false,
      priority: "medium",
      category: "Migration"
    },
    {
      id: 38,
      title: "Session Timeout Warning",
      message: "User sessions will timeout after 4 hours of inactivity starting June 25",
      type: "warning",
      timestamp: "2025-05-31 11:15",
      read: true,
      priority: "medium",
      category: "Policy"
    },
    {
      id: 39,
      title: "API Rate Limit",
      message: "API rate limit has been increased to 1000 requests per hour",
      type: "info",
      timestamp: "2025-05-30 16:30",
      read: false,
      priority: "low",
      category: "API"
    },
    {
      id: 40,
      title: "Compliance Check",
      message: "All job descriptions have passed the quarterly compliance review",
      type: "success",
      timestamp: "2025-05-29 14:00",
      read: true,
      priority: "medium",
      category: "Compliance"
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "error":
        return <X className="w-4 h-4 text-red-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "info":
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "info":
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAsUnread = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: false } : notification
      )
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  // Excel export function
  const exportToExcel = () => {
    // Get all sorted notifications data
    const dataToExport = sortedNotifications.map(notification => ({
      'ID': notification.id,
      'Title': notification.title,
      'Message': notification.message,
      'Type': notification.type,
      'Category': notification.category,
      'Priority': notification.priority,
      'Status': notification.read ? 'Read' : 'Unread',
      'Timestamp': notification.timestamp
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataToExport);

    // Set column widths
    const colWidths = [
      { wch: 8 },  // ID
      { wch: 30 }, // Title
      { wch: 50 }, // Message
      { wch: 12 }, // Type
      { wch: 15 }, // Category
      { wch: 12 }, // Priority
      { wch: 12 }, // Status
      { wch: 18 }  // Timestamp
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Notifications');

    // Generate filename with current date
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const filename = `Notifications_Export_${dateStr}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  // Sorting function
  const handleSort = (field: 'timestamp' | 'title' | 'type' | 'priority') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getSortIcon = (field: 'timestamp' | 'title' | 'type' | 'priority') => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || notification.type === typeFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "read" && notification.read) ||
                         (statusFilter === "unread" && !notification.read);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Sorting
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'timestamp':
        aValue = new Date(a.timestamp);
        bValue = new Date(b.timestamp);
        break;
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'priority':
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedNotifications.length / 10);
  const startIndex = (currentPage - 1) * 10;
  const paginatedNotifications = sortedNotifications.slice(startIndex, startIndex + 10);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            {/* Filters and Search */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 mr-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search by title, message, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button onClick={markAllAsRead} variant="outline">
                <Check className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            </div>

            {/* Additional Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                <div className="w-full lg:w-48">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full lg:w-48">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div className="mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportToExcel}
                className="flex items-center space-x-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export to Excel</span>
              </Button>
            </div>

            {/* Notifications List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications ({sortedNotifications.length})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {notification.category}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {notification.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {notification.read ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsUnread(notification.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Mark Unread
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {paginatedNotifications.length === 0 && (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No notifications found matching your criteria.</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Showing {startIndex + 1} to {Math.min(startIndex + 10, sortedNotifications.length)} of {sortedNotifications.length} notifications
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Previous Group Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentGroup = Math.floor((currentPage - 1) / 5);
                          if (currentGroup > 0) {
                            const newPage = (currentGroup - 1) * 5 + 1;
                            setCurrentPage(newPage);
                          }
                        }}
                        disabled={Math.floor((currentPage - 1) / 5) === 0}
                        className="px-2 py-1"
                      >
                        ‹
                      </Button>
                      
                      {/* Dynamic cycling page buttons */}
                      {(() => {
                        const getVisiblePages = () => {
                          if (totalPages <= 5) {
                            return Array.from({ length: totalPages }, (_, i) => i + 1);
                          }
                          
                          // Calculate which group of 5 the current page belongs to
                          const currentGroup = Math.floor((currentPage - 1) / 5);
                          const groupStart = currentGroup * 5 + 1;
                          const groupEnd = Math.min(groupStart + 4, totalPages);
                          
                          return Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i);
                        };
                        
                        const visiblePages = getVisiblePages();
                        
                        return visiblePages.map((pageNum) => (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="px-3 py-1 min-w-[2rem]"
                          >
                            {pageNum}
                          </Button>
                        ));
                      })()}
                      
                      {/* Next Group Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentGroup = Math.floor((currentPage - 1) / 5);
                          const maxGroup = Math.floor((totalPages - 1) / 5);
                          if (currentGroup < maxGroup) {
                            const newPage = (currentGroup + 1) * 5 + 1;
                            setCurrentPage(newPage);
                          }
                        }}
                        disabled={Math.floor((currentPage - 1) / 5) === Math.floor((totalPages - 1) / 5)}
                        className="px-2 py-1"
                      >
                        ›
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}