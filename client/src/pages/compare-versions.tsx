import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

          {/* Comparison Boxes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Original Job Description</CardTitle>
                <p className="text-sm text-gray-600">Last modified: May 15, 2025</p>
              </CardHeader>
              <CardContent>
                {/* Content will be added here */}
              </CardContent>
            </Card>

            {/* Current Version */}
            <Card>
              <CardHeader>
                <CardTitle>Current Version</CardTitle>
                <p className="text-sm text-gray-600">Last modified: June 7, 2025</p>
              </CardHeader>
              <CardContent>
                {/* Content will be added here */}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}