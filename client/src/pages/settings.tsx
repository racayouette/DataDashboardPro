import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Bell, User, Save, RefreshCw, Search, Plus, Edit3, Trash2, X, ArrowUpDown, ArrowUp, ArrowDown, Mail, ThumbsUp, Server } from "lucide-react";

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

export default function Settings() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef<HTMLDivElement>(null);

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
  const [editPassword, setEditPassword] = useState("");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [newUser, setNewUser] = useState<Partial<User & { password: string }>>({
    name: "",
    email: "",
    password: "",
    role: "Employee",
    department: "",
    status: "Active"
  });

  // Sample user data with Functional Leaders and Responsible Persons merged in
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
    },
    {
      id: 7,
      name: "Clinical Support",
      email: "clinical.support@adventhealth.com",
      role: "Reviewer",
      department: "Clinical Support",
      status: "Active",
      lastLogin: "June 5, 2025"
    },
    {
      id: 8,
      name: "Emergency Medicine",
      email: "emergency.medicine@adventhealth.com",
      role: "Reviewer",
      department: "Emergency Medicine",
      status: "Active",
      lastLogin: "June 4, 2025"
    },
    {
      id: 9,
      name: "Nursing",
      email: "nursing@adventhealth.com",
      role: "Reviewer",
      department: "Nursing",
      status: "Active",
      lastLogin: "June 3, 2025"
    },
    {
      id: 10,
      name: "Pharmacy",
      email: "pharmacy@adventhealth.com",
      role: "Reviewer",
      department: "Pharmacy",
      status: "Active",
      lastLogin: "June 2, 2025"
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

  // Active Directory state
  const [adStatus, setAdStatus] = useState({ connected: false, server: '', baseDN: '' });
  const [adTestResult, setAdTestResult] = useState<any>(null);
  const [isTestingAD, setIsTestingAD] = useState(false);

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'users', label: 'Users', icon: User },
    { id: 'active-directory', label: 'Active Directory', icon: Server },
  ];

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    
    // Show success message (you could implement a toast notification here)
    console.log('Settings saved successfully');
  };

  const handleTestADConnection = async () => {
    setIsTestingAD(true);
    try {
      const response = await fetch('/api/active-directory/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      setAdTestResult(result);
    } catch (error) {
      setAdTestResult({ success: false, message: 'Connection test failed' });
    }
    setIsTestingAD(false);
  };

  const handleSyncADUsers = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/active-directory/sync');
      const result = await response.json();
      console.log('AD Sync completed:', result);
    } catch (error) {
      console.error('AD Sync failed:', error);
    }
    setIsSaving(false);
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



  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.endsWith('@') && !value.includes('adventhealth.com')) {
      setNewUser({ ...newUser, email: value + 'adventhealth.com' });
    } else {
      setNewUser({ ...newUser, email: value });
    }
  };

  const validatePassword = (password: string): boolean => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.email && newUser.role && newUser.department && newUser.password) {
      if (!validatePassword(newUser.password)) {
        alert("Password does not meet all requirements. Please ensure it has at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.");
        return;
      }
      
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
      setNewUser({ name: "", email: "", password: "", role: "Employee", department: "", status: "Active" });
      setShowAddModal(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditPassword("");
    setShowEditModal(true);
  };

  const handleUpdateUser = () => {
    if (editingUser) {
      if (editPassword && !validatePassword(editPassword)) {
        alert("Password does not meet all requirements. Please ensure it has at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.");
        return;
      }
      
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setEditingUser(null);
      setEditPassword("");
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-full mx-auto px-4">
          {/* Beta Banner */}
          <div className="mb-4 bg-orange-100 border border-orange-300 text-orange-800 px-4 py-3 rounded-lg">
            <div className="flex items-center justify-center">
              <span className="font-semibold text-sm">⚠️ PRE-PROD RELEASE BETA 1.0</span>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <SettingsIcon className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">Settings</span>
            </div>
            <div className="flex items-center space-x-4">
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="flex space-x-1 border-b border-gray-200">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 border-l border-r border-t border-gray-200'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 inline mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                      <p className="text-xs text-gray-500">Receive job updates and system alerts via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: e.target.checked
                      })}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>



                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Job Updates</label>
                      <p className="text-xs text-gray-500">Get notified when job descriptions are updated</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.jobUpdates}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        jobUpdates: e.target.checked
                      })}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>


                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full sm:w-auto">
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Notification Settings
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <Button onClick={() => setShowAddModal(true)} className="text-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>

                {/* Search and Filter Controls */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by role" />
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
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Users Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                            <div className="flex items-center space-x-1">
                              <span>Name</span>
                              {getSortIcon('name')}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('email')}>
                            <div className="flex items-center space-x-1">
                              <span>Email</span>
                              {getSortIcon('email')}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('role')}>
                            <div className="flex items-center space-x-1">
                              <span>Role</span>
                              {getSortIcon('role')}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('department')}>
                            <div className="flex items-center space-x-1">
                              <span>Department</span>
                              {getSortIcon('department')}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>
                            <div className="flex items-center space-x-1">
                              <span>Status</span>
                              {getSortIcon('status')}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('lastLogin')}>
                            <div className="flex items-center space-x-1">
                              <span>Last Login</span>
                              {getSortIcon('lastLogin')}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sortedUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={user.role === 'Admin' ? 'destructive' : user.role === 'HR Manager' ? 'default' : 'secondary'}>
                                {user.role}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.department}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                                {user.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastLogin}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user)} className="text-red-600 hover:text-red-800">
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
              </div>
            )}

            {activeTab === 'active-directory' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Active Directory Configuration</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Enable Active Directory</label>
                      <p className="text-xs text-gray-500">Connect to Active Directory for user authentication</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800">Connected to Test LDAP Server</p>
                          <p className="text-sm text-green-700">ldap://ldap.forumsys.com:389</p>
                          <p className="text-xs text-green-600 mt-1">Base DN: dc=example,dc=com</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Connection Status</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Status</span>
                            <span className="text-sm font-medium text-green-600">Connected</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-600">Last Test</span>
                            <span className="text-sm text-gray-900">Active</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">Available Test Users</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                          <div className="space-y-1 text-sm">
                            <div className="text-gray-900 font-medium">Test Accounts:</div>
                            <div className="text-gray-600">• einstein (password: password)</div>
                            <div className="text-gray-600">• newton (password: password)</div>
                            <div className="text-gray-600">• galieleo (password: password)</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {adTestResult && (
                      <div className={`rounded-lg p-4 ${adTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full ${adTestResult.success ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          <p className={`ml-3 text-sm font-medium ${adTestResult.success ? 'text-green-800' : 'text-red-800'}`}>
                            {adTestResult.message}
                          </p>
                        </div>
                        {adTestResult.userCount && (
                          <p className="mt-1 ml-5 text-sm text-green-700">
                            Found {adTestResult.userCount} users available for sync
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
                  <div className="flex space-x-4">
                    <Button onClick={handleTestADConnection} disabled={isTestingAD} variant="outline">
                      {isTestingAD ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Server className="w-4 h-4 mr-2" />
                          Test Connection
                        </>
                      )}
                    </Button>

                    <Button onClick={handleSyncADUsers} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Sync Users
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Configuration Details:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Server: ldap://ldap.forumsys.com:389</li>
                      <li>• Bind DN: cn=read-only-admin,dc=example,dc=com</li>
                      <li>• Search Base: dc=example,dc=com</li>
                      <li>• This is a free testing LDAP service for development</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}


          </div>
        </div>
      </main>

      {/* Add User Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newName">Name</Label>
              <Input
                id="newName"
                value={newUser.name || ""}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter full name"
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="newEmail">Email</Label>
              <Input
                id="newEmail"
                type="email"
                value={newUser.email || ""}
                onChange={handleEmailChange}
                placeholder="Enter email address"
                autoComplete="off"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="newPassword">Password</Label>
                {validatePassword(newUser.password || "") && (
                  <ThumbsUp className="h-4 w-4 text-green-600 mr-3" />
                )}
              </div>
              <Input
                id="newPassword"
                type="text"
                value={newUser.password || ""}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Enter password"
                autoComplete="off"
              />
              <div className="mt-2">
                <p className="text-sm text-gray-700 mb-2">Password Requirements:</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center">
                    <span className={`mr-2 ${(newUser.password || "").length >= 8 ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                    <span className={(newUser.password || "").length >= 8 ? 'text-green-600' : 'text-gray-500'}>At least 8 characters</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`mr-2 ${/[A-Z]/.test(newUser.password || "") ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                    <span className={/[A-Z]/.test(newUser.password || "") ? 'text-green-600' : 'text-gray-500'}>One uppercase letter</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`mr-2 ${/[a-z]/.test(newUser.password || "") ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                    <span className={/[a-z]/.test(newUser.password || "") ? 'text-green-600' : 'text-gray-500'}>One lowercase letter</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`mr-2 ${/\d/.test(newUser.password || "") ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                    <span className={/\d/.test(newUser.password || "") ? 'text-green-600' : 'text-gray-500'}>One number</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`mr-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(newUser.password || "") ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                    <span className={/[!@#$%^&*(),.?":{}|<>]/.test(newUser.password || "") ? 'text-green-600' : 'text-gray-500'}>One special character</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="newRole">Role</Label>
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
              <Label htmlFor="newDepartment">Department</Label>
              <Select value={newUser.department} onValueChange={(value) => setNewUser({ ...newUser, department: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Human Resources">Human Resources</SelectItem>
                  <SelectItem value="Information Technology">Information Technology</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Customer Service">Customer Service</SelectItem>
                  <SelectItem value="Research & Development">Research & Development</SelectItem>
                  <SelectItem value="Quality Assurance">Quality Assurance</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Facilities">Facilities</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="newStatus">Status</Label>
              <Select value={newUser.status} onValueChange={(value) => setNewUser({ ...newUser, status: value as User['status'] })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button 
                onClick={handleAddUser}
                disabled={!newUser.name || !newUser.email || !newUser.role || !newUser.password || !newUser.department || !validatePassword(newUser.password || "")}
              >
                Add User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editName">Name</Label>
                <Input
                  id="editName"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  autoComplete="off"
                />
              </div>
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editingUser.email}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                  autoComplete="off"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="editPassword">Password</Label>
                  {validatePassword(editPassword) && (
                    <ThumbsUp className="h-4 w-4 text-green-600 mr-3" />
                  )}
                </div>
                <Input
                  id="editPassword"
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="off"
                />
                <div className="mt-2">
                  <p className="text-sm text-gray-700 mb-2">Password Requirements:</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center">
                      <span className={`mr-2 ${editPassword.length >= 8 ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                      <span className={editPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}>At least 8 characters</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`mr-2 ${/[A-Z]/.test(editPassword) ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                      <span className={/[A-Z]/.test(editPassword) ? 'text-green-600' : 'text-gray-500'}>One uppercase letter</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`mr-2 ${/[a-z]/.test(editPassword) ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                      <span className={/[a-z]/.test(editPassword) ? 'text-green-600' : 'text-gray-500'}>One lowercase letter</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`mr-2 ${/\d/.test(editPassword) ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                      <span className={/\d/.test(editPassword) ? 'text-green-600' : 'text-gray-500'}>One number</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`mr-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(editPassword) ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                      <span className={/[!@#$%^&*(),.?":{}|<>]/.test(editPassword) ? 'text-green-600' : 'text-gray-500'}>One special character</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="editRole">Role</Label>
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
                <Label htmlFor="editDepartment">Department</Label>
                <Select value={editingUser.department} onValueChange={(value) => setEditingUser({ ...editingUser, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="Information Technology">Information Technology</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Customer Service">Customer Service</SelectItem>
                    <SelectItem value="Research & Development">Research & Development</SelectItem>
                    <SelectItem value="Quality Assurance">Quality Assurance</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Facilities">Facilities</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
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
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button 
                  onClick={handleUpdateUser}
                  disabled={!editingUser.name || !editPassword || !editingUser.role || !editingUser.department || !editingUser.status || !validatePassword(editPassword)}
                >
                  Update User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
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
}