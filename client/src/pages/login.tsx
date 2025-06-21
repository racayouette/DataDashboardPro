import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, AlertTriangle, Clock, Check, X } from "lucide-react";
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
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpDepartment, setSignUpDepartment] = useState("");
  
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

    const users = usersData?.data || usersData || [];
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

  const handleSignUp = () => {
    // Handle sign up logic here
    console.log("Sign up attempt", { signUpEmail, signUpName, signUpDepartment });
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const passwordValidation = {
    length: signUpPassword.length >= 8,
    uppercase: /[A-Z]/.test(signUpPassword),
    lowercase: /[a-z]/.test(signUpPassword),
    number: /\d/.test(signUpPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(signUpPassword),
    isStrong: signUpPassword.length >= 8 && 
              /[A-Z]/.test(signUpPassword) && 
              /[a-z]/.test(signUpPassword) && 
              /\d/.test(signUpPassword) && 
              /[!@#$%^&*(),.?":{}|<>]/.test(signUpPassword)
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
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                placeholder="Create a password"
              />
              <div className="space-y-1">
                <div className={`flex items-center space-x-2 text-xs ${passwordValidation.length ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordValidation.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center space-x-2 text-xs ${passwordValidation.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordValidation.uppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>One uppercase letter</span>
                </div>
                <div className={`flex items-center space-x-2 text-xs ${passwordValidation.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordValidation.lowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>One lowercase letter</span>
                </div>
                <div className={`flex items-center space-x-2 text-xs ${passwordValidation.number ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordValidation.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>One number</span>
                </div>
                <div className={`flex items-center space-x-2 text-xs ${passwordValidation.special ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordValidation.special ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>One special character</span>
                </div>
              </div>
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
              <Select value={signUpDepartment} onValueChange={setSignUpDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your department" />
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
            
            {loginError && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {loginError}
              </div>
            )}
            
            <Button 
              onClick={handleSignUp} 
              className="w-full"
              disabled={!signUpEmail || !signUpPassword || !signUpName || !signUpDepartment || !passwordValidation.isStrong}
            >
              Create Account
            </Button>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => setLocation('/')}>
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}