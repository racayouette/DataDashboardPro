import { Users, Settings, LayoutDashboard, Edit3, Bell } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

export function Sidebar() {
  const [location] = useLocation();
  const [isAdminMode, setIsAdminMode] = useState(true);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", active: false },
    { icon: Users, label: "Jobs Family", path: "/jobs-family", active: true },
    { icon: Edit3, label: "Editing", path: "/editing", active: false, hidden: true },
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
      
      {/* Role Toggle - positioned above user profile */}
      <div className="mt-auto mb-6">
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
    </div>
  );
}