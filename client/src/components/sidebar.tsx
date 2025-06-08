import { Users, Settings, LayoutDashboard, Edit3, Bell, Shield, Eye, EyeOff, AlertTriangle, FileText, X, LogIn } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useRole } from "@/contexts/RoleContext";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { isAdminMode, setIsAdminMode } = useRole();
  const [testLoginMode, setTestLoginMode] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  // Form states
  const [signInEmail, setSignInEmail] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpDepartment, setSignUpDepartment] = useState("");
  
  // Fetch users data for authentication
  const { data: usersData } = useQuery({
    queryKey: ['/api/users'],
    enabled: testLoginMode
  });

  const handleTestLoginToggle = () => {
    if (isAuthenticated) {
      setIsAuthenticated(false);
      setTestLoginMode(false);
    } else {
      setTestLoginMode(true);
      setShowLoginDialog(true);
    }
  };

  const handleSignIn = () => {
    setLoginError("");
    if (!signInEmail) {
      setLoginError("Please enter your email");
      return;
    }

    const emailPrefix = signInEmail.split('@')[0];
    const users = (usersData as any)?.users || [];
    const foundUser = users.find((user: any) => {
      const userEmailPrefix = user.email.split('@')[0];
      return userEmailPrefix === emailPrefix;
    });

    if (foundUser) {
      setIsAuthenticated(true);
      setShowLoginDialog(false);
      setSignInEmail("");
      setLoginError("");
    } else {
      setLoginError("Login unsuccessful. Please try again.");
    }
  };

  const handleSignUp = () => {
    setLoginError("");
    if (!signUpEmail || !signUpName || !signUpDepartment) {
      setLoginError("Please fill in all fields");
      return;
    }

    const emailPrefix = signUpEmail.split('@')[0];
    const users = (usersData as any)?.users || [];
    const existingUser = users.find((user: any) => {
      const userEmailPrefix = user.email.split('@')[0];
      return userEmailPrefix === emailPrefix;
    });

    if (existingUser) {
      setLoginError("User already exists. Please sign in instead.");
      return;
    }

    // In a real app, this would create the user in the database
    setIsAuthenticated(true);
    setShowLoginDialog(false);
    setSignUpEmail("");
    setSignUpName("");
    setSignUpDepartment("");
    setLoginError("");
  };

  const handleLoginCancel = () => {
    setShowLoginDialog(false);
    setTestLoginMode(false);
    setLocation('/access-denied');
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
      
      {/* Test User Login Toggle */}
      <div className="mt-auto mb-4">
        <div className="bg-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <LogIn className="w-4 h-4 text-blue-200" />
              <span className="text-blue-200 text-sm font-medium">Test User Login</span>
            </div>
            <div className="relative">
              <button
                onClick={handleTestLoginToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-900 ${
                  testLoginMode ? 'bg-green-600' : 'bg-blue-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    testLoginMode ? 'translate-x-6' : 'translate-x-1'
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



      {/* Test User Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center space-x-2">
                <LogIn className="w-5 h-5 text-blue-600" />
                <span>User Authentication</span>
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoginCancel}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="text"
                  value={signInEmail}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (value.includes('@') && !value.includes('@adventhealth.com')) {
                      value = value.split('@')[0] + '@adventhealth.com';
                    }
                    setSignInEmail(value);
                  }}
                  placeholder="Enter email"
                  onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
                />
              </div>
              
              {loginError && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {loginError}
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleLoginCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSignIn} disabled={!signInEmail}>
                  Submit
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="text"
                  value={signUpEmail}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (value.includes('@') && !value.includes('@adventhealth.com')) {
                      value = value.split('@')[0] + '@adventhealth.com';
                    }
                    setSignUpEmail(value);
                  }}
                  placeholder="Enter email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-department">Department</Label>
                <Input
                  id="signup-department"
                  type="text"
                  value={signUpDepartment}
                  onChange={(e) => setSignUpDepartment(e.target.value)}
                  placeholder="Enter your department"
                />
              </div>
              
              {loginError && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {loginError}
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleLoginCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSignUp} disabled={!signUpEmail || !signUpName || !signUpDepartment}>
                  Submit
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>


    </div>
  );
}