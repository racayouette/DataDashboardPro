import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { useRole } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import { Search, Filter, Bell, FilterX, ChevronDown, Trash2, Users, ArrowUpDown, ArrowUp, ArrowDown, UserCircle, FileSpreadsheet } from "lucide-react";
// Using secure SheetJS CDN instead of vulnerable npm package
declare global {
  interface Window {
    XLSX: any;
  }
}
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface JobEntry {
  id: number;
  jobCode: string;
  jobTitle: string;
  jobFamily: string;
  reviewer: string;
  responsible: string;
  status: "In Progress" | "Not Started" | "Completed" | "Reviewed" | "Submitted to HR";
  lastUpdated: string;
}

export default function JobsFamily() {
  const [, setLocation] = useLocation();
  const { isAdminMode } = useRole();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobFamily, setSelectedJobFamily] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // State for reviewer assignments - first 2 rows start as null (unset)
  const [reviewerAssignments, setReviewerAssignments] = useState<{ [key: number]: string | null }>({
    1: null, // First row - unset
    2: null, // Second row - unset
  });
  
  // Available users for reviewer assignment
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

  // Check for reviewer or search parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reviewerParam = urlParams.get('reviewer');
    const searchParam = urlParams.get('search');
    if (reviewerParam) {
      const decodedReviewer = decodeURIComponent(reviewerParam);
      setSearchTerm(decodedReviewer);
      // Clear status filter when coming from functional leader click
      setSelectedStatus("");
    } else if (searchParam) {
      const decodedSearch = decodeURIComponent(searchParam);
      setSearchTerm(decodedSearch);
      // Clear status filter when coming from functional leader click
      setSelectedStatus("");
    }
  }, []);

  // Reset status filter on page load (removed auto-select of "Submitted to HR")
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasSearchOrReviewerParam = urlParams.get('reviewer') || urlParams.get('search');
    
    // Always start with no status filter unless coming from a specific search/reviewer link
    if (!hasSearchOrReviewerParam) {
      setSelectedStatus("");
    }
  }, [isAdminMode]);

  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Sample notifications
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
    const jobCodeRegex = /\b(\d{4,5})\b/g;
    const parts = text.split(jobCodeRegex);
    
    return parts.map((part, index) => {
      // Check if this part is a job code
      if (/^\d{4,5}$/.test(part)) {
        return (
          <span 
            key={index} 
            className="text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              setShowNotifications(false);
              window.location.href = `/editing?jobCode=${part}`;
            }}
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Sample data based on the image
  const jobEntries: JobEntry[] = [
    { id: 1, jobCode: "10001", jobTitle: "Patient Care Technician", jobFamily: "Clinical Support", reviewer: "Kelly Johnson, John Smith", responsible: "Jennifer Collins", status: "Submitted to HR", lastUpdated: "June 15, 2025" },
    { id: 2, jobCode: "10002", jobTitle: "Radiology Tech", jobFamily: "Clinical Support", reviewer: "Kelly Johnson", responsible: "Robert Wilson", status: "Submitted to HR", lastUpdated: "January 8, 2025" },
    { id: 3, jobCode: "10003", jobTitle: "Billing Specialist", jobFamily: "Revenue Cycle", reviewer: "Robert Kennedy", responsible: "David Thompson", status: "Reviewed", lastUpdated: "March 22, 2025" },
    { id: 4, jobCode: "10004", jobTitle: "Financial Analyst", jobFamily: "Finance", reviewer: "Adam Lambert", responsible: "Susan Davis", status: "In Progress", lastUpdated: "May 10, 2025" },
    { id: 5, jobCode: "10005", jobTitle: "Nurse Practitioner", jobFamily: "Clinical Support", reviewer: "Jennifer Williams", responsible: "Patricia Miller", status: "In Progress", lastUpdated: "April 18, 2025" },
    { id: 6, jobCode: "10006", jobTitle: "HR Generalist", jobFamily: "Human Resources", reviewer: "", responsible: "", status: "Not Started", lastUpdated: "February 14, 2025" },
    { id: 7, jobCode: "10007", jobTitle: "IT Support Technician", jobFamily: "IT Services", reviewer: "Linda Taylor", responsible: "Carlos Martinez", status: "Completed", lastUpdated: "June 3, 2025" },
    { id: 8, jobCode: "10008", jobTitle: "Pharmacy Tech", jobFamily: "Pharmacy", reviewer: "David Phillips", responsible: "Amanda Wilson", status: "In Progress", lastUpdated: "March 5, 2025" },
    { id: 9, jobCode: "10009", jobTitle: "Lab Assistant", jobFamily: "Lab Services", reviewer: "Emma Sullivan", responsible: "Nicole Taylor", status: "In Progress", lastUpdated: "January 30, 2025" },
    { id: 10, jobCode: "10010", jobTitle: "Social Worker", jobFamily: "Behavioral Health", reviewer: "Chris Harrison", responsible: "Thomas Anderson", status: "Not Started", lastUpdated: "June 28, 2025" },
    { id: 11, jobCode: "10011", jobTitle: "Medical Assistant", jobFamily: "Clinical Support", reviewer: "Sarah Mitchell", responsible: "Linda Johnson", status: "In Progress", lastUpdated: "May 22, 2025" },
    { id: 12, jobCode: "10012", jobTitle: "Revenue Cycle Analyst", jobFamily: "Revenue Cycle", reviewer: "Kelly Johnson", responsible: "Brian Wilson", status: "Completed", lastUpdated: "April 12, 2025" },
    { id: 13, jobCode: "10013", jobTitle: "Physical Therapist", jobFamily: "Clinical Support", reviewer: "Robert Kennedy", responsible: "Michael Brown", status: "Not Started", lastUpdated: "March 8, 2025" },
    { id: 14, jobCode: "10014", jobTitle: "Clinical Coordinator", jobFamily: "Clinical Support", reviewer: "Adam Lambert", responsible: "Angela Martinez", status: "In Progress", lastUpdated: "June 5, 2025" },
    { id: 15, jobCode: "10015", jobTitle: "Security Officer", jobFamily: "Security", reviewer: "Jennifer Williams", responsible: "Christine Lee", status: "Completed", lastUpdated: "February 28, 2025" },
    { id: 16, jobCode: "10016", jobTitle: "Quality Assurance Specialist", jobFamily: "Quality", reviewer: "Michael Roberts", responsible: "Daniel Garcia", status: "In Progress", lastUpdated: "May 15, 2025" },
    { id: 17, jobCode: "10017", jobTitle: "Respiratory Therapist", jobFamily: "Clinical Support", reviewer: "Linda Taylor", responsible: "Mary Thompson", status: "Not Started", lastUpdated: "January 20, 2025" },
    { id: 18, jobCode: "10018", jobTitle: "Dietician", jobFamily: "Nutrition", reviewer: "David Phillips", responsible: "Jason Clark", status: "In Progress", lastUpdated: "April 25, 2025" },
    { id: 19, jobCode: "10019", jobTitle: "Case Manager", jobFamily: "Behavioral Health", reviewer: "Emma Sullivan", responsible: "Christopher Hall", status: "Completed", lastUpdated: "March 18, 2025" },
    { id: 20, jobCode: "10020", jobTitle: "Maintenance Technician", jobFamily: "Facilities", reviewer: "Chris Harrison", responsible: "Rebecca Allen", status: "In Progress", lastUpdated: "June 10, 2025" },
    { id: 21, jobCode: "10021", jobTitle: "Environmental Services", jobFamily: "Facilities", reviewer: "Sarah Mitchell", responsible: "Kevin Wright", status: "Not Started", lastUpdated: "February 5, 2025" },
    { id: 22, jobCode: "10022", jobTitle: "Occupational Therapist", jobFamily: "Clinical Support", reviewer: "Kelly Johnson", responsible: "Timothy King", status: "In Progress", lastUpdated: "May 8, 2025" },
    { id: 23, jobCode: "10023", jobTitle: "Registration Clerk", jobFamily: "Patient Access", reviewer: "Robert Kennedy", responsible: "Brandon Scott", status: "Completed", lastUpdated: "April 2, 2025" },
    { id: 24, jobCode: "10024", jobTitle: "Surgical Technician", jobFamily: "Clinical Support", reviewer: "Adam Lambert", responsible: "Melissa Torres", status: "In Progress", lastUpdated: "June 12, 2025" },
    { id: 25, jobCode: "10025", jobTitle: "Emergency Room Clerk", jobFamily: "Patient Access", reviewer: "Jennifer Williams", responsible: "Jacob Rivera", status: "Not Started", lastUpdated: "March 15, 2025" },
    { id: 26, jobCode: "10026", jobTitle: "Infection Control Specialist", jobFamily: "Quality", reviewer: "Michael Roberts", responsible: "Ryan Cooper", status: "In Progress", lastUpdated: "May 20, 2025" },
    { id: 27, jobCode: "10027", jobTitle: "Medical Records Clerk", jobFamily: "Health Information", reviewer: "Linda Taylor", responsible: "Anthony Reed", status: "Completed", lastUpdated: "February 18, 2025" },
    { id: 28, jobCode: "10028", jobTitle: "Chaplain", jobFamily: "Spiritual Care", reviewer: "David Phillips", responsible: "Nicholas Bailey", status: "In Progress", lastUpdated: "April 30, 2025" },
    { id: 29, jobCode: "10029", jobTitle: "Transport Aide", jobFamily: "Patient Support", reviewer: "Emma Sullivan", responsible: "Victoria Cox", status: "Not Started", lastUpdated: "January 25, 2025" },
    { id: 30, jobCode: "10030", jobTitle: "Ultrasound Technician", jobFamily: "Clinical Support", reviewer: "Chris Harrison", responsible: "Stephen Richardson", status: "In Progress", lastUpdated: "June 8, 2025" },
    { id: 31, jobCode: "10031", jobTitle: "Chief Medical Officer", jobFamily: "Leadership", reviewer: "Sarah Mitchell", responsible: "Executive Team", status: "Completed", lastUpdated: "March 25, 2025" },
    { id: 32, jobCode: "10032", jobTitle: "Compliance Officer", jobFamily: "Legal", reviewer: "Kelly Johnson", responsible: "Matthew Foster", status: "In Progress", lastUpdated: "May 18, 2025" },
    { id: 33, jobCode: "10033", jobTitle: "Wound Care Specialist", jobFamily: "Clinical Support", reviewer: "Robert Kennedy", responsible: "Andrew Powell", status: "Not Started", lastUpdated: "February 8, 2025" },
    { id: 34, jobCode: "10034", jobTitle: "Pediatric Nurse", jobFamily: "Clinical Support", reviewer: "Adam Lambert", responsible: "Samantha Hughes", status: "In Progress", lastUpdated: "April 22, 2025" },
    { id: 35, jobCode: "10035", jobTitle: "Anesthesia Technician", jobFamily: "Clinical Support", reviewer: "Jennifer Williams", responsible: "Rachel Flores", status: "Completed", lastUpdated: "March 10, 2025" },
    { id: 36, jobCode: "10036", jobTitle: "Clinical Pharmacist", jobFamily: "Pharmacy", reviewer: "Michael Roberts", responsible: "Justin Washington", status: "In Progress", lastUpdated: "June 1, 2025" },
    { id: 37, jobCode: "10037", jobTitle: "Patient Financial Counselor", jobFamily: "Revenue Cycle", reviewer: "Linda Taylor", responsible: "Eric Simmons", status: "Not Started", lastUpdated: "January 15, 2025" },
    { id: 38, jobCode: "10038", jobTitle: "ICU Nurse", jobFamily: "Clinical Support", reviewer: "David Phillips", responsible: "Jesse Henderson", status: "In Progress", lastUpdated: "May 12, 2025" },
    { id: 39, jobCode: "10039", jobTitle: "Biomedical Technician", jobFamily: "IT Services", reviewer: "Emma Sullivan", responsible: "Kimberly Patterson", status: "Completed", lastUpdated: "April 5, 2025" },
    { id: 40, jobCode: "10040", jobTitle: "Health Information Manager", jobFamily: "Health Information", reviewer: "Chris Harrison", responsible: "Sean Alexander", status: "In Progress", lastUpdated: "June 18, 2025" },
    { id: 41, jobCode: "10041", jobTitle: "Cardiac Technician", jobFamily: "Clinical Support", reviewer: "Sarah Mitchell", responsible: "Crystal Watson", status: "Not Started", lastUpdated: "February 22, 2025" },
    { id: 42, jobCode: "10042", jobTitle: "Emergency Department Manager", jobFamily: "Leadership", reviewer: "Kelly Johnson", responsible: "Jonathan Kelly", status: "In Progress", lastUpdated: "May 28, 2025" },
    { id: 43, jobCode: "10043", jobTitle: "Hospice Coordinator", jobFamily: "Behavioral Health", reviewer: "Robert Kennedy", responsible: "Tyler Sanders", status: "Completed", lastUpdated: "March 12, 2025" },
    { id: 44, jobCode: "10044", jobTitle: "Sterile Processing Technician", jobFamily: "Clinical Support", reviewer: "Adam Lambert", responsible: "Lauren Wood", status: "In Progress", lastUpdated: "June 20, 2025" },
    { id: 45, jobCode: "10045", jobTitle: "Sleep Technologist", jobFamily: "Clinical Support", reviewer: "Jennifer Williams", responsible: "Adam Bennett", status: "Not Started", lastUpdated: "January 10, 2025" },
    { id: 46, jobCode: "10046", jobTitle: "CT Technologist", jobFamily: "Clinical Support", reviewer: "Michael Roberts", responsible: "Grace Morrison", status: "In Progress", lastUpdated: "May 3, 2025" },
    { id: 47, jobCode: "10047", jobTitle: "MRI Technologist", jobFamily: "Clinical Support", reviewer: "Linda Taylor", responsible: "Peter Brooks", status: "Completed", lastUpdated: "April 15, 2025" },
    { id: 48, jobCode: "10048", jobTitle: "Nuclear Medicine Technologist", jobFamily: "Clinical Support", reviewer: "David Phillips", responsible: "Sarah Murphy", status: "Not Started", lastUpdated: "March 20, 2025" },
    { id: 49, jobCode: "10049", jobTitle: "Mammography Technologist", jobFamily: "Clinical Support", reviewer: "Emma Sullivan", responsible: "James Butler", status: "In Progress", lastUpdated: "June 25, 2025" },
    { id: 50, jobCode: "10050", jobTitle: "Cardiac Catheterization Technologist", jobFamily: "Clinical Support", reviewer: "Chris Harrison", responsible: "Diana Price", status: "Reviewed", lastUpdated: "February 10, 2025" },
    { id: 51, jobCode: "10051", jobTitle: "Perfusionist", jobFamily: "Clinical Support", reviewer: "Sarah Mitchell", responsible: "Mark Russell", status: "In Progress", lastUpdated: "May 30, 2025" },
    { id: 52, jobCode: "10052", jobTitle: "EEG Technologist", jobFamily: "Clinical Support", reviewer: "Kelly Johnson", responsible: "Anna Collins", status: "Completed", lastUpdated: "April 8, 2025" },
    { id: 53, jobCode: "10053", jobTitle: "Dialysis Technician", jobFamily: "Clinical Support", reviewer: "Robert Kennedy", responsible: "Marcus Griffin", status: "Not Started", lastUpdated: "January 28, 2025" },
    { id: 54, jobCode: "10054", jobTitle: "Home Health Aide", jobFamily: "Clinical Support", reviewer: "Adam Lambert", responsible: "Lisa Hayes", status: "In Progress", lastUpdated: "June 14, 2025" },
    { id: 55, jobCode: "10055", jobTitle: "Medical Scribe", jobFamily: "Clinical Support", reviewer: "Jennifer Williams", responsible: "Frank Rogers", status: "Submitted to HR", lastUpdated: "March 5, 2025" },
    { id: 56, jobCode: "10056", jobTitle: "Audiologist", jobFamily: "Clinical Support", reviewer: "Michael Roberts", responsible: "Elena Rodriguez", status: "In Progress", lastUpdated: "May 16, 2025" },
    { id: 57, jobCode: "10057", jobTitle: "Speech Language Pathologist", jobFamily: "Clinical Support", reviewer: "Linda Taylor", responsible: "Carlos Martinez", status: "Completed", lastUpdated: "April 28, 2025" },
    { id: 58, jobCode: "10058", jobTitle: "Optometrist", jobFamily: "Clinical Support", reviewer: "David Phillips", responsible: "Isabella Turner", status: "Not Started", lastUpdated: "February 15, 2025" },
    { id: 59, jobCode: "10059", jobTitle: "Podiatrist", jobFamily: "Clinical Support", reviewer: "Emma Sullivan", responsible: "Nathan Ward", status: "In Progress", lastUpdated: "June 7, 2025" },
    { id: 60, jobCode: "10060", jobTitle: "Chiropractor", jobFamily: "Clinical Support", reviewer: "Chris Harrison", responsible: "Sophia Evans", status: "Reviewed", lastUpdated: "March 18, 2025" },
    { id: 61, jobCode: "10061", jobTitle: "Acupuncturist", jobFamily: "Clinical Support", reviewer: "Sarah Mitchell", responsible: "Oliver Thompson", status: "In Progress", lastUpdated: "May 22, 2025" },
    { id: 62, jobCode: "10062", jobTitle: "Massage Therapist", jobFamily: "Clinical Support", reviewer: "Kelly Johnson", responsible: "Ava Anderson", status: "Completed", lastUpdated: "April 11, 2025" },
    { id: 63, jobCode: "10063", jobTitle: "Mental Health Counselor", jobFamily: "Behavioral Health", reviewer: "Robert Kennedy", responsible: "Ethan Wilson", status: "Not Started", lastUpdated: "January 22, 2025" },
    { id: 64, jobCode: "10064", jobTitle: "Substance Abuse Counselor", jobFamily: "Behavioral Health", reviewer: "Adam Lambert", responsible: "Mia Garcia", status: "In Progress", lastUpdated: "June 9, 2025" },
    { id: 65, jobCode: "10065", jobTitle: "Art Therapist", jobFamily: "Behavioral Health", reviewer: "Jennifer Williams", responsible: "Liam Jones", status: "Submitted to HR", lastUpdated: "March 28, 2025" },
    { id: 66, jobCode: "10066", jobTitle: "Music Therapist", jobFamily: "Behavioral Health", reviewer: "Michael Roberts", responsible: "Charlotte Brown", status: "In Progress", lastUpdated: "May 25, 2025" },
    { id: 67, jobCode: "10067", jobTitle: "Recreation Therapist", jobFamily: "Behavioral Health", reviewer: "Linda Taylor", responsible: "Lucas Davis", status: "Completed", lastUpdated: "April 19, 2025" },
    { id: 68, jobCode: "10068", jobTitle: "Child Life Specialist", jobFamily: "Behavioral Health", reviewer: "David Phillips", responsible: "Aria Miller", status: "Not Started", lastUpdated: "February 25, 2025" },
    { id: 69, jobCode: "10069", jobTitle: "Genetic Counselor", jobFamily: "Clinical Support", reviewer: "Emma Sullivan", responsible: "Mason Williams", status: "In Progress", lastUpdated: "June 16, 2025" },
    { id: 70, jobCode: "10070", jobTitle: "Clinical Research Coordinator", jobFamily: "Research", reviewer: "Chris Harrison", responsible: "Zoe Johnson", status: "Reviewed", lastUpdated: "March 14, 2025" },
    { id: 71, jobCode: "10071", jobTitle: "Data Analyst", jobFamily: "Research", reviewer: "Sarah Mitchell", responsible: "Caleb Robinson", status: "In Progress", lastUpdated: "May 8, 2025" },
    { id: 72, jobCode: "10072", jobTitle: "Biostatistician", jobFamily: "Research", reviewer: "Kelly Johnson", responsible: "Lily Martinez", status: "Completed", lastUpdated: "April 3, 2025" },
    { id: 73, jobCode: "10073", jobTitle: "Clinical Trials Manager", jobFamily: "Research", reviewer: "Robert Kennedy", responsible: "Isaac Lee", status: "Not Started", lastUpdated: "January 18, 2025" },
    { id: 74, jobCode: "10074", jobTitle: "Research Nurse", jobFamily: "Research", reviewer: "Adam Lambert", responsible: "Chloe Taylor", status: "In Progress", lastUpdated: "June 11, 2025" },
    { id: 75, jobCode: "10075", jobTitle: "Lab Manager", jobFamily: "Lab Services", reviewer: "Jennifer Williams", responsible: "Ryan White", status: "Submitted to HR", lastUpdated: "March 7, 2025" },
    { id: 76, jobCode: "10076", jobTitle: "Medical Laboratory Technician", jobFamily: "Lab Services", reviewer: "Michael Roberts", responsible: "Hannah Harris", status: "In Progress", lastUpdated: "May 19, 2025" },
    { id: 77, jobCode: "10077", jobTitle: "Phlebotomist", jobFamily: "Lab Services", reviewer: "Linda Taylor", responsible: "Aaron Clark", status: "Completed", lastUpdated: "April 25, 2025" },
    { id: 78, jobCode: "10078", jobTitle: "Cytotechnologist", jobFamily: "Lab Services", reviewer: "David Phillips", responsible: "Ella Lewis", status: "Not Started", lastUpdated: "February 12, 2025" },
    { id: 79, jobCode: "10079", jobTitle: "Histotechnologist", jobFamily: "Lab Services", reviewer: "Emma Sullivan", responsible: "Benjamin Walker", status: "In Progress", lastUpdated: "June 4, 2025" },
    { id: 80, jobCode: "10080", jobTitle: "Microbiologist", jobFamily: "Lab Services", reviewer: "Chris Harrison", responsible: "Avery Hall", status: "Reviewed", lastUpdated: "March 22, 2025" },
    { id: 81, jobCode: "10081", jobTitle: "Blood Bank Technologist", jobFamily: "Lab Services", reviewer: "Sarah Mitchell", responsible: "Sebastian Young", status: "In Progress", lastUpdated: "May 14, 2025" },
    { id: 82, jobCode: "10082", jobTitle: "Molecular Technologist", jobFamily: "Lab Services", reviewer: "Kelly Johnson", responsible: "Scarlett King", status: "Completed", lastUpdated: "April 9, 2025" },
    { id: 83, jobCode: "10083", jobTitle: "Clinical Laboratory Scientist", jobFamily: "Lab Services", reviewer: "Robert Kennedy", responsible: "Hunter Wright", status: "Not Started", lastUpdated: "January 16, 2025" },
    { id: 84, jobCode: "10084", jobTitle: "Pathology Assistant", jobFamily: "Lab Services", reviewer: "Adam Lambert", responsible: "Victoria Green", status: "In Progress", lastUpdated: "June 19, 2025" },
    { id: 85, jobCode: "10085", jobTitle: "Surgical Assistant", jobFamily: "Clinical Support", reviewer: "Jennifer Williams", responsible: "Jack Adams", status: "Submitted to HR", lastUpdated: "March 11, 2025" },
    { id: 86, jobCode: "10086", jobTitle: "Operating Room Nurse", jobFamily: "Clinical Support", reviewer: "Michael Roberts", responsible: "Maya Baker", status: "In Progress", lastUpdated: "May 27, 2025" },
    { id: 87, jobCode: "10087", jobTitle: "Recovery Room Nurse", jobFamily: "Clinical Support", reviewer: "Linda Taylor", responsible: "Cooper Gonzalez", status: "Completed", lastUpdated: "April 16, 2025" },
    { id: 88, jobCode: "10088", jobTitle: "Emergency Room Nurse", jobFamily: "Clinical Support", reviewer: "David Phillips", responsible: "Luna Nelson", status: "Not Started", lastUpdated: "February 8, 2025" },
    { id: 89, jobCode: "10089", jobTitle: "Trauma Nurse", jobFamily: "Clinical Support", reviewer: "Emma Sullivan", responsible: "Grayson Carter", status: "In Progress", lastUpdated: "June 13, 2025" },
    { id: 90, jobCode: "10090", jobTitle: "Flight Nurse", jobFamily: "Clinical Support", reviewer: "Chris Harrison", responsible: "Penelope Mitchell", status: "Reviewed", lastUpdated: "March 26, 2025" },
    { id: 91, jobCode: "10091", jobTitle: "Transplant Coordinator", jobFamily: "Clinical Support", reviewer: "Sarah Mitchell", responsible: "Eli Perez", status: "In Progress", lastUpdated: "May 10, 2025" },
    { id: 92, jobCode: "10092", jobTitle: "Organ Procurement Coordinator", jobFamily: "Clinical Support", reviewer: "Kelly Johnson", responsible: "Layla Roberts", status: "Completed", lastUpdated: "April 6, 2025" },
    { id: 93, jobCode: "10093", jobTitle: "Tissue Recovery Technician", jobFamily: "Clinical Support", reviewer: "Robert Kennedy", responsible: "Nolan Turner", status: "Not Started", lastUpdated: "January 13, 2025" },
    { id: 94, jobCode: "10094", jobTitle: "Medical Equipment Technician", jobFamily: "IT Services", reviewer: "Adam Lambert", responsible: "Paisley Phillips", status: "In Progress", lastUpdated: "June 21, 2025" },
    { id: 95, jobCode: "10095", jobTitle: "Health Information Technician", jobFamily: "Health Information", reviewer: "Jennifer Williams", responsible: "Hudson Campbell", status: "Submitted to HR", lastUpdated: "March 4, 2025" },
    { id: 96, jobCode: "10096", jobTitle: "Medical Coding Specialist", jobFamily: "Health Information", reviewer: "Michael Roberts", responsible: "Willow Parker", status: "In Progress", lastUpdated: "May 23, 2025" },
    { id: 97, jobCode: "10097", jobTitle: "Revenue Integrity Analyst", jobFamily: "Revenue Cycle", reviewer: "Linda Taylor", responsible: "Lincoln Evans", status: "Completed", lastUpdated: "April 13, 2025" },
    { id: 98, jobCode: "10098", jobTitle: "Patient Access Representative", jobFamily: "Patient Access", reviewer: "David Phillips", responsible: "Stella Edwards", status: "Not Started", lastUpdated: "February 19, 2025" },
    { id: 99, jobCode: "10099", jobTitle: "Insurance Verification Specialist", jobFamily: "Patient Access", reviewer: "Emma Sullivan", responsible: "Easton Collins", status: "In Progress", lastUpdated: "June 2, 2025" },
    { id: 100, jobCode: "10100", jobTitle: "Prior Authorization Specialist", jobFamily: "Patient Access", reviewer: "Chris Harrison", responsible: "Nova Stewart", status: "Reviewed", lastUpdated: "March 17, 2025" },
    { id: 101, jobCode: "10101", jobTitle: "Patient Advocate", jobFamily: "Patient Support", reviewer: "Sarah Mitchell", responsible: "Ryder Sanchez", status: "In Progress", lastUpdated: "May 5, 2025" },
    { id: 102, jobCode: "10102", jobTitle: "Volunteer Coordinator", jobFamily: "Patient Support", reviewer: "Kelly Johnson", responsible: "Kinsley Morris", status: "Completed", lastUpdated: "April 20, 2025" },
    { id: 103, jobCode: "10103", jobTitle: "Community Health Worker", jobFamily: "Patient Support", reviewer: "Robert Kennedy", responsible: "Brayden Rogers", status: "Not Started", lastUpdated: "January 11, 2025" },
    { id: 104, jobCode: "10104", jobTitle: "Patient Navigator", jobFamily: "Patient Support", reviewer: "Adam Lambert", responsible: "Autumn Reed", status: "In Progress", lastUpdated: "June 17, 2025" },
    { id: 105, jobCode: "10105", jobTitle: "Discharge Planner", jobFamily: "Patient Support", reviewer: "Jennifer Williams", responsible: "Jameson Cook", status: "Submitted to HR", lastUpdated: "March 1, 2025" },
    { id: 106, jobCode: "10106", jobTitle: "Utilization Review Nurse", jobFamily: "Quality", reviewer: "Michael Roberts", responsible: "Emery Bailey", status: "In Progress", lastUpdated: "May 29, 2025" },
    { id: 107, jobCode: "10107", jobTitle: "Quality Improvement Specialist", jobFamily: "Quality", reviewer: "Linda Taylor", responsible: "Declan Rivera", status: "Completed", lastUpdated: "April 17, 2025" },
    { id: 108, jobCode: "10108", jobTitle: "Risk Management Coordinator", jobFamily: "Quality", reviewer: "David Phillips", responsible: "Skylar Cooper", status: "Not Started", lastUpdated: "February 6, 2025" },
    { id: 109, jobCode: "10109", jobTitle: "Patient Safety Officer", jobFamily: "Quality", reviewer: "Emma Sullivan", responsible: "Kai Richardson", status: "In Progress", lastUpdated: "June 15, 2025" },
    { id: 110, jobCode: "10110", jobTitle: "Clinical Documentation Specialist", jobFamily: "Health Information", reviewer: "Chris Harrison", responsible: "Brielle Ward", status: "Reviewed", lastUpdated: "March 24, 2025" },
    { id: 111, jobCode: "10111", jobTitle: "CDI Specialist", jobFamily: "Health Information", reviewer: "Sarah Mitchell", responsible: "Rowan Torres", status: "In Progress", lastUpdated: "May 11, 2025" },
    { id: 112, jobCode: "10112", jobTitle: "Health Information Manager", jobFamily: "Health Information", reviewer: "Kelly Johnson", responsible: "Sage Peterson", status: "Completed", lastUpdated: "April 7, 2025" },
    { id: 113, jobCode: "10113", jobTitle: "Privacy Officer", jobFamily: "Legal", reviewer: "Robert Kennedy", responsible: "Parker Gray", status: "Not Started", lastUpdated: "January 14, 2025" },
    { id: 114, jobCode: "10114", jobTitle: "Corporate Compliance Analyst", jobFamily: "Legal", reviewer: "Adam Lambert", responsible: "Quinn Ramirez", status: "In Progress", lastUpdated: "June 22, 2025" },
    { id: 115, jobCode: "10115", jobTitle: "Legal Counsel", jobFamily: "Legal", reviewer: "Jennifer Williams", responsible: "Executive Team", status: "Submitted to HR", lastUpdated: "March 2, 2025" },
    { id: 116, jobCode: "10116", jobTitle: "Contract Specialist", jobFamily: "Legal", reviewer: "Michael Roberts", responsible: "Phoenix James", status: "In Progress", lastUpdated: "May 20, 2025" },
    { id: 117, jobCode: "10117", jobTitle: "Environmental Health Specialist", jobFamily: "Facilities", reviewer: "Linda Taylor", responsible: "River Watson", status: "Completed", lastUpdated: "April 14, 2025" },
    { id: 118, jobCode: "10118", jobTitle: "Facilities Manager", jobFamily: "Facilities", reviewer: "David Phillips", responsible: "Oakley Brooks", status: "Not Started", lastUpdated: "February 17, 2025" },
    { id: 119, jobCode: "10119", jobTitle: "HVAC Technician", jobFamily: "Facilities", reviewer: "Emma Sullivan", responsible: "Cameron Kelly", status: "In Progress", lastUpdated: "June 6, 2025" },
    { id: 120, jobCode: "10120", jobTitle: "Electrical Technician", jobFamily: "Facilities", reviewer: "Chris Harrison", responsible: "Peyton Sanders", status: "Reviewed", lastUpdated: "March 21, 2025" },
    { id: 121, jobCode: "10121", jobTitle: "Plumbing Technician", jobFamily: "Facilities", reviewer: "Sarah Mitchell", responsible: "Taylor Wood", status: "In Progress", lastUpdated: "May 7, 2025" },
    { id: 122, jobCode: "10122", jobTitle: "Groundskeeper", jobFamily: "Facilities", reviewer: "Kelly Johnson", responsible: "Morgan Bennett", status: "Completed", lastUpdated: "April 4, 2025" },
    { id: 123, jobCode: "10123", jobTitle: "Security Supervisor", jobFamily: "Security", reviewer: "Robert Kennedy", responsible: "Jordan Cox", status: "Not Started", lastUpdated: "January 9, 2025" },
    { id: 124, jobCode: "10124", jobTitle: "Security Guard", jobFamily: "Security", reviewer: "Adam Lambert", responsible: "Casey Ward", status: "In Progress", lastUpdated: "June 18, 2025" },
    { id: 125, jobCode: "10125", jobTitle: "Emergency Management Coordinator", jobFamily: "Security", reviewer: "Jennifer Williams", responsible: "Drew Richardson", status: "Submitted to HR", lastUpdated: "February 28, 2025" },
    { id: 126, jobCode: "10126", jobTitle: "Safety Officer", jobFamily: "Security", reviewer: "Michael Roberts", responsible: "Finley Price", status: "In Progress", lastUpdated: "May 26, 2025" },
    { id: 127, jobCode: "10127", jobTitle: "Fire Safety Coordinator", jobFamily: "Security", reviewer: "Linda Taylor", responsible: "Hayden Russell", status: "Completed", lastUpdated: "April 21, 2025" },
    { id: 128, jobCode: "10128", jobTitle: "IT Manager", jobFamily: "IT Services", reviewer: "David Phillips", responsible: "Blake Griffin", status: "Not Started", lastUpdated: "February 4, 2025" },
    { id: 129, jobCode: "10129", jobTitle: "Network Administrator", jobFamily: "IT Services", reviewer: "Emma Sullivan", responsible: "Reese Hayes", status: "In Progress", lastUpdated: "June 12, 2025" },
    { id: 130, jobCode: "10130", jobTitle: "Database Administrator", jobFamily: "IT Services", reviewer: "Chris Harrison", responsible: "Avery Hughes", status: "Reviewed", lastUpdated: "March 19, 2025" },
    { id: 131, jobCode: "10131", jobTitle: "Systems Analyst", jobFamily: "IT Services", reviewer: "Sarah Mitchell", responsible: "Charlie Powell", status: "In Progress", lastUpdated: "May 13, 2025" },
    { id: 132, jobCode: "10132", jobTitle: "Cybersecurity Specialist", jobFamily: "IT Services", reviewer: "Kelly Johnson", responsible: "Sage Washington", status: "Completed", lastUpdated: "April 10, 2025" },
    { id: 133, jobCode: "10133", jobTitle: "Help Desk Technician", jobFamily: "IT Services", reviewer: "Robert Kennedy", responsible: "River Simmons", status: "Not Started", lastUpdated: "January 7, 2025" },
    { id: 134, jobCode: "10134", jobTitle: "Application Support Specialist", jobFamily: "IT Services", reviewer: "Adam Lambert", responsible: "Phoenix Henderson", status: "In Progress", lastUpdated: "June 20, 2025" },
    { id: 135, jobCode: "10135", jobTitle: "EHR Analyst", jobFamily: "IT Services", reviewer: "Jennifer Williams", responsible: "Oakley Patterson", status: "Submitted to HR", lastUpdated: "March 6, 2025" },
    { id: 136, jobCode: "10136", jobTitle: "Clinical Systems Analyst", jobFamily: "IT Services", reviewer: "Michael Roberts", responsible: "Cameron Alexander", status: "In Progress", lastUpdated: "May 24, 2025" },
    { id: 137, jobCode: "10137", jobTitle: "Data Warehouse Analyst", jobFamily: "IT Services", reviewer: "Linda Taylor", responsible: "Peyton Watson", status: "Completed", lastUpdated: "April 18, 2025" },
    { id: 138, jobCode: "10138", jobTitle: "Business Intelligence Analyst", jobFamily: "IT Services", reviewer: "David Phillips", responsible: "Taylor Kelly", status: "Not Started", lastUpdated: "February 13, 2025" },
    { id: 139, jobCode: "10139", jobTitle: "Project Manager", jobFamily: "Leadership", reviewer: "Emma Sullivan", responsible: "Morgan Sanders", status: "In Progress", lastUpdated: "June 8, 2025" },
    { id: 140, jobCode: "10140", jobTitle: "Program Manager", jobFamily: "Leadership", reviewer: "Chris Harrison", responsible: "Jordan Wood", status: "Reviewed", lastUpdated: "March 23, 2025" },
    { id: 141, jobCode: "10141", jobTitle: "Operations Manager", jobFamily: "Leadership", reviewer: "Sarah Mitchell", responsible: "Casey Bennett", status: "In Progress", lastUpdated: "May 9, 2025" },
    { id: 142, jobCode: "10142", jobTitle: "Department Director", jobFamily: "Leadership", reviewer: "Kelly Johnson", responsible: "Drew Cox", status: "Completed", lastUpdated: "April 1, 2025" },
    { id: 143, jobCode: "10143", jobTitle: "Vice President", jobFamily: "Leadership", reviewer: "Robert Kennedy", responsible: "Executive Team", status: "Not Started", lastUpdated: "January 5, 2025" },
    { id: 144, jobCode: "10144", jobTitle: "Chief Financial Officer", jobFamily: "Leadership", reviewer: "Adam Lambert", responsible: "Executive Team", status: "In Progress", lastUpdated: "June 23, 2025" },
    { id: 145, jobCode: "10145", jobTitle: "Chief Nursing Officer", jobFamily: "Leadership", reviewer: "Jennifer Williams", responsible: "Executive Team", status: "Submitted to HR", lastUpdated: "February 26, 2025" },
    { id: 146, jobCode: "10146", jobTitle: "Telemedicine Coordinator", jobFamily: "Clinical Support", reviewer: "Michael Roberts", responsible: "Taylor Davis", status: "In Progress", lastUpdated: "June 24, 2025" },
    { id: 147, jobCode: "10147", jobTitle: "Nurse Educator", jobFamily: "Clinical Support", reviewer: "Linda Taylor", responsible: "Jordan Smith", status: "Completed", lastUpdated: "April 22, 2025" },
    { id: 148, jobCode: "10148", jobTitle: "Pharmacy Director", jobFamily: "Pharmacy", reviewer: "David Phillips", responsible: "Casey Williams", status: "Not Started", lastUpdated: "February 3, 2025" },
    { id: 149, jobCode: "10149", jobTitle: "Clinical Nurse Specialist", jobFamily: "Clinical Support", reviewer: "Emma Sullivan", responsible: "Morgan Johnson", status: "In Progress", lastUpdated: "June 5, 2025" },
    { id: 150, jobCode: "10150", jobTitle: "Rehabilitation Therapist", jobFamily: "Clinical Support", reviewer: "Chris Harrison", responsible: "Riley Brown", status: "Reviewed", lastUpdated: "March 30, 2025" },
    { id: 151, jobCode: "10151", jobTitle: "Medical Social Worker", jobFamily: "Behavioral Health", reviewer: "Sarah Mitchell", responsible: "Quinn Wilson", status: "In Progress", lastUpdated: "May 17, 2025" },
    { id: 152, jobCode: "10152", jobTitle: "Geriatric Specialist", jobFamily: "Clinical Support", reviewer: "Kelly Johnson", responsible: "Parker Miller", status: "Completed", lastUpdated: "April 12, 2025" },
    { id: 153, jobCode: "10153", jobTitle: "Palliative Care Nurse", jobFamily: "Clinical Support", reviewer: "Robert Kennedy", responsible: "Sage Garcia", status: "Not Started", lastUpdated: "January 19, 2025" },
    { id: 154, jobCode: "10154", jobTitle: "Infectious Disease Specialist", jobFamily: "Clinical Support", reviewer: "Adam Lambert", responsible: "River Martinez", status: "In Progress", lastUpdated: "June 26, 2025" },
    { id: 155, jobCode: "10155", jobTitle: "Medical Interpreter", jobFamily: "Patient Support", reviewer: "Jennifer Williams", responsible: "Phoenix Anderson", status: "Submitted to HR", lastUpdated: "March 9, 2025" },
    { id: 156, jobCode: "10156", jobTitle: "Wound Care Nurse", jobFamily: "Clinical Support", reviewer: "Michael Roberts", responsible: "Oakley Taylor", status: "In Progress", lastUpdated: "May 21, 2025" },
    { id: 157, jobCode: "10157", jobTitle: "Endoscopy Technician", jobFamily: "Clinical Support", reviewer: "Linda Taylor", responsible: "Cameron White", status: "Completed", lastUpdated: "April 26, 2025" },
    { id: 158, jobCode: "10158", jobTitle: "Anesthesiologist", jobFamily: "Clinical Support", reviewer: "David Phillips", responsible: "Peyton Harris", status: "Not Started", lastUpdated: "February 21, 2025" },
    { id: 159, jobCode: "10159", jobTitle: "Neurologist", jobFamily: "Clinical Support", reviewer: "Emma Sullivan", responsible: "Drew Thompson", status: "In Progress", lastUpdated: "June 10, 2025" },
    { id: 160, jobCode: "10160", jobTitle: "Cardiologist", jobFamily: "Clinical Support", reviewer: "Chris Harrison", responsible: "Finley Clark", status: "Reviewed", lastUpdated: "March 16, 2025" },
    { id: 161, jobCode: "10161", jobTitle: "Oncologist", jobFamily: "Clinical Support", reviewer: "Sarah Mitchell", responsible: "Hayden Lewis", status: "In Progress", lastUpdated: "May 4, 2025" },
    { id: 162, jobCode: "10162", jobTitle: "Dermatologist", jobFamily: "Clinical Support", reviewer: "Kelly Johnson", responsible: "Blake Walker", status: "Completed", lastUpdated: "April 29, 2025" },
    { id: 163, jobCode: "10163", jobTitle: "Urologist", jobFamily: "Clinical Support", reviewer: "Robert Kennedy", responsible: "Reese Hall", status: "Not Started", lastUpdated: "January 26, 2025" },
    { id: 164, jobCode: "10164", jobTitle: "Orthopedic Surgeon", jobFamily: "Clinical Support", reviewer: "Adam Lambert", responsible: "Avery Young", status: "In Progress", lastUpdated: "June 27, 2025" },
    { id: 165, jobCode: "10165", jobTitle: "Plastic Surgeon", jobFamily: "Clinical Support", reviewer: "Jennifer Williams", responsible: "Charlie King", status: "Submitted to HR", lastUpdated: "March 13, 2025" },
    { id: 166, jobCode: "10166", jobTitle: "Emergency Physician", jobFamily: "Clinical Support", reviewer: "Michael Roberts", responsible: "Sage Wright", status: "In Progress", lastUpdated: "May 28, 2025" },
    { id: 167, jobCode: "10167", jobTitle: "Radiologist", jobFamily: "Clinical Support", reviewer: "Linda Taylor", responsible: "River Lopez", status: "Completed", lastUpdated: "April 17, 2025" },
    { id: 168, jobCode: "10168", jobTitle: "Pathologist", jobFamily: "Lab Services", reviewer: "David Phillips", responsible: "Phoenix Hill", status: "Not Started", lastUpdated: "February 14, 2025" },
    { id: 169, jobCode: "10169", jobTitle: "Psychiatrist", jobFamily: "Behavioral Health", reviewer: "Emma Sullivan", responsible: "Oakley Green", status: "In Progress", lastUpdated: "June 19, 2025" },
    { id: 170, jobCode: "10170", jobTitle: "Pediatrician", jobFamily: "Clinical Support", reviewer: "Chris Harrison", responsible: "Cameron Adams", status: "Reviewed", lastUpdated: "March 27, 2025" },
    { id: 171, jobCode: "10171", jobTitle: "Obstetrician", jobFamily: "Clinical Support", reviewer: "Sarah Mitchell", responsible: "Peyton Baker", status: "In Progress", lastUpdated: "May 15, 2025" },
    { id: 172, jobCode: "10172", jobTitle: "Gynecologist", jobFamily: "Clinical Support", reviewer: "Kelly Johnson", responsible: "Taylor Gonzalez", status: "Completed", lastUpdated: "April 23, 2025" },
    { id: 173, jobCode: "10173", jobTitle: "Pulmonologist", jobFamily: "Clinical Support", reviewer: "Robert Kennedy", responsible: "Morgan Nelson", status: "Not Started", lastUpdated: "January 31, 2025" },
    { id: 174, jobCode: "10174", jobTitle: "Gastroenterologist", jobFamily: "Clinical Support", reviewer: "Adam Lambert", responsible: "Jordan Carter", status: "In Progress", lastUpdated: "June 21, 2025" },
    { id: 175, jobCode: "10175", jobTitle: "Endocrinologist", jobFamily: "Clinical Support", reviewer: "Jennifer Williams", responsible: "Casey Mitchell", status: "Submitted to HR", lastUpdated: "March 3, 2025" },
    { id: 176, jobCode: "10176", jobTitle: "Rheumatologist", jobFamily: "Clinical Support", reviewer: "Michael Roberts", responsible: "Drew Perez", status: "In Progress", lastUpdated: "May 31, 2025" },
    { id: 177, jobCode: "10177", jobTitle: "Hematologist", jobFamily: "Clinical Support", reviewer: "Linda Taylor", responsible: "Finley Roberts", status: "Completed", lastUpdated: "April 5, 2025" }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Not Started":
        return "bg-red-100 text-red-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Reviewed":
        return "bg-purple-100 text-purple-800";
      case "Submitted to HR":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper function to parse date strings
  const parseDate = (dateString: string): Date => {
    return new Date(dateString);
  };

  // Get unique job families and statuses for dropdowns
  const uniqueJobFamilies = Array.from(new Set(jobEntries.map(entry => entry.jobFamily))).sort();
  const allUniqueStatuses = Array.from(new Set(jobEntries.map(entry => entry.status))).sort();
  // Filter out "Submitted to HR" when not in admin mode
  const uniqueStatuses = isAdminMode 
    ? allUniqueStatuses 
    : allUniqueStatuses.filter(status => status !== "Submitted to HR");

  const filteredEntries = jobEntries.filter(entry => {
    // Hide "Submitted to HR" rows when not in admin mode
    if (!isAdminMode && entry.status === "Submitted to HR") {
      return false;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === "" || 
      entry.jobCode.toLowerCase().includes(searchLower) ||
      entry.jobTitle.toLowerCase().includes(searchLower) ||
      entry.jobFamily.toLowerCase().includes(searchLower) ||
      entry.reviewer.toLowerCase().includes(searchLower) ||
      entry.responsible.toLowerCase().includes(searchLower) ||
      entry.status.toLowerCase().includes(searchLower) ||
      entry.lastUpdated.toLowerCase().includes(searchLower);
    
    const matchesJobFamily = selectedJobFamily === "" || entry.jobFamily === selectedJobFamily;
    const matchesStatus = selectedStatus === "" || entry.status === selectedStatus;
    
    return matchesSearch && matchesJobFamily && matchesStatus;
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedJobFamily("");
    setSelectedStatus("");
    setSortBy("");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  const hasFilters = searchTerm !== "" || selectedJobFamily !== "" || selectedStatus !== "";

  // Apply sorting to filtered entries
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (!sortBy) return 0;
    
    let aValue: string | number = '';
    let bValue: string | number = '';
    
    switch (sortBy) {
      case 'jobCode':
        aValue = a.jobCode;
        bValue = b.jobCode;
        break;
      case 'jobTitle':
        aValue = a.jobTitle;
        bValue = b.jobTitle;
        break;
      case 'jobFamily':
        aValue = a.jobFamily;
        bValue = b.jobFamily;
        break;
      case 'reviewer':
        aValue = a.reviewer;
        bValue = b.reviewer;
        break;
      case 'responsible':
        aValue = a.responsible;
        bValue = b.responsible;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'lastUpdated':
        aValue = new Date(a.lastUpdated).getTime();
        bValue = new Date(b.lastUpdated).getTime();
        break;
      default:
        return 0;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortOrder === 'asc' ? comparison : -comparison;
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const totalPages = Math.ceil(sortedEntries.length / 10);
  const startIndex = (currentPage - 1) * 10;
  const paginatedEntries = sortedEntries.slice(startIndex, startIndex + 10);

  // Function to handle reviewer assignment
  const handleReviewerAssignment = (entryId: number, userName: string) => {
    setReviewerAssignments(prev => ({
      ...prev,
      [entryId]: userName
    }));
  };

  // Function to handle functional leader name click
  const handleFunctionalLeaderClick = (reviewerName: string) => {
    setSearchTerm(reviewerName);
    setSelectedStatus(""); // Clear role filter
    setCurrentPage(1); // Reset to first page
  };

  // Excel export function
  const exportToExcel = () => {
    // Check if secure CDN version is available
    if (!window.XLSX) {
      console.error('XLSX library not loaded from CDN');
      return;
    }

    // Get all filtered data (not just paginated data)
    const dataToExport = filteredEntries.map(entry => ({
      'Job Code': entry.jobCode,
      'Job Title': entry.jobTitle,
      'Job Family': entry.jobFamily,
      'Functional Leader': entry.reviewer,
      'Responsible': entry.responsible,
      'Status': entry.status,
      'Last Updated': entry.lastUpdated
    }));

    // Create workbook and worksheet using secure CDN version
    const wb = window.XLSX.utils.book_new();
    const ws = window.XLSX.utils.json_to_sheet(dataToExport);

    // Set column widths
    const colWidths = [
      { wch: 12 }, // Job Code
      { wch: 40 }, // Job Title
      { wch: 20 }, // Job Family
      { wch: 20 }, // Functional Leader
      { wch: 20 }, // Responsible
      { wch: 15 }, // Status
      { wch: 15 }  // Last Updated
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    window.XLSX.utils.book_append_sheet(wb, ws, 'Job Descriptions');

    // Generate filename with current date
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const filename = `Job_Descriptions_Export_${dateStr}.xlsx`;

    // Save file using secure CDN version
    window.XLSX.writeFile(wb, filename);
  };

  // Function to get the reviewer display for a given entry
  const getReviewerDisplay = (entry: JobEntry, index: number) => {
    const actualIndex = startIndex + index + 1; // Calculate actual row number
    
    // Check if this is an assigned reviewer from dropdown (only for unfiltered view and specific original positions)
    const isUnfilteredView = searchTerm === "" && selectedStatus === "" && selectedJobFamily === "";
    const isOriginalPosition = isUnfilteredView && entry.id === actualIndex; // Only for original positions
    const assignedReviewer = isOriginalPosition ? reviewerAssignments[actualIndex] : null;
    
    // If there's an assigned reviewer from dropdown, show it (only for original unfiltered positions)
    if (assignedReviewer) {
      return (
        <button
          onClick={() => handleFunctionalLeaderClick(assignedReviewer)}
          className="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer text-left"
        >
          {assignedReviewer}
        </button>
      );
    }
    
    // Always show the actual reviewer name as clickable link if it exists
    if (entry.reviewer && entry.reviewer.trim() !== "") {
      // Check if reviewer contains multiple names separated by comma
      if (entry.reviewer.includes(', ')) {
        const reviewerNames = entry.reviewer.split(', ');
        return (
          <div className="flex flex-wrap gap-1">
            {reviewerNames.map((name, nameIndex) => (
              <button
                key={nameIndex}
                onClick={() => handleFunctionalLeaderClick(name.trim())}
                className="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer text-left"
              >
                {name.trim()}{nameIndex < reviewerNames.length - 1 ? ',' : ''}
              </button>
            ))}
          </div>
        );
      }
      
      // Single reviewer name
      return (
        <button
          onClick={() => handleFunctionalLeaderClick(entry.reviewer)}
          className="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer text-left"
        >
          {entry.reviewer}
        </button>
      );
    }
    
    // Show empty icon only for unfiltered view, original positions 1-2, when no reviewer assigned
    if (isUnfilteredView && actualIndex <= 2 && entry.id === actualIndex) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <UserCircle className="w-4 h-4 text-gray-400 hover:text-blue-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {availableUsers.map((user) => (
              <DropdownMenuItem
                key={user}
                onClick={() => handleReviewerAssignment(actualIndex, user)}
                className="cursor-pointer"
              >
                {user}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    
    // Fallback - show empty user icon with tooltip
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <UserCircle className="w-5 h-5 text-gray-400 cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p>In order to add people here you need to assign them in the Job Description Review page</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
              <span className="font-semibold text-sm">⚠️ PRE-PROD RELEASE BETA 1.0</span>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">Jobs Family</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
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
                              <p className="text-sm text-gray-700">{renderNotificationWithLinks(notification)}</p>
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

          {/* Controls */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Job Family..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-96"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearFilters}
                  disabled={!hasFilters}
                >
                  {hasFilters ? <FilterX className="w-4 h-4 mr-2" /> : <Filter className="w-4 h-4 mr-2" />}
                  {hasFilters ? "Clear Filters" : "Filters"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {selectedJobFamily || "Select Job Family"}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedJobFamily("")}>
                      All Job Families
                    </DropdownMenuItem>
                    {uniqueJobFamilies.map((jobFamily) => (
                      <DropdownMenuItem
                        key={jobFamily}
                        onClick={() => setSelectedJobFamily(jobFamily)}
                      >
                        {jobFamily}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {selectedStatus || "Select Status"}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedStatus("")}>
                      All Statuses
                    </DropdownMenuItem>
                    {uniqueStatuses.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

              </div>
            </div>

            {/* Export Button */}
            <div className="mb-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportToExcel}
                className="flex items-center space-x-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export to Excel</span>
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("jobCode")}
                      >
                        <span>Job Code</span>
                        {getSortIcon("jobCode")}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("jobTitle")}
                      >
                        <span>Job Title</span>
                        {getSortIcon("jobTitle")}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("jobFamily")}
                      >
                        <span>Job Family</span>
                        {getSortIcon("jobFamily")}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("reviewer")}
                      >
                        <span>Functional Leader</span>
                        {getSortIcon("reviewer")}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("responsible")}
                      >
                        <span>Responsible</span>
                        {getSortIcon("responsible")}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("status")}
                      >
                        <span>Status</span>
                        {getSortIcon("status")}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("lastUpdated")}
                      >
                        <span>Last Updated</span>
                        {getSortIcon("lastUpdated")}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedEntries.map((entry, index) => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            if (entry.status === "Completed") {
                              setLocation(`/job-final-review?jobCode=${entry.jobCode}`);
                            } else {
                              setLocation(`/editing?jobCode=${entry.jobCode}`);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                        >
                          {entry.jobCode}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.jobTitle}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.jobFamily}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getReviewerDisplay(entry, index)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {entry.responsible ? entry.responsible : (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <UserCircle className="w-5 h-5 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>In order to add people here you need to assign them in the Job Description Review page</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(entry.status)}`}>
                          {entry.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.lastUpdated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Showing 1 to {Math.min(10, filteredEntries.length)} of {filteredEntries.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentGroup = Math.floor((currentPage - 1) / 5);
                    const previousGroupStart = Math.max(0, currentGroup - 1) * 5 + 1;
                    setCurrentPage(previousGroupStart);
                  }}
                  disabled={currentPage <= 5}
                >
                  &lt;
                </Button>
                
                {/* Dynamic cycling page buttons */}
                {(() => {
                  const getVisiblePages = () => {
                    if (totalPages <= 5) {
                      return Array.from({ length: totalPages }, (_, i) => i + 1);
                    }
                    
                    // Calculate which group of 5 the current page belongs to
                    const currentGroup = Math.floor((currentPage - 1) / 5);
                    const groupStart = currentGroup * 5 + 1;
                    const groupEnd = Math.min(groupStart + 4, totalPages);
                    
                    return Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i);
                  };
                  
                  return getVisiblePages().map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  ));
                })()}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentGroup = Math.floor((currentPage - 1) / 5);
                    const nextGroupStart = (currentGroup + 1) * 5 + 1;
                    setCurrentPage(Math.min(totalPages, nextGroupStart));
                  }}
                  disabled={Math.floor((currentPage - 1) / 5) >= Math.floor((totalPages - 1) / 5)}
                >
                  &gt;
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}