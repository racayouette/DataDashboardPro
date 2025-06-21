import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertTriangle, Clock } from "lucide-react";
import adventHealthLogo from "@assets/advent-health250_1749395626405.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  // Brute force protection states
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  
  // Form states
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  
  // Fetch users data for authentication
  const { data: usersData } = useQuery({
    queryKey: ['/api/users']
  });

  // Initialize lockout state from localStorage on component mount
  useEffect(() => {
    const savedLockoutEndTime = localStorage.getItem('lockoutEndTime');
    const savedFailedAttempts = localStorage.getItem('failedAttempts');
    
    if (savedLockoutEndTime) {
      const endTime = parseInt(savedLockoutEndTime);
      const currentTime = Date.now();
      
      if (currentTime < endTime) {
        // Still locked out
        setIsLocked(true);
        setLockoutEndTime(endTime);
        setRemainingTime(endTime - currentTime);
      } else {
        // Lockout has expired
        localStorage.removeItem('lockoutEndTime');
        localStorage.removeItem('failedAttempts');
        setIsLocked(false);
        setFailedAttempts(0);
      }
    }
    
    if (savedFailedAttempts) {
      setFailedAttempts(parseInt(savedFailedAttempts));
    }
  }, []);

  // Timer effect for lockout countdown
  useEffect(() => {
    if (isLocked && lockoutEndTime) {
      const timer = setInterval(() => {
        const currentTime = Date.now();
        const timeLeft = lockoutEndTime - currentTime;
        
        if (timeLeft <= 0) {
          // Lockout has expired
          setIsLocked(false);
          setLockoutEndTime(null);
          setRemainingTime(0);
          setFailedAttempts(0);
          localStorage.removeItem('lockoutEndTime');
          localStorage.removeItem('failedAttempts');
          clearInterval(timer);
        } else {
          setRemainingTime(timeLeft);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutEndTime]);

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, setLocation]);

  const handleSignIn = () => {
    if (isLocked) {
      setLoginError("Account is temporarily locked. Please wait.");
      return;
    }

    const users = usersData || [];
    const foundUser = users.find((user: any) => 
      user.email.toLowerCase() === signInEmail.toLowerCase() && 
      user.password === signInPassword
    );

    if (foundUser) {
      // Successful login - reset failed attempts
      setIsAuthenticated(true);
      setSignInEmail("");
      setSignInPassword("");
      setLoginError("");
      setFailedAttempts(0);
      localStorage.removeItem('lockoutEndTime');
      localStorage.removeItem('failedAttempts');
    } else {
      // Failed login - increment attempts
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      
      if (newFailedAttempts >= 3) {
        // Lock out for 25 minutes
        const lockoutDuration = 25 * 60 * 1000;
        const endTime = Date.now() + lockoutDuration;
        
        setIsLocked(true);
        setLockoutEndTime(endTime);
        setRemainingTime(lockoutDuration);
        
        localStorage.setItem('lockoutEndTime', endTime.toString());
        localStorage.setItem('failedAttempts', newFailedAttempts.toString());
        
        setLocation('/access-denied');
      } else {
        setLoginError(`Login unsuccessful. ${3 - newFailedAttempts} attempt(s) remaining.`);
        localStorage.setItem('failedAttempts', newFailedAttempts.toString());
      }
    }
  };



  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-2xl max-w-md w-full mx-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h2 className="text-xl font-bold text-red-600">Account Temporarily Locked</h2>
            </div>
            <p className="text-sm text-gray-600">
              Too many failed login attempts. Your account has been temporarily locked for security purposes.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800 mb-2">Time Remaining:</p>
              <div className="text-2xl font-bold text-red-600 font-mono">
                {formatTime(remainingTime)}
              </div>
            </div>
            <Button onClick={() => setLocation('/')} className="w-full">
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-2xl max-w-md w-full mx-4">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src={adventHealthLogo} 
              alt="AdventHealth Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Job Review System</h1>
          <p className="text-gray-600">Please sign in to continue</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signin-email">Email</Label>
            <Input
              id="signin-email"
              type="email"
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signin-password">Password</Label>
            <div className="relative">
              <Input
                id="signin-password"
                type={showSignInPassword ? "text" : "password"}
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                placeholder="Enter your password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowSignInPassword(!showSignInPassword)}
              >
                {showSignInPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {loginError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {loginError}
            </div>
          )}
          
          <Button onClick={handleSignIn} className="w-full" disabled={!signInEmail || !signInPassword}>
            Sign In
          </Button>
        </div>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => setLocation('/')}>
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}