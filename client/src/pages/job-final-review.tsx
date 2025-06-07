import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useRole } from "@/contexts/RoleContext";
import { 
  ArrowLeft, 
  Search, 
  Bell, 
  FileText, 
  Users, 
  BarChart, 
  Clock,
  Undo,
  RotateCcw,
  Plus,
  Pencil,
  Eye,
  Edit,
  GripVertical,
  Trash2,
  UserPlus,
  X,
  UserCheck,
  FileCheck
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";

export default function JobFinalReview() {
  const [, setLocation] = useLocation();
  const { isAdminMode } = useRole();
  const [jobCode, setJobCode] = useState("");

  // Get job code from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobCodeFromUrl = urlParams.get('jobCode');
    if (jobCodeFromUrl) {
      setJobCode(jobCodeFromUrl);
    }
  }, []);
  const originalEssentialFunctions = [
    { id: 1, text: "Record Vital Signs And Immediately Escalate Critical Values", hasEdit: true },
    { id: 2, text: "Aid With Patient Hygiene And Nutritional Needs", hasEdit: true },
    { id: 3, text: "Maintain Patient Care Logs And Coordinate With Nursing Staff", hasEdit: true },
    { id: 4, text: "Support Safe Patient Transport Within The Facility", hasEdit: true }
  ];
  const [essentialFunctions, setEssentialFunctions] = useState(originalEssentialFunctions);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [jobSummary, setJobSummary] = useState("Provides Patient Care Under Supervision. Assists Patients With Hygiene, Monitoring, And Treatment Goals.");
  const [originalJobSummary] = useState("Provides Patient Care Under Supervision. Assists Patients With Hygiene, Monitoring, And Treatment Goals.");
  const [isEditingJobSummary, setIsEditingJobSummary] = useState(false);
  const [trackChangesMode, setTrackChangesMode] = useState(true);
  const [changes, setChanges] = useState<Array<{type: 'delete' | 'insert', text: string, position: number}>>([]);
  const [showAddFunctionModal, setShowAddFunctionModal] = useState(false);
  const [newFunctionText, setNewFunctionText] = useState("");
  const [functionsHistory, setFunctionsHistory] = useState<Array<Array<{id: number, text: string, hasEdit: boolean}>>>([]);
  const [editingFunctionId, setEditingFunctionId] = useState<number | null>(null);
  const [editingFunctionText, setEditingFunctionText] = useState("");
  const [originalEditingText, setOriginalEditingText] = useState("");
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [showAcceptConfirmation, setShowAcceptConfirmation] = useState(false);
  const [lastUpdatedDate, setLastUpdatedDate] = useState("June 7, 2025");
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // State for managing multiple last edited by users
  const [lastEditedByUsers, setLastEditedByUsers] = useState<string[]>(["Sarah Mitchell"]);
  
  // State for managing reviewers
  const [reviewers, setReviewers] = useState<string[]>(["Kelly Johnson"]);
  
  // State for managing responsible users
  const [responsibleUsers, setResponsibleUsers] = useState<string[]>(["Jennifer Collins"]);
  
  // State to track if any changes have been made
  const [hasChanges, setHasChanges] = useState(false);
  
  // State for Compare Versions modal
  const [showCompareModal, setShowCompareModal] = useState(false);
  
  // State for additional text section
  const [additionalText, setAdditionalText] = useState("");
  const [originalAdditionalText] = useState("Additional requirements and considerations for this role may include specialized training, certifications, or equipment handling protocols.");
  const [isEditingAdditionalText, setIsEditingAdditionalText] = useState(false);
  const [showAdditionalTextCommentModal, setShowAdditionalTextCommentModal] = useState(false);
  const [additionalTextComment, setAdditionalTextComment] = useState("");
  const [isCritical, setIsCritical] = useState(false);
  const [status, setStatus] = useState("Completed");

  // State for Job Summary popup editor
  const [showJobSummaryPopup, setShowJobSummaryPopup] = useState(false);
  const [popupJobSummary, setPopupJobSummary] = useState("");
  const [popupOriginalJobSummary, setPopupOriginalJobSummary] = useState("");
  const [popupTrackChangesMode, setPopupTrackChangesMode] = useState(true);
  const [popupChanges, setPopupChanges] = useState<Array<{type: 'delete' | 'insert', text: string, position: number}>>([]);
  const [popupHistory, setPopupHistory] = useState<string[]>([]);
  const [showJobSummaryCloseConfirmation, setShowJobSummaryCloseConfirmation] = useState(false);
  
  // Function to check for changes
  const checkForChanges = () => {
    // Check if job summary has changed
    const summaryChanged = jobSummary !== originalJobSummary;
    
    // Check if essential functions order has changed
    const functionsOrderChanged = JSON.stringify(essentialFunctions.map(f => f.id)) !== 
                                 JSON.stringify(originalEssentialFunctions.map(f => f.id));
    
    // Check if essential functions content has changed
    const functionsContentChanged = JSON.stringify(essentialFunctions) !== 
                                   JSON.stringify(originalEssentialFunctions);
    
    // Check if new functions have been added
    const functionsCountChanged = essentialFunctions.length !== originalEssentialFunctions.length;
    
    const hasAnyChanges = summaryChanged || functionsOrderChanged || functionsContentChanged || functionsCountChanged;
    setHasChanges(hasAnyChanges);
  };
  
  // Available users for assignment
  const availableUsers = [
    "John Smith",
    "Sarah Johnson", 
    "Michael Brown",
    "Emily Davis",
    "David Wilson",
    "John Mark",
    "Sarah Mitchell",
    "Kelly Johnson",
    "Robert Kennedy",
    "Adam Lambert",
    "Jennifer Williams",
    "Michael Roberts",
    "Linda Taylor",
    "David Phillips",
    "Emma Sullivan",
    "Chris Harrison"
  ];

  // Sample notifications matching dashboard
  const [notifications, setNotifications] = useState([
    "10001 was reviewed and needs your approval",
    "Review deadline approaching",
    "New job submitted 10002", 
    "Status update required for 10003",
    "Feedback pending approval"
  ]);

  // Function to render notification text with job code links
  const renderNotificationWithLinks = (text: string) => {
    // Regex to match job codes (4-5 digit numbers)
    const jobCodeRegex = /(\d{4,5})/g;
    const parts = text.split(jobCodeRegex);
    
    return parts.map((part, index) => {
      if (jobCodeRegex.test(part)) {
        return (
          <Link 
            key={index} 
            href={`/editing?job=${part}`}
            className="text-blue-600 hover:text-blue-800 underline"
            onClick={() => setJobCode(part)}
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  // Effect to extract job code from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobParam = urlParams.get('job');
    if (jobParam) {
      setJobCode(jobParam);
    }
  }, []);

  // Effect to check for changes whenever essential functions or job summary change
  useEffect(() => {
    checkForChanges();
  }, [essentialFunctions, jobSummary]);

  // Effect to close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Functions for drag and drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedItem === null) return;

    const newFunctions = [...essentialFunctions];
    const draggedFunction = newFunctions[draggedItem];
    
    // Remove the dragged item
    newFunctions.splice(draggedItem, 1);
    
    // Insert at new position
    newFunctions.splice(dropIndex, 0, draggedFunction);
    
    // Save current state to history before making changes
    setFunctionsHistory(prev => [...prev, essentialFunctions]);
    
    setEssentialFunctions(newFunctions);
    setDraggedItem(null);
    updateLastModifiedDate();
  };

  // Function to create text diff for change tracking
  const createTextDiff = (original: string, current: string) => {
    // Simple diff implementation
    const originalWords = original.split(/(\s+)/);
    const currentWords = current.split(/(\s+)/);
    const result = [];
    let originalIndex = 0;
    let currentIndex = 0;

    while (originalIndex < originalWords.length || currentIndex < currentWords.length) {
      if (originalIndex >= originalWords.length) {
        // Rest are insertions
        while (currentIndex < currentWords.length) {
          if (currentWords[currentIndex].trim()) {
            result.push({ type: 'insert', text: currentWords[currentIndex] });
          } else {
            result.push({ type: 'unchanged', text: currentWords[currentIndex] });
          }
          currentIndex++;
        }
      } else if (currentIndex >= currentWords.length) {
        // Rest are deletions
        while (originalIndex < originalWords.length) {
          if (originalWords[originalIndex].trim()) {
            result.push({ type: 'delete', text: originalWords[originalIndex] });
          } else {
            result.push({ type: 'unchanged', text: originalWords[originalIndex] });
          }
          originalIndex++;
        }
      } else if (originalWords[originalIndex] === currentWords[currentIndex]) {
        // Same word
        result.push({ type: 'unchanged', text: originalWords[originalIndex] });
        originalIndex++;
        currentIndex++;
      } else {
        // Different words - mark as delete and insert
        if (originalWords[originalIndex].trim()) {
          result.push({ type: 'delete', text: originalWords[originalIndex] });
        } else {
          result.push({ type: 'unchanged', text: originalWords[originalIndex] });
        }
        originalIndex++;
        
        if (currentIndex < currentWords.length) {
          if (currentWords[currentIndex].trim()) {
            result.push({ type: 'insert', text: currentWords[currentIndex] });
          } else {
            result.push({ type: 'unchanged', text: currentWords[currentIndex] });
          }
          currentIndex++;
        }
      }
    }

    return result;
  };

  const renderTrackedChanges = () => {
    // Always show clean text in the main view, regardless of track changes mode
    return <p className="text-sm mb-4">{jobSummary}</p>;
  };

  const handleAddNewFunction = () => {
    if (newFunctionText.trim()) {
      const newFunction = {
        id: Math.max(...essentialFunctions.map(f => f.id), 0) + 1,
        text: newFunctionText.trim(),
        hasEdit: false
      };
      
      // Save current state to history
      setFunctionsHistory(prev => [...prev, essentialFunctions]);
      
      setEssentialFunctions(prev => [...prev, newFunction]);
      setNewFunctionText("");
      setShowAddFunctionModal(false);
      updateLastModifiedDate();
    }
  };

  const handleCancelAddFunction = () => {
    setNewFunctionText("");
    setShowAddFunctionModal(false);
  };

  const handleUndoMove = () => {
    if (functionsHistory.length > 0) {
      const previousState = functionsHistory[functionsHistory.length - 1];
      setEssentialFunctions(previousState);
      setFunctionsHistory(prev => prev.slice(0, -1));
      updateLastModifiedDate();
    }
  };

  const handleResetFunctions = () => {
    setEssentialFunctions(originalEssentialFunctions);
    setFunctionsHistory([]);
    updateLastModifiedDate();
  };

  const handleResetJobSummary = () => {
    setJobSummary(originalJobSummary);
    updateLastModifiedDate();
  };

  const handleEditFunction = (functionId: number, currentText: string) => {
    setEditingFunctionId(functionId);
    setEditingFunctionText(currentText);
    setOriginalEditingText(currentText);
  };

  const handleSaveEditFunction = () => {
    if (editingFunctionId !== null) {
      // Save current state to history
      setFunctionsHistory(prev => [...prev, essentialFunctions]);
      
      setEssentialFunctions(prev => 
        prev.map(func => 
          func.id === editingFunctionId 
            ? { ...func, text: editingFunctionText, hasEdit: true }
            : func
        )
      );
      setEditingFunctionId(null);
      setEditingFunctionText("");
      setOriginalEditingText("");
      updateLastModifiedDate();
    }
  };

  const handleCancelEditFunction = () => {
    setEditingFunctionId(null);
    setEditingFunctionText(originalEditingText);
    setOriginalEditingText("");
  };

  const handleDeleteFunction = (functionId: number) => {
    // Save current state to history
    setFunctionsHistory(prev => [...prev, essentialFunctions]);
    
    setEssentialFunctions(prev => prev.filter(func => func.id !== functionId));
    updateLastModifiedDate();
  };

  const handleEditJobSummary = () => {
    setPopupJobSummary(jobSummary);
    setPopupOriginalJobSummary(jobSummary);
    setPopupHistory([jobSummary]);
    setShowJobSummaryPopup(true);
  };

  const handleSaveDraft = () => {
    updateLastModifiedDate();
    console.log("Draft saved");
  };

  const handleSubmitForReview = () => {
    setShowSubmitConfirmation(true);
  };

  const confirmSubmitForReview = () => {
    updateLastModifiedDate();
    
    // Add notification with the current job number
    const currentJobCode = jobCode || "10001"; // Use actual job code or fallback
    const newNotification = `${currentJobCode} was reviewed and needs your approval`;
    setNotifications(prev => [newNotification, ...prev]);
    
    setShowSubmitConfirmation(false);
  };

  const cancelSubmitForReview = () => {
    setShowSubmitConfirmation(false);
  };

  const handleAcceptChanges = () => {
    setShowAcceptConfirmation(true);
  };

  const handleConfirmAcceptChanges = () => {
    updateLastModifiedDate();
    setShowAcceptConfirmation(false);
    // Logic to accept all changes and finalize the job description
    console.log("All changes accepted and finalized");
  };

  const handleCancelAcceptChanges = () => {
    setShowAcceptConfirmation(false);
  };

  const handleCompareVersions = () => {
    setShowCompareModal(true);
  };

  const handleComplete = () => {
    updateLastModifiedDate();
    setStatus("Complete");
    console.log("Job description marked as complete");
  };

  const handleEditAdditionalText = () => {
    setIsEditingAdditionalText(true);
  };

  const handleSaveAdditionalText = () => {
    setIsEditingAdditionalText(false);
    updateLastModifiedDate();
  };

  const handleCancelAdditionalText = () => {
    setAdditionalText(originalAdditionalText);
    setIsEditingAdditionalText(false);
  };

  const handleAdditionalTextComment = () => {
    setShowAdditionalTextCommentModal(true);
  };

  const handleSaveAdditionalTextComment = () => {
    // Save the comment functionality here
    console.log("Additional text comment saved:", additionalTextComment);
    setShowAdditionalTextCommentModal(false);
    setAdditionalTextComment("");
  };

  const handleCancelAdditionalTextComment = () => {
    setShowAdditionalTextCommentModal(false);
    setAdditionalTextComment("");
  };

  // Function to update last modified date
  const updateLastModifiedDate = () => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    setLastUpdatedDate(formattedDate);
  };

  // Helper function to count words
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Helper functions for user management
  const getAvailableReviewers = () => {
    return availableUsers.filter(user => !reviewers.includes(user));
  };

  const getAvailableResponsibleUsers = () => {
    return availableUsers.filter(user => !responsibleUsers.includes(user));
  };

  const addReviewer = (user: string) => {
    setReviewers(prev => [...prev, user]);
  };

  const removeReviewer = (user: string) => {
    if (reviewers.length > 1) {
      setReviewers(prev => prev.filter(r => r !== user));
    }
  };

  const addResponsibleUser = (user: string) => {
    setResponsibleUsers(prev => [...prev, user]);
  };

  const removeResponsibleUser = (user: string) => {
    if (responsibleUsers.length > 1) {
      setResponsibleUsers(prev => prev.filter(r => r !== user));
    }
  };

  // Popup editor functions
  const handlePopupJobSummaryChange = (newText: string) => {
    if (popupTrackChangesMode) {
      // Add to history if text changed
      if (newText !== popupHistory[popupHistory.length - 1]) {
        setPopupHistory(prev => [...prev, newText]);
      }
    }
    setPopupJobSummary(newText);
  };

  const handlePopupUndo = () => {
    if (popupHistory.length > 1) {
      const newHistory = popupHistory.slice(0, -1);
      setPopupHistory(newHistory);
      setPopupJobSummary(newHistory[newHistory.length - 1]);
    }
  };

  const handlePopupOK = () => {
    setJobSummary(popupJobSummary);
    setShowJobSummaryPopup(false);
    updateLastModifiedDate();
  };

  const handlePopupCancel = () => {
    const hasChanges = popupJobSummary !== popupOriginalJobSummary;
    if (hasChanges) {
      setShowJobSummaryCloseConfirmation(true);
    } else {
      setPopupJobSummary(popupOriginalJobSummary);
      setShowJobSummaryPopup(false);
    }
  };

  const handleConfirmJobSummaryClose = () => {
    setPopupJobSummary(popupOriginalJobSummary);
    setShowJobSummaryPopup(false);
    setShowJobSummaryCloseConfirmation(false);
  };

  const handleCancelJobSummaryClose = () => {
    setShowJobSummaryCloseConfirmation(false);
  };

  const renderPopupTrackedChanges = () => {
    if (!popupTrackChangesMode) {
      return (
        <div className="flex-1 p-4 border border-gray-300 rounded-lg bg-gray-50 overflow-y-auto">
          <p className="text-sm text-gray-500 italic">Track changes is disabled</p>
        </div>
      );
    }

    const diff = createTextDiff(popupOriginalJobSummary, popupJobSummary);
    
    return (
      <div className="flex-1 p-4 border border-gray-300 rounded-lg bg-white overflow-y-auto">
        <div className="text-sm leading-relaxed">
          {diff.map((change, index) => {
            if (change.type === 'unchanged') {
              return <span key={index}>{change.text}</span>;
            } else if (change.type === 'delete') {
              return (
                <span 
                  key={index} 
                  className="bg-red-100 text-red-700 line-through decoration-red-500"
                  title="Deleted text"
                >
                  {change.text}
                </span>
              );
            } else if (change.type === 'insert') {
              return (
                <span 
                  key={index} 
                  className="bg-green-100 text-green-700 font-medium"
                  title="Added text"
                >
                  {change.text}
                </span>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Beta Banner */}
          <div className="mb-4 bg-orange-100 border border-orange-300 text-orange-800 px-4 py-3 rounded-lg">
            <div className="flex items-center justify-center">
              <span className="font-semibold text-sm">⚠️ NOT FOR PRODUCTION - RELEASE BETA 1.0</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <FileCheck className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Job Final Review</h1>
                <p className="text-sm text-gray-600 mt-1">Job Code: {jobCode || "Loading..."}</p>
              </div>
            </div>
            
            <Button variant="ghost" asChild className="mb-4 bg-gray-100 text-gray-600 hover:bg-gray-200 border-0 text-xs px-2 py-1 h-7">
              <Link href="/jobs-family">
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back
              </Link>
            </Button>
          </div>

          {/* Job Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Job Title</span>
              </div>
              <p className="text-blue-600 font-semibold">Patient Care Technician</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Job Family</span>
              </div>
              <p className="text-blue-600 font-semibold">Clinical Support</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-600">Status</span>
              </div>
              <Badge className={status === "Completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>{status}</Badge>
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Edit className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Last Edited By</span>
              </div>
              <p className="text-blue-600 font-semibold">Sarah Mitchell</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Functional Leaders</span>
                </div>
              </div>
              <div className="space-y-2">
                {reviewers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between bg-green-50 px-2 py-1 rounded">
                    <span className="text-green-700 font-medium text-sm">{user}</span>
                    {reviewers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-red-100"
                        onClick={() => removeReviewer(user)}
                        title={`Remove ${user}`}
                      >
                        <X className="w-3 h-3 text-red-500 hover:text-red-700" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Responsible</span>
                </div>
              </div>
              <div className="space-y-2">
                {responsibleUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between bg-purple-50 px-2 py-1 rounded">
                    <span className="text-purple-700 font-medium text-sm">{user}</span>
                    {responsibleUsers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-red-100"
                        onClick={() => removeResponsibleUser(user)}
                        title={`Remove ${user}`}
                      >
                        <X className="w-3 h-3 text-red-500 hover:text-red-700" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Last Updated</span>
              </div>
              <p className="text-blue-600 font-semibold">June 7, 2025</p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="max-w-4xl mx-auto mb-8">
            {/* Updated Job Description */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Updated Job Description</h3>
                    <p className="text-sm text-gray-600 mt-1">Job Code: {jobCode || "Loading..."}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Job Summary</h4>
                  </div>
                  <div className="p-4">
                    <p className="text-sm">{jobSummary}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Essential Functions</h4>
                  </div>
                  <div className="space-y-3 pl-4">
                    {essentialFunctions.map((func, index) => (
                      <div key={func.id} className="flex items-start gap-3">
                        <span className="flex-shrink-0 mt-0.5 text-sm font-bold">•</span>
                        <p className="text-sm flex-1 leading-relaxed">{func.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Additional Requirements</h4>
                  </div>
                  <div className="p-4">
                    <p className="text-sm italic">{additionalText || originalAdditionalText}</p>
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