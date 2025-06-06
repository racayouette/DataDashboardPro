import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { User, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WindowsAuthProps {
  onAuthenticated: (userData: { username: string, fullName: string, email: string }) => void;
}

export function WindowsAuth({ onAuthenticated }: WindowsAuthProps) {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    // Simulate Windows Authentication check
    const windowsUser = getWindowsAuthUser();
    
    if (!windowsUser) {
      setShowAuthDialog(true);
    } else {
      onAuthenticated(windowsUser);
    }
  }, [onAuthenticated]);

  const getWindowsAuthUser = () => {
    // Simulate checking Windows Authentication
    // In a real implementation, this would check the Windows auth context
    // For demo purposes, we'll check localStorage for existing user
    const savedUser = localStorage.getItem('windowsAuthUser');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    return null;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!username.trim()) {
      newErrors.username = "Username is required";
    }
    
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const userData = { username, fullName, email };
      
      // Save user data to reviewers table via API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        // Save to localStorage for future sessions
        localStorage.setItem('windowsAuthUser', JSON.stringify(userData));
        
        toast({
          title: "Authentication Successful",
          description: "User registered successfully",
        });
        
        setShowAuthDialog(false);
        onAuthenticated(userData);
      } else {
        toast({
          title: "Registration Failed",
          description: "Failed to register user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during registration",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setShowAccessDenied(true);
  };

  if (showAccessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            You do not have permission to access this application.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={showAuthDialog} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-600" />
            <DialogTitle>Windows Authentication</DialogTitle>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Username
            </label>
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Full Name
            </label>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={errors.fullName ? "border-red-500" : ""}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          
          <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">
            Register & Continue
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}