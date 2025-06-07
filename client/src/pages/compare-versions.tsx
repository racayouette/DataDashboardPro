import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitCompare, ArrowLeft, FileText, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { Link } from "wouter";

interface DiffSegment {
  type: 'unchanged' | 'added' | 'removed' | 'modified';
  text: string;
  lineNumber?: number;
}

export default function CompareVersions() {
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);
  const [syncScroll, setSyncScroll] = useState(true);

  // Original and current versions data
  const originalVersion = {
    jobSummary: "• Provides Direct Patient Care Under Supervision. Monitors Patient Condition And Reports\n• Changes To The Medical Team. Maintains Accurate Records And Assists With Mobility Needs.",
    essentialFunctions: [
      "Monitor Patient Vitals And Report Abnormalities.",
      "Assist With Bathing, Feeding, And Toileting.",
      "Document Daily Care Activities.",
      "Transport Patients Using Wheelchairs And Stretchers."
    ],
    description: "The Patient Care Technician (PCT) Is A Key Member Of The Clinical Team Responsible For Delivering Foundational Support To Patients And Clinical Staff. Under The Guidance Of Licensed Nursing Personnel, The PCT Assists With Direct Patient Care To Meet Each Patient's Physical And Emotional Conditions, And Ensures A Clean, Safe, And Healing-Centered Environment."
  };

  const currentVersion = {
    jobSummary: "• Provides Comprehensive Patient Care Under Licensed Supervision. Monitors Patient Condition And Reports\n• Critical Changes To The Medical Team. Maintains Detailed Records And Assists With Patient Mobility And Safety Needs.",
    essentialFunctions: [
      "Monitor Patient Vitals And Report Abnormalities Immediately.",
      "Assist With Bathing, Feeding, Toileting, And Personal Hygiene.",
      "Document Daily Care Activities And Patient Progress.",
      "Transport Patients Safely Using Wheelchairs And Stretchers.",
      "Provide Emotional Support And Comfort To Patients And Families."
    ],
    description: "The Patient Care Technician (PCT) Is A Key Member Of The Clinical Team Responsible For Delivering Foundational Support To Patients And Clinical Staff. Under The Guidance Of Licensed Nursing Personnel, The PCT Assists With Direct Patient Care To Meet Each Patient's Physical, Emotional, And Social Conditions, And Ensures A Clean, Safe, And Healing-Centered Environment. PCTs Work Collaboratively With Interdisciplinary Teams To Promote Optimal Patient Outcomes."
  };

  // Function to create word-level diff
  const createWordDiff = (original: string, current: string): DiffSegment[] => {
    const originalWords = original.split(/(\s+|[\n\r]+)/);
    const currentWords = current.split(/(\s+|[\n\r]+)/);
    
    // Simple LCS-based diff algorithm
    const lcs = (arr1: string[], arr2: string[]) => {
      const m = arr1.length;
      const n = arr2.length;
      const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
      
      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          if (arr1[i - 1] === arr2[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1] + 1;
          } else {
            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          }
        }
      }
      
      const changes: DiffSegment[] = [];
      let i = m, j = n;
      
      while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && arr1[i - 1] === arr2[j - 1]) {
          changes.unshift({ type: 'unchanged', text: arr1[i - 1] });
          i--;
          j--;
        } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
          changes.unshift({ type: 'removed', text: arr1[i - 1] });
          i--;
        } else {
          changes.unshift({ type: 'added', text: arr2[j - 1] });
          j--;
        }
      }
      
      return changes;
    };
    
    return lcs(originalWords, currentWords);
  };

  // Function to render diff segments
  const renderDiffSegments = (segments: DiffSegment[]) => {
    return segments.map((segment, index) => {
      if (showDifferencesOnly && segment.type === 'unchanged') {
        return null;
      }

      let className = '';
      switch (segment.type) {
        case 'added':
          className = 'bg-green-100 text-green-800 font-medium';
          break;
        case 'removed':
          className = 'bg-red-100 text-red-800 line-through';
          break;
        case 'modified':
          className = 'bg-yellow-100 text-yellow-800 font-medium';
          break;
        default:
          className = '';
      }

      return (
        <span key={index} className={className}>
          {segment.text}
        </span>
      );
    });
  };

  // Create diffs for each section
  const jobSummaryDiff = createWordDiff(originalVersion.jobSummary, currentVersion.jobSummary);
  const descriptionDiff = createWordDiff(originalVersion.description, currentVersion.description);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <GitCompare className="w-6 h-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Compare Versions</h1>
                </div>
              </div>

              {/* Comparison Controls */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDifferencesOnly(!showDifferencesOnly)}
                    className="flex items-center space-x-2"
                  >
                    {showDifferencesOnly ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>{showDifferencesOnly ? "Show All" : "Diff Only"}</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSyncScroll(!syncScroll)}
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Sync Scroll</span>
                  </Button>
                </div>
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
            <div className="bg-white rounded-lg shadow-sm border-2 border-red-200">
              <div className="p-6 border-b bg-red-50">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-800">Original Job Description</h3>
                </div>
                <p className="text-sm text-red-600 mt-2">Last modified: May 15, 2025</p>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Job Summary</h4>
                  <div className="bg-gray-50 border rounded p-4 mb-4 text-sm leading-relaxed">
                    {renderDiffSegments(jobSummaryDiff)}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Essential Functions:</h4>
                  <div className="space-y-2 text-sm">
                    {originalVersion.essentialFunctions.map((func, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-gray-500 mt-0.5">{index + 1}.</span>
                        <span className={currentVersion.essentialFunctions[index] !== func ? "bg-red-100 text-red-800" : ""}>
                          {func}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Description</h4>
                  <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 border rounded p-4">
                    {renderDiffSegments(descriptionDiff)}
                  </div>
                </div>

                {/* Diff Legend */}
                <div className="border-t pt-4">
                  <h5 className="text-xs font-semibold text-gray-600 mb-2">Legend:</h5>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                      <span>Removed</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                      <span>Added</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Version */}
            <div className="bg-white rounded-lg shadow-sm border-2 border-green-200">
              <div className="p-6 border-b bg-green-50">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800">Current Version</h3>
                </div>
                <p className="text-sm text-green-600 mt-2">Last modified: June 7, 2025</p>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Job Summary</h4>
                  <div className="bg-gray-50 border rounded p-4 mb-4 text-sm leading-relaxed">
                    {renderDiffSegments(jobSummaryDiff)}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Essential Functions:</h4>
                  <div className="space-y-2 text-sm">
                    {currentVersion.essentialFunctions.map((func, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-gray-500 mt-0.5">{index + 1}.</span>
                        <span className={
                          index >= originalVersion.essentialFunctions.length 
                            ? "bg-green-100 text-green-800" 
                            : originalVersion.essentialFunctions[index] !== func 
                              ? "bg-green-100 text-green-800" 
                              : ""
                        }>
                          {func}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Description</h4>
                  <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 border rounded p-4">
                    {renderDiffSegments(descriptionDiff)}
                  </div>
                </div>

                {/* Statistics */}
                <div className="border-t pt-4">
                  <h5 className="text-xs font-semibold text-gray-600 mb-2">Changes Summary:</h5>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{currentVersion.essentialFunctions.length - originalVersion.essentialFunctions.length} functions added</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Multiple text improvements</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}