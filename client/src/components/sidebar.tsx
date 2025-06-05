import { Users, Settings, LayoutDashboard, Edit3, Bell } from "lucide-react";
import { Link, useLocation } from "wouter";

export function Sidebar() {
  const [location] = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/", active: true },
    { icon: Users, label: "Jobs Family", path: "/jobs-family", active: false },
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
          const isActive = location === item.path;
          
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
      
      {/* User Profile - at bottom of sidebar */}
      <div className="mt-auto">
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