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
  UserCheck
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";

export default function JobFinalReview() {
  const [, setLocation] = useLocation();
  const { isAdminMode } = useRole();
  const [jobCode, setJobCode] = useState("");
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
  const [lastUpdatedDate, setLastUpdatedDate] = useState("May 30, 2025");
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
  const [status, setStatus] = useState("In Progress");

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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <Edit className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Job Final Review</h1>
                <p className="text-sm text-gray-600 mt-1">Job Code: 10001</p>
              </div>
            </div>
            
            <Button variant="outline" asChild className="mb-4">
              <Link href="/jobs-family">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>

          {/* Job Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
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
              <Badge className={status === "Complete" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>{status}</Badge>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Last Updated</span>
              </div>
              <p className="text-blue-600 font-semibold">May 30, 2025</p>
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
                  <span className="text-sm font-medium text-gray-600">Reviewers</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost" 
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-green-50"
                      disabled={getAvailableReviewers().length === 0}
                    >
                      <UserPlus className="w-3 h-3 text-green-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {getAvailableReviewers().map((user) => (
                      <DropdownMenuItem
                        key={user}
                        onClick={() => addReviewer(user)}
                        className="cursor-pointer"
                      >
                        {user}
                      </DropdownMenuItem>
                    ))}
                    {getAvailableReviewers().length === 0 && (
                      <DropdownMenuItem disabled>
                        All users added
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost" 
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-purple-50"
                      disabled={getAvailableResponsibleUsers().length === 0}
                    >
                      <UserPlus className="w-3 h-3 text-purple-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {getAvailableResponsibleUsers().map((user) => (
                      <DropdownMenuItem
                        key={user}
                        onClick={() => addResponsibleUser(user)}
                        className="cursor-pointer"
                      >
                        {user}
                      </DropdownMenuItem>
                    ))}
                    {getAvailableResponsibleUsers().length === 0 && (
                      <DropdownMenuItem disabled>
                        All users added
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
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
              <p className="text-blue-600 font-semibold">May 30, 2025</p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Original Job Description */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold">Original Job Description</h3>
                </div>
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
                  <h4 className="font-semibold mb-3">Essential Functions</h4>
                  <div className="space-y-3">
                    {originalEssentialFunctions.map((func, index) => (
                      <div key={func.id} className="bg-blue-50 border-l-4 border-blue-500 p-4">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <p className="text-sm flex-1">{func.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Additional Requirements</h4>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                    <p className="text-sm italic">{originalAdditionalText}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI-Generated Job Description */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                    <h3 className="text-lg font-semibold">AI-Generated Job Description</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Last Updated {lastUpdatedDate}</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Job Summary</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox"
                          id="track-changes"
                          checked={trackChangesMode}
                          onChange={(e) => setTrackChangesMode(e.target.checked)}
                          className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <label 
                          htmlFor="track-changes" 
                          className="text-xs font-medium cursor-pointer"
                        >
                          Track Changes
                        </label>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={handleEditJobSummary}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={handleResetJobSummary}
                        title="Reset to original job summary"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {isEditingJobSummary ? (
                    <div className="space-y-2">
                      <Textarea
                        value={jobSummary}
                        onChange={(e) => setJobSummary(e.target.value)}
                        className="text-sm min-h-[80px]"
                        placeholder="Enter job summary..."
                      />
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setIsEditingJobSummary(false);
                            if (trackChangesMode) {
                              setTrackChangesMode(true);
                            }
                          }}
                        >
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setJobSummary(originalJobSummary);
                            setIsEditingJobSummary(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    renderTrackedChanges()
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Essential Functions</h4>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={handleUndoMove}
                        disabled={functionsHistory.length === 0}
                        title="Undo last move"
                      >
                        <Undo className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={handleResetFunctions}
                        title="Reset to original functions"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setShowAddFunctionModal(true)}
                        title="Add new function"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {essentialFunctions.map((func, index) => (
                      <div 
                        key={func.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="bg-blue-50 border-l-4 border-blue-500 p-4 cursor-move hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <GripVertical className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            {editingFunctionId === func.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editingFunctionText}
                                  onChange={(e) => setEditingFunctionText(e.target.value)}
                                  className="text-sm"
                                  autoFocus
                                />
                                <div className="flex space-x-2">
                                  <Button size="sm" onClick={handleSaveEditFunction}>
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={handleCancelEditFunction}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm">{func.text}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            {func.hasEdit && (
                              <div className="w-2 h-2 bg-green-500 rounded-full" title="Modified"></div>
                            )}
                            {editingFunctionId !== func.id && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleEditFunction(func.id, func.text)}
                                  title="Edit function"
                                >
                                  <Pencil className="w-3 h-3 text-blue-600 hover:text-blue-800" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleDeleteFunction(func.id)}
                                  title="Delete function"
                                >
                                  <Trash2 className="w-3 h-3 text-red-500 hover:text-red-700" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Additional Requirements</h4>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={handleEditAdditionalText}
                        disabled={isEditingAdditionalText}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={handleAdditionalTextComment}
                        title="Add comment"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {isEditingAdditionalText ? (
                    <div className="space-y-2">
                      <Textarea
                        value={additionalText}
                        onChange={(e) => setAdditionalText(e.target.value)}
                        className="text-sm min-h-[80px]"
                        placeholder="Enter additional requirements..."
                      />
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={handleSaveAdditionalText}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelAdditionalText}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                      <p className="text-sm italic">{additionalText || originalAdditionalText}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mb-8">
            <Button 
              variant="outline"
              onClick={handleSaveDraft}
            >
              Save Draft
            </Button>
            {!isAdminMode && (
              <Button 
                className="bg-blue-900 text-white hover:bg-blue-800"
                onClick={handleSubmitForReview}
              >
                Submit For HR Review
              </Button>
            )}
            {!isAdminMode && (
              <Button 
                className={(hasChanges || isCritical) ? "bg-gray-400 text-white cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}
                onClick={handleAcceptChanges}
                disabled={hasChanges || isCritical}
              >
                Accept Changes
              </Button>
            )}
            {isAdminMode && (
              <Button 
                className="bg-green-500 text-white hover:bg-green-600"
                onClick={handleComplete}
              >
                Complete
              </Button>
            )}
            <Button 
              variant="outline"
              className="bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200"
              onClick={handleCompareVersions}
            >
              Compare Versions
            </Button>
          </div>
        </div>
      </main>

      {/* Add New Function Modal */}
      <Dialog open={showAddFunctionModal} onOpenChange={(open) => {
        if (!open) {
          // Prevent closing unless explicitly cancelled or saved
          return;
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Essential Function</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="function-text" className="text-sm font-medium">
                Function Description
              </label>
              <Textarea
                id="function-text"
                value={newFunctionText}
                onChange={(e) => setNewFunctionText(e.target.value)}
                placeholder="Enter the new essential function description..."
                className="min-h-[100px]"
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleCancelAddFunction}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNewFunction}
              disabled={!newFunctionText.trim()}
            >
              Add Function
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Additional Text Comment Modal */}
      <Dialog open={showAdditionalTextCommentModal} onOpenChange={setShowAdditionalTextCommentModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Comment for Additional Requirements</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="additional-text-comment" className="text-sm font-medium">
                Comment
              </label>
              <Textarea
                id="additional-text-comment"
                value={additionalTextComment}
                onChange={(e) => setAdditionalTextComment(e.target.value)}
                placeholder="Enter your comment about the additional requirements..."
                className="min-h-[100px]"
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleCancelAdditionalTextComment}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAdditionalTextComment}
              disabled={!additionalTextComment.trim()}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compare Versions Modal */}
      <Dialog open={showCompareModal} onOpenChange={setShowCompareModal}>
        <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">Compare Versions</DialogTitle>
          </DialogHeader>
          <div className="flex h-full p-6 pt-0 gap-6">
            {/* Original Job Description Box */}
            <div className="flex-1 flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Original Job Description</h3>
                <p className="text-sm text-gray-500">Last modified: May 15, 2025</p>
              </div>
              <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Job Summary */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Job Summary</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">{originalJobSummary}</p>
                    </div>
                  </div>
                  
                  {/* Essential Functions */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Essential Functions</h4>
                    <div className="space-y-3">
                      {originalEssentialFunctions.map((func, index) => (
                        <div key={func.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <p className="text-sm text-gray-700 flex-1">{func.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Comments</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 italic">{originalAdditionalText}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Version Box */}
            <div className="flex-1 flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Current Version</h3>
                <p className="text-sm text-gray-500">Last modified: {lastUpdatedDate}</p>
              </div>
              <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Job Summary */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Job Summary</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">{jobSummary}</p>
                    </div>
                  </div>
                  
                  {/* Essential Functions */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Essential Functions</h4>
                    <div className="space-y-3">
                      {essentialFunctions.map((func, index) => (
                        <div key={func.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <p className="text-sm text-gray-700 flex-1">{func.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Comments</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 italic">{additionalText || "Add a comment here..."}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Modal Footer */}
          <div className="flex justify-end gap-3 p-6 pt-0 border-t">
            <Button variant="outline" onClick={() => setShowCompareModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Summary Popup Editor */}
      <Dialog open={showJobSummaryPopup} onOpenChange={(open) => {
        if (!open) {
          // Handle X button click
          const hasChanges = popupJobSummary !== popupOriginalJobSummary;
          if (hasChanges) {
            // Show confirmation dialog instead of alert
            setShowJobSummaryCloseConfirmation(true);
          } else {
            // No changes, allow closing
            handlePopupCancel();
          }
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[95vh] h-[95vh] flex flex-col overflow-hidden" aria-describedby="job-summary-editor-description">
          <DialogHeader>
            <DialogTitle>Edit Job Summary</DialogTitle>
            <div id="job-summary-editor-description" className="sr-only">
              Edit job summary with track changes and undo functionality
            </div>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col space-y-4">
            {/* Track Changes Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox"
                  id="popup-track-changes"
                  checked={popupTrackChangesMode}
                  onChange={(e) => setPopupTrackChangesMode(e.target.checked)}
                  className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label 
                  htmlFor="popup-track-changes" 
                  className="text-sm font-medium cursor-pointer"
                >
                  Track Changes
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handlePopupUndo}
                  disabled={popupHistory.length <= 1}
                  title="Undo last change"
                >
                  <Undo className="w-4 h-4" />
                </Button>
                <span className="text-xs text-gray-500">
                  Word Count: {countWords(popupJobSummary)}
                </span>
              </div>
            </div>
            
            {/* Side by Side Editor and Preview */}
            <div className="flex-1 flex gap-4">
              {/* Left Side - Read-only with Change Tracking */}
              <div className="flex-1 flex flex-col">
                <h4 className="text-sm font-medium mb-2">Original (with Changes)</h4>
                {renderPopupTrackedChanges()}
              </div>
              
              {/* Right Side - Editable */}
              <div className="flex-1 flex flex-col">
                <h4 className="text-sm font-medium mb-2">Editor</h4>
                <Textarea
                  value={popupJobSummary}
                  onChange={(e) => handlePopupJobSummaryChange(e.target.value)}
                  className="h-[640px] max-h-[calc(100vh-300px)] text-sm resize-none border border-gray-300"
                  placeholder="Edit job summary here..."
                  style={{ 
                    lineHeight: '1.5',
                    fontFamily: 'Arial, sans-serif'
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Footer Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePopupCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePopupOK}
              className="bg-blue-600 hover:bg-blue-700"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit For Review Confirmation Dialog */}
      <AlertDialog open={showSubmitConfirmation} onOpenChange={() => {}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit For HR Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this job description for HR review? This will notify the HR team for approval.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelSubmitForReview}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmitForReview}>
              Ok
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Accept Changes Confirmation Dialog */}
      <AlertDialog open={showAcceptConfirmation} onOpenChange={setShowAcceptConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to accept all changes? This will finalize the job description and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelAcceptChanges}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAcceptChanges}>
              Accept Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Job Summary Close Confirmation Dialog */}
      <AlertDialog open={showJobSummaryCloseConfirmation} onOpenChange={setShowJobSummaryCloseConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelJobSummaryClose}>
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmJobSummaryClose}>
              Close Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}