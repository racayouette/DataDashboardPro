import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { DatabaseHealthMonitor } from "@/components/database-health-monitor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Bell, User, Database, Shield, Monitor, Save, RefreshCw, Search, Plus, Edit3, Trash2, UserCheck, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  jobUpdates: boolean;
  systemAlerts: boolean;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dashboardLayout: 'compact' | 'expanded';
}

interface SystemSettings {
  autoSave: boolean;
  sessionTimeout: number;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "HR Manager" | "Reviewer" | "Employee";
  department: string;
  status: "Active" | "Inactive";
  lastLogin: string;
}

interface Reviewer {
  id: number;
  jobFamily: string;
  completed: number;
  inProgress: number;
  responsible: string;
  username: string | null;
  fullName: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fetch reviewers data
  const { data: reviewersData, isLoading: reviewersLoading } = useQuery({
    queryKey: ['/api/reviewers'],
    queryFn: async () => {
      const response = await fetch('/api/reviewers');
      if (!response.ok) throw new Error('Failed to fetch reviewers');
      return response.json();
    }
  });

  // Settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: false,
    jobUpdates: true,
    systemAlerts: true,
  });

  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    theme: 'light',
    language: 'en',
    timezone: 'UTC-5',
    dashboardLayout: 'expanded',
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    autoSave: true,
    sessionTimeout: 30,
    backupFrequency: 'daily',
  });

  const [isSaving, setIsSaving] = useState(false);

  // Users management state
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "Employee",
    department: "",
    status: "Active"
  });

  // Reviewers management state
  const [reviewerSearchTerm, setReviewerSearchTerm] = useState("");
  const [showAddReviewerModal, setShowAddReviewerModal] = useState(false);
  const [showEditReviewerModal, setShowEditReviewerModal] = useState(false);
  const [showDeleteReviewerDialog, setShowDeleteReviewerDialog] = useState(false);
  const [editingReviewer, setEditingReviewer] = useState<Reviewer | null>(null);
  const [reviewerToDelete, setReviewerToDelete] = useState<Reviewer | null>(null);
  const [reviewerSortBy, setReviewerSortBy] = useState<string>("");
  const [reviewerSortOrder, setReviewerSortOrder] = useState<"asc" | "desc">("asc");
  const [newReviewer, setNewReviewer] = useState<Partial<Reviewer>>({
    jobFamily: "",
    responsible: "",
    completed: 0,
    inProgress: 0,
    username: "",
    fullName: "",
    email: ""
  });

  // Sample user data
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@company.com",
      role: "Admin",
      department: "IT",
      status: "Active",
      lastLogin: "June 4, 2025"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      role: "HR Manager",
      department: "Human Resources",
      status: "Active",
      lastLogin: "June 3, 2025"
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "michael.brown@company.com",
      role: "Reviewer",
      department: "Operations",
      status: "Active",
      lastLogin: "June 2, 2025"
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.davis@company.com",
      role: "Employee",
      department: "Marketing",
      status: "Inactive",
      lastLogin: "May 30, 2025"
    },
    {
      id: 5,
      name: "David Wilson",
      email: "david.wilson@company.com",
      role: "Reviewer",
      department: "Quality Assurance",
      status: "Active",
      lastLogin: "June 1, 2025"
    },
    {
      id: 6,
      name: "John Mark",
      email: "john.mark@company.com",
      role: "Admin",
      department: "Executive",
      status: "Active",
      lastLogin: "June 5, 2025"
    }
  ]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'users', label: 'Users', icon: User },
    { id: 'reviewers', label: 'Reviewers', icon: UserCheck },
    { id: 'responsible', label: 'Responsible', icon: Shield },
    { id: 'monitoring', label: 'Database Health', icon: Monitor },
  ];

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    
    // Show success message (you could implement a toast notification here)
    console.log('Settings saved successfully');
  };

  // Users management functions
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortBy) return 0;
    
    const aValue = a[sortBy as keyof User];
    const bValue = b[sortBy as keyof User];
    
    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
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
    if (sortBy !== column) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.email && newUser.role && newUser.department) {
      const user: User = {
        id: Math.max(...users.map(u => u.id)) + 1,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as User['role'],
        department: newUser.department,
        status: newUser.status as User['status'] || "Active",
        lastLogin: "Never"
      };
      setUsers([...users, user]);
      setNewUser({ name: "", email: "", role: "Employee", department: "", status: "Active" });
      setShowAddModal(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = () => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setEditingUser(null);
      setShowEditModal(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  // Reviewers management functions
  const filteredReviewers = (reviewersData?.reviewers || []).filter((reviewer: Reviewer) => {
    const matchesSearch = reviewer.jobFamily.toLowerCase().includes(reviewerSearchTerm.toLowerCase()) ||
                         reviewer.responsible.toLowerCase().includes(reviewerSearchTerm.toLowerCase()) ||
                         (reviewer.username && reviewer.username.toLowerCase().includes(reviewerSearchTerm.toLowerCase())) ||
                         (reviewer.fullName && reviewer.fullName.toLowerCase().includes(reviewerSearchTerm.toLowerCase())) ||
                         (reviewer.email && reviewer.email.toLowerCase().includes(reviewerSearchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const sortedReviewers = [...filteredReviewers].sort((a, b) => {
    if (!reviewerSortBy) return 0;
    
    const aValue = a[reviewerSortBy as keyof Reviewer];
    const bValue = b[reviewerSortBy as keyof Reviewer];
    
    if (reviewerSortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleReviewerSort = (column: string) => {
    if (reviewerSortBy === column) {
      setReviewerSortOrder(reviewerSortOrder === "asc" ? "desc" : "asc");
    } else {
      setReviewerSortBy(column);
      setReviewerSortOrder("asc");
    }
  };

  const getReviewerSortIcon = (column: string) => {
    if (reviewerSortBy !== column) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return reviewerSortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const handleAddReviewer = () => {
    if (newReviewer.jobFamily && newReviewer.responsible) {
      // This would be an API call in a real implementation
      console.log('Adding reviewer:', newReviewer);
      setNewReviewer({
        jobFamily: "",
        responsible: "",
        completed: 0,
        inProgress: 0,
        username: "",
        fullName: "",
        email: ""
      });
      setShowAddReviewerModal(false);
    }
  };

  const handleEditReviewer = (reviewer: Reviewer) => {
    setEditingReviewer(reviewer);
    setShowEditReviewerModal(true);
  };

  const handleUpdateReviewer = () => {
    if (editingReviewer) {
      // This would be an API call in a real implementation
      console.log('Updating reviewer:', editingReviewer);
      setEditingReviewer(null);
      setShowEditReviewerModal(false);
    }
  };

  const handleDeleteReviewer = (reviewer: Reviewer) => {
    setReviewerToDelete(reviewer);
    setShowDeleteReviewerDialog(true);
  };

  const confirmDeleteReviewer = () => {
    if (reviewerToDelete) {
      // This would be an API call in a real implementation
      console.log('Deleting reviewer:', reviewerToDelete);
      setReviewerToDelete(null);
      setShowDeleteReviewerDialog(false);
    }
  };

  const renderReviewersSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviewer Management</h3>
      
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search reviewers..."
            value={reviewerSearchTerm}
            onChange={(e) => setReviewerSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddReviewerModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Reviewer
          </Button>
        </div>
      </div>

      {reviewersLoading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading reviewers...</span>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleReviewerSort('jobFamily')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Full Name {getReviewerSortIcon('jobFamily')}
                    </button>
                  </th>

                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleReviewerSort('completed')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Completed {getReviewerSortIcon('completed')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleReviewerSort('inProgress')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      In Progress {getReviewerSortIcon('inProgress')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleReviewerSort('username')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Username {getReviewerSortIcon('username')}
                    </button>
                  </th>


                  <th className="px-6 py-3 text-left">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedReviewers.map((reviewer: Reviewer) => (
                  <tr key={reviewer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{reviewer.jobFamily}</div>
                        <div className="text-sm text-gray-500">{reviewer.email || '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {reviewer.completed}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {reviewer.inProgress}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reviewer.username || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditReviewer(reviewer)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReviewer(reviewer)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Reviewer Modal */}
      <Dialog open={showAddReviewerModal} onOpenChange={setShowAddReviewerModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Reviewer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={newReviewer.fullName || ""}
                onChange={(e) => setNewReviewer({ ...newReviewer, fullName: e.target.value })}
                placeholder="Enter full name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="completed">Completed</Label>
                <Input
                  id="completed"
                  type="number"
                  value={newReviewer.completed || 0}
                  onChange={(e) => setNewReviewer({ ...newReviewer, completed: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="inProgress">In Progress</Label>
                <Input
                  id="inProgress"
                  type="number"
                  value={newReviewer.inProgress || 0}
                  onChange={(e) => setNewReviewer({ ...newReviewer, inProgress: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newReviewer.username || ""}
                onChange={(e) => setNewReviewer({ ...newReviewer, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newReviewer.email || ""}
                onChange={(e) => setNewReviewer({ ...newReviewer, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddReviewerModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddReviewer}>
                Add Reviewer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Reviewer Modal */}
      <Dialog open={showEditReviewerModal} onOpenChange={setShowEditReviewerModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Reviewer</DialogTitle>
          </DialogHeader>
          {editingReviewer && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editFullName">Full Name</Label>
                <Input
                  id="editFullName"
                  value={editingReviewer.fullName || ""}
                  onChange={(e) => setEditingReviewer({ ...editingReviewer, fullName: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editCompleted">Completed</Label>
                  <Input
                    id="editCompleted"
                    type="number"
                    value={editingReviewer.completed}
                    onChange={(e) => setEditingReviewer({ ...editingReviewer, completed: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="editInProgress">In Progress</Label>
                  <Input
                    id="editInProgress"
                    type="number"
                    value={editingReviewer.inProgress}
                    onChange={(e) => setEditingReviewer({ ...editingReviewer, inProgress: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editUsername">Username</Label>
                <Input
                  id="editUsername"
                  value={editingReviewer.username || ""}
                  onChange={(e) => setEditingReviewer({ ...editingReviewer, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editingReviewer.email || ""}
                  onChange={(e) => setEditingReviewer({ ...editingReviewer, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditReviewerModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateReviewer}>
                  Update Reviewer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Reviewer Confirmation */}
      <AlertDialog open={showDeleteReviewerDialog} onOpenChange={setShowDeleteReviewerDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the reviewer
              "{reviewerToDelete?.jobFamily}" and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteReviewer}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  const renderUsersSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
      
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="HR Manager">HR Manager</SelectItem>
              <SelectItem value="Reviewer">Reviewer</SelectItem>
              <SelectItem value="Employee">Employee</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-500 tracking-wider hover:text-gray-700"
                  >
                    Name {getSortIcon('name')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('role')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-500 tracking-wider hover:text-gray-700"
                  >
                    Role {getSortIcon('role')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('department')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-500 tracking-wider hover:text-gray-700"
                  >
                    Department {getSortIcon('department')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-500 tracking-wider hover:text-gray-700"
                  >
                    Status {getSortIcon('status')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <span className="text-sm font-medium text-gray-500 tracking-wider">
                    Last Login
                  </span>
                </th>
                <th className="px-6 py-3 text-left">
                  <span className="text-sm font-medium text-gray-500 tracking-wider">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newUser.name || ""}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email || ""}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value as User['role'] })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="HR Manager">HR Manager</SelectItem>
                  <SelectItem value="Reviewer">Reviewer</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={newUser.department || ""}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                placeholder="Enter department"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>
                Add User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select value={editingUser.role} onValueChange={(value) => setEditingUser({ ...editingUser, role: value as User['role'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="HR Manager">HR Manager</SelectItem>
                    <SelectItem value="Reviewer">Reviewer</SelectItem>
                    <SelectItem value="Employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={editingUser.department}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editingUser.status} onValueChange={(value) => setEditingUser({ ...editingUser, status: value as User['status'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateUser}>
                  Update User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {userToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Email Notifications</label>
            <p className="text-sm text-gray-500">Receive notifications via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.emailNotifications}
              onChange={(e) => setNotificationSettings(prev => ({
                ...prev,
                emailNotifications: e.target.checked
              }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>



        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Job Updates</label>
            <p className="text-sm text-gray-500">Notifications about job description changes</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.jobUpdates}
              onChange={(e) => setNotificationSettings(prev => ({
                ...prev,
                jobUpdates: e.target.checked
              }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>


      </div>
    </div>
  );







  const renderDatabaseHealth = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Health Monitoring</h3>
      <DatabaseHealthMonitor />
    </div>
  );

  const renderResponsibleSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Responsible Person Management</h3>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Responsible Person Settings</h4>
          <p className="text-gray-500 mb-6">
            Manage responsible persons for job families and review processes.
          </p>
          <Button className="flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Add Responsible Person
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return renderNotificationSettings();
      case 'users':
        return renderUsersSection();
      case 'reviewers':
        return renderReviewersSection();
      case 'responsible':
        return renderResponsibleSection();
      case 'monitoring':
        return renderDatabaseHealth();
      default:
        return renderNotificationSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <SettingsIcon className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">Settings</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

          <div className="flex space-x-8">
            {/* Sidebar Tabs */}
            <div className="w-64">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}