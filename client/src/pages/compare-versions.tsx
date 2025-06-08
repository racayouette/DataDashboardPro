import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitCompare, ArrowLeft, FileText, Eye, EyeOff, RefreshCw, Edit3, Database } from "lucide-react";
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
  const [isEditMode, setIsEditMode] = useState(true);
  
  // Get lastUpdatedDate from URL parameters
  const [lastUpdatedDate, setLastUpdatedDate] = useState("June 7, 2025");
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const lastUpdatedFromUrl = urlParams.get('lastUpdated');
    if (lastUpdatedFromUrl) {
      setLastUpdatedDate(decodeURIComponent(lastUpdatedFromUrl));
    }
  }, []);
  
  // Database selection state
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedOriginalId, setSelectedOriginalId] = useState<number | null>(null);
  const [selectedCurrentId, setSelectedCurrentId] = useState<number | null>(null);

  // Text content state - populated with Job Description Review page data
  const [originalJobSummary, setOriginalJobSummary] = useState("• Provides Direct Patient Care Under Supervision. Monitors Patient Condition And Reports\n• Changes To The Medical Team. Maintains Accurate Records And Assists With Mobility Needs.");
  const [currentJobSummary, setCurrentJobSummary] = useState("• Provides Comprehensive Patient Care Under Licensed Supervision. Monitors Patient Condition And Reports\n• Critical Changes To The Medical Team. Maintains Detailed Records And Assists With Patient Mobility And Safety Needs.");
  const [originalEssentialFunctions, setOriginalEssentialFunctions] = useState("1. Monitor Patient Vitals And Report Abnormalities.\n2. Assist With Bathing, Feeding, And Toileting.\n3. Document Daily Care Activities.\n4. Transport Patients Using Wheelchairs And Stretchers.");
  const [currentEssentialFunctions, setCurrentEssentialFunctions] = useState("1. Record Vital Signs And Immediately Escalate Critical Values\n2. Aid With Patient Hygiene And Nutritional Needs\n3. Maintain Patient Care Logs And Coordinate With Nursing Staff\n4. Support Safe Patient Transport Within The Facility");
  const [originalDescription, setOriginalDescription] = useState("The Patient Care Technician (PCT) Is A Key Member Of The Clinical Team Responsible For Delivering Foundational Support To Patients And Clinical Staff. Under The Guidance Of Licensed Nursing Personnel, The PCT Assists With Direct Patient Care To Meet Each Patient's Physical And Emotional Conditions, And Ensures A Clean, Safe, And Healing-Centered Environment.");
  const [currentDescription, setCurrentDescription] = useState("Additional requirements and considerations for this role may include specialized training, certifications, or equipment handling protocols.");

  // Real-time diff calculations
  const [jobSummaryDiff, setJobSummaryDiff] = useState<DiffSegment[]>([]);
  const [essentialFunctionsDiff, setEssentialFunctionsDiff] = useState<DiffSegment[]>([]);
  const [descriptionDiff, setDescriptionDiff] = useState<DiffSegment[]>([]);

  // Fetch jobs list for selection
  const { data: jobs } = useQuery({
    queryKey: ['/api/jobs'],
    enabled: true
  });

  // Fetch job descriptions for selected job
  const { data: jobDescriptions } = useQuery({
    queryKey: ['/api/jobs', selectedJobId, 'descriptions'],
    enabled: !!selectedJobId
  });

  // Fetch comparison data when both versions are selected
  const { data: comparisonData, isLoading: isLoadingComparison } = useQuery({
    queryKey: ['/api/job-descriptions', selectedOriginalId, 'compare', selectedCurrentId],
    enabled: !!selectedOriginalId && !!selectedCurrentId
  });

  // Update text content when comparison data loads
  useEffect(() => {
    if (comparisonData) {
      const data = comparisonData as any;
      if (data?.original && data?.current) {
        setOriginalJobSummary(data.original.jobSummary || '');
        setCurrentJobSummary(data.current.jobSummary || '');
        setOriginalEssentialFunctions(data.original.essentialFunctions || '');
        setCurrentEssentialFunctions(data.current.essentialFunctions || '');
        setOriginalDescription(data.original.description || '');
        setCurrentDescription(data.current.description || '');
      }
    }
  }, [comparisonData]);

  // Automatically switch from Edit Mode to View Mode after page loads
  useEffect(() => {
    // Scroll to top of page when component mounts
    window.scrollTo(0, 0);
    
    const timer = setTimeout(() => {
      setIsEditMode(false);
    }, 2000); // Switch to View Mode after 2 seconds

    return () => clearTimeout(timer);
  }, []);

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

  // Initialize diffs on mount and update in real-time
  useEffect(() => {
    const updateDiffs = () => {
      try {
        const jobDiff = createWordDiff(originalJobSummary, currentJobSummary);
        const functionsDiff = createWordDiff(originalEssentialFunctions, currentEssentialFunctions);
        const descDiff = createWordDiff(originalDescription, currentDescription);
        
        console.log('Job Summary Diff:', jobDiff.length, 'segments');
        console.log('Functions Diff:', functionsDiff.length, 'segments');
        console.log('Description Diff:', descDiff.length, 'segments');
        
        setJobSummaryDiff(jobDiff);
        setEssentialFunctionsDiff(functionsDiff);
        setDescriptionDiff(descDiff);
      } catch (error) {
        console.error('Error calculating diffs:', error);
      }
    };

    updateDiffs();
  }, [originalJobSummary, currentJobSummary, originalEssentialFunctions, currentEssentialFunctions, originalDescription, currentDescription]);

  // Function to render diff segments for current version (right side)
  const renderDiffSegments = (segments: DiffSegment[]) => {
    if (!segments || segments.length === 0) {
      return <span>No content to compare</span>;
    }

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

  // Function to render original text with word-by-word highlighting
  const renderOriginalWithDiff = (segments: DiffSegment[]) => {
    if (!segments || segments.length === 0) {
      return <span>No content to compare</span>;
    }

    return segments.map((segment, index) => {
      if (showDifferencesOnly && segment.type === 'unchanged') {
        return null;
      }

      let className = '';
      switch (segment.type) {
        case 'removed':
          className = 'bg-red-100 text-red-800 line-through';
          break;
        case 'added':
          // Don't show added text in original, but add spacing
          return <span key={index} className="text-transparent select-none">{segment.text}</span>;
        case 'modified':
          className = 'bg-yellow-100 text-yellow-800';
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

  // Helper function to render essential functions as numbered list
  const renderEssentialFunctionsList = (text: string, isOriginal: boolean = false) => {
    if (!text) return null;
    const functions = text.split('\n').filter(f => f.trim());
    return functions.map((func, index) => (
      <div key={index} className="flex items-start space-x-2 mb-2">
        <span className="text-gray-500 mt-0.5">{index + 1}.</span>
        <span>{func}</span>
      </div>
    ));
  };

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
                    onClick={() => setIsEditMode(!isEditMode)}
                    className="flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{isEditMode ? "View Mode" : "Edit Mode"}</span>
                  </Button>
                  
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
                    variant={syncScroll ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSyncScroll(!syncScroll)}
                    className={`flex items-center space-x-2 ${
                      syncScroll 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "bg-white hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Sync Scroll</span>
                  </Button>
                </div>
              </div>
            </div>
            


            <Button variant="ghost" asChild className="mb-4 bg-gray-100 text-gray-600 hover:bg-gray-200 border-0 text-xs px-2 py-1 h-7">
              <Link href="/editing">
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back
              </Link>
            </Button>
          </div>

          {/* Comparison Boxes with Synchronized Sections */}
          <div className="space-y-8">
            {/* Headers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200">
                <div className="p-6 border-b bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Original Job Description</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Last modified: May 15, 2025</p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border-2 border-green-200">
                <div className="p-6 border-b bg-green-50">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-800">Current Version</h3>
                  </div>
                  <p className="text-sm text-green-600 mt-2">Last Updated {lastUpdatedDate}</p>
                </div>
              </div>
            </div>

            {/* Job Summary Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200">
                <div className="p-6">
                  <h4 className="font-semibold mb-3">Job Summary</h4>
                  {isEditMode ? (
                    <Textarea
                      value={originalJobSummary}
                      onChange={(e) => setOriginalJobSummary(e.target.value)}
                      className="min-h-[120px] text-sm font-mono"
                      placeholder="Enter original job summary..."
                    />
                  ) : (
                    <div className="bg-gray-50 border rounded p-4 text-sm leading-relaxed whitespace-pre-wrap">
                      {renderOriginalWithDiff(jobSummaryDiff)}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border-2 border-green-200">
                <div className="p-6">
                  <h4 className="font-semibold mb-3">Job Summary</h4>
                  {isEditMode ? (
                    <Textarea
                      value={currentJobSummary}
                      onChange={(e) => setCurrentJobSummary(e.target.value)}
                      className="min-h-[120px] text-sm font-mono"
                      placeholder="Enter current job summary..."
                    />
                  ) : (
                    <div className="bg-gray-50 border rounded p-4 text-sm leading-relaxed whitespace-pre-wrap">
                      {renderDiffSegments(jobSummaryDiff)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Essential Functions Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200">
                <div className="p-6">
                  <h4 className="font-semibold mb-3">Essential Functions:</h4>
                  {isEditMode ? (
                    <Textarea
                      value={originalEssentialFunctions}
                      onChange={(e) => setOriginalEssentialFunctions(e.target.value)}
                      className="min-h-[150px] text-sm font-mono"
                      placeholder="Enter functions separated by line breaks..."
                    />
                  ) : (
                    <div className="space-y-2 text-sm whitespace-pre-wrap">
                      {renderOriginalWithDiff(essentialFunctionsDiff)}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border-2 border-green-200">
                <div className="p-6">
                  <h4 className="font-semibold mb-3">Essential Functions:</h4>
                  {isEditMode ? (
                    <Textarea
                      value={currentEssentialFunctions}
                      onChange={(e) => setCurrentEssentialFunctions(e.target.value)}
                      className="min-h-[150px] text-sm font-mono"
                      placeholder="Enter functions separated by line breaks..."
                    />
                  ) : (
                    <div className="space-y-2 text-sm">
                      <div className="whitespace-pre-wrap">{renderDiffSegments(essentialFunctionsDiff)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description Section - Now Always Aligned */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200">
                <div className="p-6">
                  <h4 className="font-semibold mb-3">Description</h4>
                  {isEditMode ? (
                    <Textarea
                      value={originalDescription}
                      onChange={(e) => setOriginalDescription(e.target.value)}
                      className="min-h-[200px] text-sm font-mono"
                      placeholder="Enter original description..."
                    />
                  ) : (
                    <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 border rounded p-4 whitespace-pre-wrap">
                      {renderOriginalWithDiff(descriptionDiff)}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border-2 border-green-200">
                <div className="p-6">
                  <h4 className="font-semibold mb-3">Description</h4>
                  {isEditMode ? (
                    <Textarea
                      value={currentDescription}
                      onChange={(e) => setCurrentDescription(e.target.value)}
                      className="min-h-[200px] text-sm font-mono"
                      placeholder="Enter current description..."
                    />
                  ) : (
                    <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 border rounded p-4 whitespace-pre-wrap">
                      {renderDiffSegments(descriptionDiff)}
                    </div>
                  )}
                </div>
              </div>
            </div>


          </div>
        </div>
      </main>
    </div>
  );
}