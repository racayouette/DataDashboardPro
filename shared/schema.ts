// TypeScript interfaces for data structures - No database dependencies

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobFamily {
  id: number;
  jobFamily: string;
  totalJobs: number;
  jobsReviewed: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: number;
  jobCode: string;
  jobTitle: string;
  jobFamilyId?: number;
  reviewerId?: number;
  responsibleId?: number;
  status: string;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobDescription {
  id: number;
  jobId?: number;
  version: number;
  jobSummary: string;
  originalJobSummary?: string;
  lastEditedById?: number;
  lastUpdatedDate: Date;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EssentialFunction {
  id: number;
  jobDescriptionId?: number;
  functionText: string;
  sortOrder: number;
  hasEdit?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: number;
  userId?: number;
  title: string;
  message: string;
  type: string;
  category: string;
  priority: string;
  isRead?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardSummary {
  id: number;
  totalUsers: number;
  revenue: number;
  orders: number;
  growthRate: number;
  jobsReviewed: number;
  inProgress: number;
  notStarted: number;
  updatedAt: Date;
}

export interface Transaction {
  id: number;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: string;
  date: Date;
}

export interface Reviewer {
  id: number;
  username?: string;
  fullName?: string;
  email?: string;
  department?: string;
  status: string;
  jobsAssigned: number;
  completedJobs: number;
  responsible: string;
  jobFamily: string;
  inProgress: number;
  completed: number;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobDescriptionChange {
  id: number;
  jobDescriptionId?: number;
  changeType: string;
  oldValue?: string;
  newValue?: string;
  changedById?: number;
  changeReason?: string;
  createdAt: Date;
}

export interface AuditLog {
  id: number;
  userId?: number;
  action: string;
  entityType: string;
  entityId?: number;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface ActiveDirectoryConfig {
  id: number;
  name: string;
  environment: string;
  server: string;
  port: number;
  bindDN: string;
  bindPassword: string;
  baseDN: string;
  searchFilter?: string;
  isActive?: boolean;
  isEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Insert types for form validation
export type InsertUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Date;
  updatedAt?: Date;
};

export type InsertJobFamily = Omit<JobFamily, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Date;
  updatedAt?: Date;
};

export type InsertJob = Omit<Job, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Date;
  updatedAt?: Date;
};

export type InsertJobDescription = Omit<JobDescription, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Date;
  updatedAt?: Date;
};

export type InsertEssentialFunction = Omit<EssentialFunction, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Date;
  updatedAt?: Date;
};

export type InsertNotification = Omit<Notification, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Date;
  updatedAt?: Date;
};

export type InsertDashboardSummary = Omit<DashboardSummary, 'id' | 'updatedAt'> & {
  updatedAt?: Date;
};

export type InsertTransaction = Omit<Transaction, 'id'>;

export type InsertReviewer = Omit<Reviewer, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Date;
  updatedAt?: Date;
};

export type InsertJobDescriptionChange = Omit<JobDescriptionChange, 'id' | 'createdAt'> & {
  createdAt?: Date;
};

export type InsertAuditLog = Omit<AuditLog, 'id' | 'createdAt'> & {
  createdAt?: Date;
};

export type InsertActiveDirectoryConfig = Omit<ActiveDirectoryConfig, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Date;
  updatedAt?: Date;
};

// Schema validation (using zod for form validation)
import { z } from "zod";

export const insertUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  department: z.string(),
  status: z.string(),
});

export const insertJobFamilySchema = z.object({
  jobFamily: z.string(),
  totalJobs: z.number(),
  jobsReviewed: z.number(),
  description: z.string().optional(),
});

export const insertTransactionSchema = z.object({
  customerName: z.string(),
  customerEmail: z.string().email(),
  amount: z.number(),
  status: z.string(),
  date: z.date(),
});

export const insertReviewerSchema = z.object({
  username: z.string().optional(),
  fullName: z.string().optional(),
  email: z.string().email().optional(),
  department: z.string().optional(),
  status: z.string(),
  jobsAssigned: z.number(),
  completedJobs: z.number(),
  responsible: z.string(),
  jobFamily: z.string(),
  inProgress: z.number(),
  completed: z.number(),
});