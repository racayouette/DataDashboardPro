import { BarChart3, Users, TrendingUp, History, Settings, LayoutDashboard, Edit3, UserCheck, Bell } from "lucide-react";
import { Link, useLocation } from "wouter";

export function Sidebar() {
  const [location] = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/", active: true },
    { icon: Users, label: "Jobs Family", path: "/jobs-family", active: false },
    { icon: Edit3, label: "Editing", path: "/editing", active: false, hidden: true },
    { icon: UserCheck, label: "Users", path: "/users", active: false },
    { icon: Bell, label: "Notifications", path: "/notifications", active: false },
    { icon: TrendingUp, label: "Essential Ranking", path: "/ranking", active: false, disabled: true },
    { icon: History, label: "History", path: "/history", active: false, disabled: true },
    { icon: BarChart3, label: "Progress Tracker", path: "/progress", active: false, disabled: true },
    { icon: Settings, label: "Settings", path: "/settings", active: false, disabled: true },
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
          const isDisabled = item.disabled;
          
          if (isDisabled) {
            return (
              <div key={item.path} className="flex items-center space-x-3 p-3 rounded-lg text-blue-300 opacity-50 cursor-not-allowed">
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            );
          }
          
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
        <div className="flex items-center space-x-3 p-3 text-blue-200 hover:bg-blue-800 hover:text-white rounded-lg transition-colors">
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">JM</span>
          </div>
          <span className="text-sm font-medium">John marks</span>
        </div>
      </div>
    </div>
  );
}