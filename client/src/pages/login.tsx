import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, AlertTriangle, Clock, Shield } from "lucide-react";
import adventHealthLogo from "@assets/advent-health250_1749395626405.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const [loginError, setLoginError] = useState("");
  const { toast } = useToast();
  
  // Brute force protection states
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  
  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Active Directory authentication mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Authentication failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Login Successful",
        description: `Welcome ${data.user.firstName} ${data.user.lastName}`,
      });
      
      // Reset lockout state on successful login
      localStorage.removeItem('lockoutEndTime');
      localStorage.removeItem('failedAttempts');
      setFailedAttempts(0);
      setIsLocked(false);
      
      // Redirect to dashboard
      setLocation('/');
    },
    onError: (error: Error) => {
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      localStorage.setItem('failedAttempts', newFailedAttempts.toString());
      
      // Implement progressive lockout
      if (newFailedAttempts >= 5) {
        const lockoutDuration = Math.min(30000 * Math.pow(2, newFailedAttempts - 5), 300000); // Max 5 minutes
        const endTime = Date.now() + lockoutDuration;
        
        setIsLocked(true);
        setLockoutEndTime(endTime);
        setRemainingTime(lockoutDuration);
        
        localStorage.setItem('lockoutEndTime', endTime.toString());
        
        setLoginError(`Account locked for ${Math.ceil(lockoutDuration / 60000)} minutes due to multiple failed attempts`);
      } else {
        setLoginError(error.message);
      }
      
      toast({
        title: "Authentication Failed",
        description: error.message,
        variant: "destructive",
      });
    },
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

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      toast({
        title: "Account Locked",
        description: `Please wait ${Math.ceil(remainingTime / 60000)} minutes before trying again`,
        variant: "destructive",
      });
      return;
    }

    if (!username || !password) {
      setLoginError("Please enter your AdventHealth username and password");
      return;
    }

    setLoginError("");
    loginMutation.mutate({ username, password });
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
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <div className="bg-white p-2">
              <img 
                src={adventHealthLogo} 
                alt="AdventHealth Logo" 
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Job Management System</h1>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            Sign in with your AdventHealth credentials
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">AdventHealth Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loginMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loginMutation.isPending}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
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

          {failedAttempts > 0 && failedAttempts < 5 && (
            <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
              {5 - failedAttempts} attempt(s) remaining before account lockout
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Authenticating..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Secure authentication through AdventHealth Active Directory</p>
          <p className="mt-1">Contact IT support if you need assistance</p>
        </div>
      </div>
    </div>
  );
}