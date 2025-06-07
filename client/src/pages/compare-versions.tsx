import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitCompare, ArrowLeft, FileText } from "lucide-react";
import { useLocation } from "wouter";
import { Link } from "wouter";

export default function CompareVersions() {

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <GitCompare className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Compare Versions</h1>
              </div>
            </div>
            
            <Button variant="ghost" asChild className="mb-4 bg-gray-100 text-gray-600 hover:bg-gray-200 border-0 text-xs px-2 py-1 h-7">
              <Link href="/jobs-family">
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back
              </Link>
            </Button>
          </div>

          {/* Comparison Boxes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Job Description */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold">Original Job Description</h3>
                </div>
                <p className="text-sm text-gray-600 mt-2">Last modified: May 15, 2025</p>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Job Summary</h4>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                    <p className="text-sm">• Provides Direct Patient Care Under Supervision. Monitors Patient Condition And Reports</p>
                    <p className="text-sm">• Changes To The Medical Team. Maintains Accurate Records And Assists With Mobility Needs.</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Essential Functions:</h4>
                  <div className="space-y-2 text-sm">
                    <p>1. Monitor Patient Vitals And Report Abnormalities.</p>
                    <p>2. Assist With Bathing, Feeding, And Toileting.</p>
                    <p>3. Document Daily Care Activities.</p>
                    <p>4. Transport Patients Using Wheelchairs And Stretchers.</p>
                  </div>
                </div>

                <div className="text-sm text-gray-600 leading-relaxed">
                  <p>The Patient Care Technician (PCT) Is A Key Member Of The Clinical Team Responsible For Delivering Foundational Support To Patients And Clinical Staff. Under The Guidance Of Licensed Nursing Personnel, The PCT Assists With Direct Patient Care To Meet Each Patient's Physical And Emotional Conditions, And Ensures A Clean, Safe, And Healing-Centered Environment.</p>
                </div>
              </div>
            </div>

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