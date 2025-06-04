import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  GripVertical
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";

export default function Editing() {
  const [activeTab, setActiveTab] = useState("V3");
  const [essentialFunctions, setEssentialFunctions] = useState([
    { id: 1, text: "Record Vital Signs And Immediately Escalate Critical Values", hasEdit: true },
    { id: 2, text: "Aid With Patient Hygiene And Nutritional Needs", hasEdit: false },
    { id: 3, text: "Maintain Patient Care Logs And Coordinate With Nursing Staff", hasEdit: true },
    { id: 4, text: "Support Safe Patient Transport Within The Facility", hasEdit: true }
  ]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

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
    
    const draggedFunction = essentialFunctions[draggedItem];
    const newFunctions = [...essentialFunctions];
    
    // Remove dragged item
    newFunctions.splice(draggedItem, 1);
    
    // Insert at new position
    newFunctions.splice(dropIndex, 0, draggedFunction);
    
    setEssentialFunctions(newFunctions);
    setDraggedItem(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <span className="text-gray-500">Job Description Review</span>
            </div>
            <div className="flex items-center space-x-4">
              <Search className="w-5 h-5 text-gray-500" />
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-500" />
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold leading-none scale-75">1</span>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mb-6">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Job Information Cards */}
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
                <BarChart className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Job Level</span>
              </div>
              <p className="text-blue-600 font-semibold">1</p>
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
              <p className="text-blue-600 font-semibold">Sarah M.</p>
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
                    <span className="text-xs text-gray-500">Last Updated May 30, 2025</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Job Summary</h4>
                  <p className="text-sm mb-4">Provides Patient Care Under Supervision. Assists Patients With Hygiene, Monitoring, And Treatment Goals.</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Essential Functions</h4>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost">
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
                        className="flex items-start space-x-3 p-3 bg-gray-50 rounded cursor-move hover:bg-gray-100 transition-colors"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        <GripVertical className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <p className={`text-sm ${func.hasEdit ? 'font-medium' : ''}`}>{func.text}</p>
                          {func.hasEdit && (
                            <div className="flex space-x-2 mt-2">
                              <Button size="sm" variant="ghost"><Pencil className="w-3 h-3" /></Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <Button variant="outline" size="sm" className="mt-3">
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
            <Button variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 flex flex-col items-center py-3">
              <span>Save Draft</span>
              <span className="text-xs text-gray-500 mt-0.5">Autosave Every 5 Min</span>
            </Button>
            <Button className="bg-blue-900 text-white hover:bg-blue-800">
              Submit For HR Review
            </Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              Accept Changes
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}