import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WindowsAuth } from "@/components/windows-auth";
import { RoleProvider } from "@/contexts/RoleContext";
import { useState } from "react";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import JobsFamily from "@/pages/jobs-family";
import Editing from "@/pages/editing";
import JobFinalReview from "@/pages/job-final-review";
import Users from "@/pages/users";
import Notifications from "@/pages/notifications";
import Downloads from "@/pages/downloads";
import CompareVersions from "@/pages/compare-versions";
import Settings from "@/pages/settings";
import AccessDenied from "@/pages/access-denied";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/jobs-family" component={JobsFamily} />
      <Route path="/editing" component={Editing} />
      <Route path="/job-final-review" component={JobFinalReview} />
      <Route path="/users" component={Users} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/downloads" component={Downloads} />
      <Route path="/compare-versions" component={CompareVersions} />
      <Route path="/settings" component={Settings} />
      <Route path="/access-denied" component={AccessDenied} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string, fullName: string, email: string } | null>(null);

  const handleAuthenticated = (userData: { username: string, fullName: string, email: string }) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WindowsAuth onAuthenticated={handleAuthenticated} />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RoleProvider>
          <Toaster />
          <Router />
        </RoleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
