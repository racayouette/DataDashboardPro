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
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Database selection state
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedOriginalId, setSelectedOriginalId] = useState<number | null>(null);
  const [selectedCurrentId, setSelectedCurrentId] = useState<number | null>(null);

  // Text content state - populated from database
  const [originalJobSummary, setOriginalJobSummary] = useState("");
  const [currentJobSummary, setCurrentJobSummary] = useState("");
  const [originalEssentialFunctions, setOriginalEssentialFunctions] = useState("");
  const [currentEssentialFunctions, setCurrentEssentialFunctions] = useState("");
  const [originalDescription, setOriginalDescription] = useState("");
  const [currentDescription, setCurrentDescription] = useState("");

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
                    variant="outline"
                    size="sm"
                    onClick={() => setSyncScroll(!syncScroll)}
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Sync Scroll</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentJobSummary(currentJobSummary + " TEST");
                      console.log('Test diff triggered');
                    }}
                    className="text-xs"
                  >
                    Test Diff
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Database Job Selection */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Database Version Comparison</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Job</label>
                  <Select value={selectedJobId?.toString()} onValueChange={(value) => {
                    setSelectedJobId(parseInt(value));
                    setSelectedOriginalId(null);
                    setSelectedCurrentId(null);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a job..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(jobs as any)?.jobs?.map((job: any) => (
                        <SelectItem key={job.id} value={job.id.toString()}>
                          {job.title} ({job.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Original Version</label>
                  <Select 
                    value={selectedOriginalId?.toString()} 
                    onValueChange={(value) => setSelectedOriginalId(parseInt(value))}
                    disabled={!selectedJobId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select original..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(jobDescriptions as any)?.map((desc: any) => (
                        <SelectItem key={desc.id} value={desc.id.toString()}>
                          Version {desc.version} - {new Date(desc.lastUpdatedDate).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Version</label>
                  <Select 
                    value={selectedCurrentId?.toString()} 
                    onValueChange={(value) => setSelectedCurrentId(parseInt(value))}
                    disabled={!selectedJobId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select current..." />
                    </SelectTrigger>
                    <SelectContent>
                      {jobDescriptions?.map((desc: any) => (
                        <SelectItem key={desc.id} value={desc.id.toString()}>
                          Version {desc.version} - {new Date(desc.lastUpdatedDate).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoadingComparison && (
                <div className="mt-4 text-center text-blue-600">
                  Loading comparison data...
                </div>
              )}

              {selectedOriginalId && selectedCurrentId && comparisonData && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                  Successfully loaded comparison between Version {comparisonData.original.version} and Version {comparisonData.current.version}
                </div>
              )}
            </div>

            <Button variant="ghost" asChild className="mb-4 bg-gray-100 text-gray-600 hover:bg-gray-200 border-0 text-xs px-2 py-1 h-7">
              <Link href="/jobs-family">
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
                  <p className="text-sm text-green-600 mt-2">Last modified: June 7, 2025</p>
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

            {/* Footer Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200">
                <div className="p-6">
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
              <div className="bg-white rounded-lg shadow-sm border-2 border-green-200">
                <div className="p-6">
                  <div className="border-t pt-4">
                    <h5 className="text-xs font-semibold text-gray-600 mb-2">Changes Summary:</h5>
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Real-time comparison active</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Edit mode available</span>
                      </div>
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