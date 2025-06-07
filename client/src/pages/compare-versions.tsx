import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { GitCompare, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function CompareVersions() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation("/jobs-family");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <GitCompare className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">Compare Versions</span>
            </div>
            <Button 
              onClick={handleBack}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}