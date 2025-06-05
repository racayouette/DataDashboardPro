// Data Models - converted from shared/schema.ts types

export interface DashboardSummary {
  id: number;
  totalUsers: number;
  revenue: string;
  orders: number;
  growthRate: string;
  jobsReviewed: number;
  inProgress: number;
  notStarted: number;
  updatedAt: Date;
}

export interface Transaction {
  id: number;
  customerName: string;
  customerEmail: string;
  amount: string;
  status: string;
  description: string | null;
  date: Date;
}

export interface JobFamily {
  id: number;
  jobFamily: string;
  totalJobs: number;
  jobsReviewed: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reviewer {
  id: number;
  jobFamily: string;
  completed: number;
  inProgress: number;
  responsible: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  department: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: number;
  jobCode: string;
  jobTitle: string;
  jobFamilyId: number;
  status: string;
  reviewerId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobDescription {
  id: number;
  jobId: number;
  version: number;
  jobSummary: string | null;
  isActive: boolean;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EssentialFunction {
  id: number;
  jobDescriptionId: number;
  functionText: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: number;
  userId: number | null;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

export interface DatabaseHealthStatus {
  isConnected: boolean;
  lastConnected: string | null;
  lastError: string | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  uptime: number;
  timestamp: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
}