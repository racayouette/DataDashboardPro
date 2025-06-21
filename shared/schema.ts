// TypeScript interfaces for data structures - No database dependencies
import { pgTable, serial, varchar, text, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { z } from "zod";

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

export interface Configuration {
  id: number;
  configType: string;
  configData: any; // JSON data
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

export type InsertConfiguration = Omit<Configuration, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Date;
  updatedAt?: Date;
};

// Schema validation (using zod for form validation)

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

export const insertConfigurationSchema = z.object({
  configType: z.string(),
  configData: z.any(),
});

// Database Table Definitions for Drizzle ORM
export const configurations = pgTable("configurations", {
  id: serial("id").primaryKey(),
  configType: varchar("config_type", { length: 100 }).unique().notNull(),
  configData: jsonb("config_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const dashboardSummary = pgTable("dashboard_summary", {
  id: serial("id").primaryKey(),
  totalUsers: integer("total_users").notNull(),
  revenue: integer("revenue").notNull(),
  orders: integer("orders").notNull(),
  growthRate: integer("growth_rate").notNull(),
  jobsReviewed: integer("jobs_reviewed").notNull(),
  inProgress: integer("in_progress").notNull(),
  notStarted: integer("not_started").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  amount: integer("amount").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  date: timestamp("date").notNull()
});

export const jobFamilies = pgTable("job_families", {
  id: serial("id").primaryKey(),
  jobFamily: varchar("job_family", { length: 255 }).notNull(),
  totalJobs: integer("total_jobs").notNull(),
  jobsReviewed: integer("jobs_reviewed").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const activeDirectoryConfigs = pgTable("active_directory_configs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  environment: varchar("environment", { length: 50 }).notNull(),
  server: varchar("server", { length: 255 }).notNull(),
  port: integer("port").notNull(),
  bindDN: varchar("bind_dn", { length: 255 }).notNull(),
  bindPassword: varchar("bind_password", { length: 255 }).notNull(),
  baseDN: varchar("base_dn", { length: 255 }).notNull(),
  searchFilter: varchar("search_filter", { length: 255 }),
  isActive: boolean("is_active").default(false),
  isEnabled: boolean("is_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  jobCode: varchar("job_code", { length: 50 }).notNull(),
  jobTitle: varchar("job_title", { length: 255 }).notNull(),
  jobFamilyId: integer("job_family_id"),
  reviewerId: integer("reviewer_id"),
  responsibleId: integer("responsible_id"),
  status: varchar("status", { length: 50 }).notNull(),
  lastUpdated: timestamp("last_updated").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});