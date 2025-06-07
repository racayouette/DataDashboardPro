import { Users, Settings, LayoutDashboard, Edit3, Bell, Shield, Eye, EyeOff, AlertTriangle, FileText } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useRole } from "@/contexts/RoleContext";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Sidebar() {
  const [location] = useLocation();
  const { isAdminMode, setIsAdminMode } = useRole();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  const handleAuthentication = () => {
    // Simple validation - in real app this would register user and call Windows Auth API
    if (username && fullName && email) {
      setIsAuthenticated(true);
      setShowAuthDialog(false);
      setUsername("");
      setFullName("");
      setEmail("");
    } else {
      alert("Please fill in all fields to complete registration.");
    }
  };

  const handleAuthToggle = () => {
    if (isAuthenticated) {
      setIsAuthenticated(false);
    } else {
      setShowAuthDialog(true);
    }
  };

  const handleDialogClose = () => {
    // Check if form is empty when closing
    if (!username && !fullName && !email) {
      setShowAuthDialog(false);
      setShowAccessDenied(true);
      // Auto-hide access denied message after 3 seconds, then show registration again
      setTimeout(() => {
        setShowAccessDenied(false);
        setShowAuthDialog(true);
      }, 3000);
    } else {
      setShowAuthDialog(false);
      setUsername("");
      setFullName("");
      setEmail("");
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", active: false },
    { icon: Users, label: "Jobs Family", path: "/jobs-family", active: true },
    { icon: Edit3, label: "Editing", path: "/editing", active: false, hidden: true },
    { icon: FileText, label: "Job Final Review", path: "/job-final-review", active: false, hidden: true },
    { icon: Bell, label: "Notifications", path: "/notifications", active: false },
    { icon: Settings, label: "Settings", path: "/settings", active: false },
  ];

  return (
    <div className="bg-blue-900 text-white w-64 min-h-screen p-4 flex flex-col">
      {/* Logo Section */}
      <div className="mb-8">
        <div className="bg-blue-800 rounded-lg p-4 mb-6">
          <h1 className="text-xl font-bold">Advent AI</h1>
          <p className="text-blue-200 text-sm">HR Review System</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2 flex-1">
        {menuItems.filter(item => !item.hidden).map((item) => {
          const Icon = item.icon;
          // Special case for Jobs Family: highlight when on root path or jobs-family path
          const isActive = item.path === "/jobs-family" 
            ? (location === "/" || location === "/jobs-family")
            : location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <div className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                isActive 
                  ? "bg-blue-700 text-white" 
                  : "text-blue-200 hover:bg-blue-800 hover:text-white"
              }`}>
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      
      {/* Authentication Toggle */}
      <div className="mt-auto mb-4">
        <div className="bg-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-200" />
              <span className="text-blue-200 text-sm font-medium">Windows Auth Forever Loop</span>
            </div>
            <div className="relative">
              <button
                onClick={handleAuthToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-900 ${
                  isAuthenticated ? 'bg-green-600' : 'bg-blue-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAuthenticated ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="text-center">
            <span className={`text-sm font-medium ${isAuthenticated ? 'text-green-200' : 'text-white'}`}>
              {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </span>
          </div>
        </div>
      </div>

      {/* Role Toggle - positioned above user profile */}
      <div className="mb-6">
        <div className="bg-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-blue-200 text-sm font-medium">Role</span>
            <div className="relative">
              <button
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-900 ${
                  isAdminMode ? 'bg-blue-600' : 'bg-blue-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAdminMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="text-center">
            <span className="text-white text-sm font-medium">
              {isAdminMode ? 'Admin' : 'Reviewer'}
            </span>
          </div>
        </div>
      </div>
      
      {/* User Profile - positioned at bottom */}
      <div className="mb-4">
        <Link href="/users">
          <div className="flex items-center space-x-3 p-3 text-blue-200 hover:bg-blue-800 hover:text-white rounded-lg transition-colors cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JM</span>
            </div>
            <span className="text-sm font-medium">John Marks</span>
          </div>
        </Link>
      </div>

      {/* Windows Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>User Registration</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">User Name</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your user name"
                onKeyPress={(e) => e.key === 'Enter' && handleAuthentication()}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                onKeyPress={(e) => e.key === 'Enter' && handleAuthentication()}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                onKeyPress={(e) => e.key === 'Enter' && handleAuthentication()}
                autoComplete="off"
              />
            </div>

            <div className="text-sm text-gray-500">
              Please fill in all fields to complete registration
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleDialogClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAuthentication}
              disabled={!username || !fullName || !email}
            >
              Register
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Access Denied Dialog */}
      <Dialog open={showAccessDenied} onOpenChange={setShowAccessDenied}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Access Denied</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              You must complete the registration form to access this feature.
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => setShowAccessDenied(false)}
              className="bg-red-600 hover:bg-red-700"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}