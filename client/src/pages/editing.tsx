import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
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
  Trash2
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";

export default function Editing() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("V3");
  const [jobCode, setJobCode] = useState("");
  const [essentialFunctions, setEssentialFunctions] = useState([
    { id: 1, text: "Record Vital Signs And Immediately Escalate Critical Values", hasEdit: true },
    { id: 2, text: "Aid With Patient Hygiene And Nutritional Needs", hasEdit: true },
    { id: 3, text: "Maintain Patient Care Logs And Coordinate With Nursing Staff", hasEdit: true },
    { id: 4, text: "Support Safe Patient Transport Within The Facility", hasEdit: true }
  ]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [jobSummary, setJobSummary] = useState("Provides Patient Care Under Supervision. Assists Patients With Hygiene, Monitoring, And Treatment Goals.");
  const [originalJobSummary] = useState("Provides Patient Care Under Supervision. Assists Patients With Hygiene, Monitoring, And Treatment Goals.");
  const [isEditingJobSummary, setIsEditingJobSummary] = useState(false);
  const [trackChangesMode, setTrackChangesMode] = useState(false);
  const [changes, setChanges] = useState<Array<{type: 'delete' | 'insert', text: string, position: number}>>([]);
  const [showAddFunctionModal, setShowAddFunctionModal] = useState(false);
  const [newFunctionText, setNewFunctionText] = useState("");
  const [functionsHistory, setFunctionsHistory] = useState<Array<Array<{id: number, text: string, hasEdit: boolean}>>>([]);
  const [editingFunctionId, setEditingFunctionId] = useState<number | null>(null);
  const [editingFunctionText, setEditingFunctionText] = useState("");
  const [originalEditingText, setOriginalEditingText] = useState("");
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [lastUpdatedDate, setLastUpdatedDate] = useState("May 30, 2025");
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Sample notifications matching dashboard
  const [notifications, setNotifications] = useState([
    "Review deadline approaching",
    "New job submitted", 
    "Status update required",
    "Feedback pending approval"
  ]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get job code from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobCodeParam = urlParams.get('jobCode');
    if (jobCodeParam) {
      setJobCode(jobCodeParam);
    }
  }, []);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedItem === null) return;
    
    // Save current state to history before making changes
    setFunctionsHistory(prev => [...prev, [...essentialFunctions]]);
    
    const draggedFunction = essentialFunctions[draggedItem];
    const newFunctions = [...essentialFunctions];
    
    // Remove dragged item
    newFunctions.splice(draggedItem, 1);
    
    // Insert at new position
    newFunctions.splice(dropIndex, 0, draggedFunction);
    
    setEssentialFunctions(newFunctions);
    setDraggedItem(null);
  };

  // Function to create diff between original and current text
  const createTextDiff = (original: string, current: string) => {
    const originalWords = original.split(' ');
    const currentWords = current.split(' ');
    const result = [];
    let originalIndex = 0;
    let currentIndex = 0;

    while (originalIndex < originalWords.length || currentIndex < currentWords.length) {
      if (originalIndex >= originalWords.length) {
        // Remaining words are additions
        result.push({ type: 'insert', text: currentWords.slice(currentIndex).join(' ') });
        break;
      } else if (currentIndex >= currentWords.length) {
        // Remaining words are deletions
        result.push({ type: 'delete', text: originalWords.slice(originalIndex).join(' ') });
        break;
      } else if (originalWords[originalIndex] === currentWords[currentIndex]) {
        // Words match
        result.push({ type: 'unchanged', text: originalWords[originalIndex] });
        originalIndex++;
        currentIndex++;
      } else {
        // Find next matching word
        let found = false;
        for (let i = currentIndex + 1; i < currentWords.length; i++) {
          if (originalWords[originalIndex] === currentWords[i]) {
            // Words between currentIndex and i are insertions
            result.push({ type: 'insert', text: currentWords.slice(currentIndex, i).join(' ') });
            currentIndex = i;
            found = true;
            break;
          }
        }
        if (!found) {
          // Check if original word was deleted
          let foundInOriginal = false;
          for (let i = originalIndex + 1; i < originalWords.length; i++) {
            if (originalWords[i] === currentWords[currentIndex]) {
              // Words between originalIndex and i are deletions
              result.push({ type: 'delete', text: originalWords.slice(originalIndex, i).join(' ') });
              originalIndex = i;
              foundInOriginal = true;
              break;
            }
          }
          if (!foundInOriginal) {
            // Replace: delete original, insert current
            result.push({ type: 'delete', text: originalWords[originalIndex] });
            result.push({ type: 'insert', text: currentWords[currentIndex] });
            originalIndex++;
            currentIndex++;
          }
        }
      }
    }

    return result;
  };

  const renderTrackedChanges = () => {
    if (!trackChangesMode) {
      return <p className="text-sm mb-4">{jobSummary}</p>;
    }

    const diff = createTextDiff(originalJobSummary, jobSummary);
    
    return (
      <div className="text-sm mb-4 leading-relaxed">
        {diff.map((change, index) => {
          if (change.type === 'unchanged') {
            return <span key={index}>{change.text} </span>;
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
    );
  };

  const handleAddNewFunction = () => {
    if (newFunctionText.trim()) {
      const newFunction = {
        id: essentialFunctions.length + 1,
        text: newFunctionText.trim(),
        hasEdit: true
      };
      setEssentialFunctions([...essentialFunctions, newFunction]);
      setNewFunctionText("");
      setShowAddFunctionModal(false);
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
    }
  };

  const handleEditFunction = (functionId: number, currentText: string) => {
    setEditingFunctionId(functionId);
    setEditingFunctionText(currentText);
    setOriginalEditingText(currentText);
  };

  const handleSaveEditFunction = () => {
    if (editingFunctionId !== null && editingFunctionText.trim()) {
      const updatedFunctions = essentialFunctions.map(func => 
        func.id === editingFunctionId 
          ? { ...func, text: editingFunctionText.trim() }
          : func
      );
      setEssentialFunctions(updatedFunctions);
      setEditingFunctionId(null);
      setEditingFunctionText("");
    }
  };

  const handleCancelEditFunction = () => {
    setEditingFunctionId(null);
    setEditingFunctionText("");
    setOriginalEditingText("");
    setShowCloseConfirmation(false);
  };

  const handleCloseEditModal = () => {
    const hasChanges = editingFunctionText !== originalEditingText;
    if (hasChanges) {
      setShowCloseConfirmation(true);
    } else {
      handleCancelEditFunction();
    }
  };

  const confirmCloseEditModal = () => {
    handleCancelEditFunction();
  };

  const updateLastModifiedDate = () => {
    const today = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const formattedDate = `${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
    setLastUpdatedDate(formattedDate);
  };

  const handleSaveDraft = () => {
    updateLastModifiedDate();
  };

  const handleSubmitForReview = () => {
    updateLastModifiedDate();
  };

  const handleAcceptChanges = () => {
    updateLastModifiedDate();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Edit className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Job Description Review</h1>
                {jobCode && (
                  <p className="text-sm text-gray-600 mt-1">Job Code: {jobCode}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative" ref={notificationRef}>
                <button 
                  className="relative hover:bg-gray-100 p-2 rounded-full transition-colors"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-6 h-6 text-gray-600" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{notifications.length}</span>
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-3 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification, index) => (
                        <div
                          key={index}
                          className="p-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 cursor-pointer">
                              <p className="text-sm text-gray-700">{notification}</p>
                              <p className="text-xs text-gray-400 mt-1">Just now</p>
                            </div>
                            <button
                              className="ml-2 p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-500 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setNotifications(prev => prev.filter((_, i) => i !== index));
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-100">
                      <Link 
                        href="/notifications"
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
                        onClick={() => setShowNotifications(false)}
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:text-gray-900"
              onClick={() => setLocation("/jobs-family")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Job Information Cards */}
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
              <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Edit className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Last Edited By</span>
              </div>
              <p className="text-blue-600 font-semibold">Sarah Mitchell</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Last Updated</span>
              </div>
              <p className="text-blue-600 font-semibold">May 30, 2025</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Current Version</span>
              </div>
              <p className="text-blue-600 font-semibold">V3</p>
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
                    <span className="text-sm font-medium">Version 3</span>
                    <span className="text-xs text-gray-500">Last Updated {lastUpdatedDate}</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Job Summary</h4>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant={trackChangesMode ? "default" : "outline"}
                        onClick={() => setTrackChangesMode(!trackChangesMode)}
                        className="text-xs"
                      >
                        Track Changes
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setIsEditingJobSummary(!isEditingJobSummary)}
                      >
                        <Pencil className="w-4 h-4" />
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
                      <Button size="sm" variant="ghost">
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        Clear Formatting
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {essentialFunctions.map((func, index) => (
                      <div 
                        key={func.id}
                        className="flex items-start space-x-3 p-2 bg-gray-50 rounded cursor-move hover:bg-gray-100 transition-colors"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        <GripVertical className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1 flex items-start justify-between">
                          <p className={`text-sm ${func.hasEdit ? 'font-medium' : ''} flex-1 pr-2`}>{func.text}</p>
                          {func.hasEdit && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="p-1 h-auto min-w-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditFunction(func.id, func.text);
                              }}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => setShowAddFunctionModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Function
                    </Button>
                  </div>
                </div>

                {/* Compare Versions */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Compare Versions</h4>
                  <div className="flex space-x-2">
                    <Button 
                      variant={activeTab === "V1" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setActiveTab("V1")}
                    >
                      V1
                    </Button>
                    <Button 
                      variant={activeTab === "V2" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setActiveTab("V2")}
                    >
                      V2
                    </Button>
                    <Button 
                      variant={activeTab === "V3" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setActiveTab("V3")}
                    >
                      V3
                    </Button>
                    <Button variant="default" size="sm">
                      View Differences
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-8">
            <Button 
              variant="outline" 
              className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 flex flex-col items-center py-3"
              onClick={handleSaveDraft}
            >
              <span>Save Draft</span>
              <span className="text-xs text-gray-500 mt-0.5">Autosave Every 5 Min</span>
            </Button>
            <Button 
              className="bg-blue-900 text-white hover:bg-blue-800"
              onClick={handleSubmitForReview}
            >
              Submit For HR Review
            </Button>
            <Button 
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleAcceptChanges}
            >
              Accept Changes
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
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Function Modal */}
      <Dialog open={editingFunctionId !== null} onOpenChange={(open) => {
        if (!open) {
          handleCloseEditModal();
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Essential Function</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-function-text" className="text-sm font-medium">
                Function Description
              </label>
              <Textarea
                id="edit-function-text"
                value={editingFunctionText}
                onChange={(e) => setEditingFunctionText(e.target.value)}
                placeholder="Enter the function description..."
                className="min-h-[100px]"
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleCancelEditFunction}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEditFunction}
              disabled={!editingFunctionText.trim()}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Confirmation Dialog */}
      <AlertDialog open={showCloseConfirmation} onOpenChange={setShowCloseConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to lose your changes?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCloseConfirmation(false)}>
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmCloseEditModal}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}