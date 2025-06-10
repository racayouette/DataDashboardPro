import { pgTable, text, serial, integer, decimal, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table for authentication and user management
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(), // Admin, HR Manager, Reviewer, Employee
  department: text("department").notNull(),
  status: text("status").notNull(), // Active, Inactive
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Job families/categories
export const jobFamilies = pgTable("job_families", {
  id: serial("id").primaryKey(),
  jobFamily: text("job_family").notNull(),
  totalJobs: integer("total_jobs").notNull(),
  jobsReviewed: integer("jobs_reviewed").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Job descriptions/positions
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  jobCode: text("job_code").notNull().unique(),
  jobTitle: text("job_title").notNull(),
  jobFamilyId: integer("job_family_id").references(() => jobFamilies.id),
  reviewerId: integer("reviewer_id").references(() => users.id),
  responsibleId: integer("responsible_id").references(() => users.id),
  status: text("status").notNull(), // In Progress, Not Started, Completed, Reviewed
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Job description content and versions
export const jobDescriptions = pgTable("job_descriptions", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id),
  version: integer("version").notNull().default(1),
  jobSummary: text("job_summary").notNull(),
  originalJobSummary: text("original_job_summary"),
  lastEditedById: integer("last_edited_by_id").references(() => users.id),
  lastUpdatedDate: timestamp("last_updated_date").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Essential functions for job descriptions
export const essentialFunctions = pgTable("essential_functions", {
  id: serial("id").primaryKey(),
  jobDescriptionId: integer("job_description_id").references(() => jobDescriptions.id),
  functionText: text("function_text").notNull(),
  sortOrder: integer("sort_order").notNull(),
  hasEdit: boolean("has_edit").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notifications system
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, warning, success, error
  category: text("category").notNull(),
  priority: text("priority").notNull(), // high, medium, low
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dashboard summary metrics
export const dashboardSummary = pgTable("dashboard_summary", {
  id: serial("id").primaryKey(),
  totalUsers: integer("total_users").notNull(),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).notNull(),
  orders: integer("orders").notNull(),
  growthRate: decimal("growth_rate", { precision: 5, scale: 2 }).notNull(),
  jobsReviewed: integer("jobs_reviewed").notNull(),
  inProgress: integer("in_progress").notNull(),
  notStarted: integer("not_started").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Transactions (for dashboard data)
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // 'Completed', 'Pending', 'Failed'
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
});

// Reviewers (dashboard widget data)
export const reviewers = pgTable("reviewers", {
  id: serial("id").primaryKey(),
  username: text("username"),
  fullName: text("full_name"),
  email: text("email"),
  jobFamily: text("job_family").notNull(),
  completed: integer("completed").notNull(),
  inProgress: integer("in_progress").notNull(),
  responsible: text("responsible").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Track changes for job description editing
export const jobDescriptionChanges = pgTable("job_description_changes", {
  id: serial("id").primaryKey(),
  jobDescriptionId: integer("job_description_id").references(() => jobDescriptions.id),
  changeType: text("change_type").notNull(), // insert, delete, update
  fieldName: text("field_name").notNull(), // jobSummary, essentialFunction
  oldValue: text("old_value"),
  newValue: text("new_value"),
  position: integer("position"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Audit log for user actions
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id"),
  details: json("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  reviewedJobs: many(jobs, { relationName: "reviewer" }),
  responsibleJobs: many(jobs, { relationName: "responsible" }),
  editedJobDescriptions: many(jobDescriptions),
  notifications: many(notifications),
  changes: many(jobDescriptionChanges),
  auditLogs: many(auditLog),
}));

export const jobFamiliesRelations = relations(jobFamilies, ({ many }) => ({
  jobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  jobFamily: one(jobFamilies, {
    fields: [jobs.jobFamilyId],
    references: [jobFamilies.id],
  }),
  reviewer: one(users, {
    fields: [jobs.reviewerId],
    references: [users.id],
    relationName: "reviewer",
  }),
  responsible: one(users, {
    fields: [jobs.responsibleId],
    references: [users.id],
    relationName: "responsible",
  }),
  jobDescriptions: many(jobDescriptions),
}));

export const jobDescriptionsRelations = relations(jobDescriptions, ({ one, many }) => ({
  job: one(jobs, {
    fields: [jobDescriptions.jobId],
    references: [jobs.id],
  }),
  lastEditedBy: one(users, {
    fields: [jobDescriptions.lastEditedById],
    references: [users.id],
  }),
  essentialFunctions: many(essentialFunctions),
  changes: many(jobDescriptionChanges),
}));

export const essentialFunctionsRelations = relations(essentialFunctions, ({ one }) => ({
  jobDescription: one(jobDescriptions, {
    fields: [essentialFunctions.jobDescriptionId],
    references: [jobDescriptions.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const jobDescriptionChangesRelations = relations(jobDescriptionChanges, ({ one }) => ({
  jobDescription: one(jobDescriptions, {
    fields: [jobDescriptionChanges.jobDescriptionId],
    references: [jobDescriptions.id],
  }),
  user: one(users, {
    fields: [jobDescriptionChanges.userId],
    references: [users.id],
  }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobFamilySchema = createInsertSchema(jobFamilies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobDescriptionSchema = createInsertSchema(jobDescriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEssentialFunctionSchema = createInsertSchema(essentialFunctions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDashboardSummarySchema = createInsertSchema(dashboardSummary).omit({
  id: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  date: true,
});

export const insertReviewerSchema = createInsertSchema(reviewers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobDescriptionChangeSchema = createInsertSchema(jobDescriptionChanges).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLog).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type JobFamily = typeof jobFamilies.$inferSelect;
export type InsertJobFamily = z.infer<typeof insertJobFamilySchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type JobDescription = typeof jobDescriptions.$inferSelect;
export type InsertJobDescription = z.infer<typeof insertJobDescriptionSchema>;

export type EssentialFunction = typeof essentialFunctions.$inferSelect;
export type InsertEssentialFunction = z.infer<typeof insertEssentialFunctionSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type DashboardSummary = typeof dashboardSummary.$inferSelect;
export type InsertDashboardSummary = z.infer<typeof insertDashboardSummarySchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Reviewer = typeof reviewers.$inferSelect;
export type InsertReviewer = z.infer<typeof insertReviewerSchema>;

export type JobDescriptionChange = typeof jobDescriptionChanges.$inferSelect;
export type InsertJobDescriptionChange = z.infer<typeof insertJobDescriptionChangeSchema>;

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Active Directory configurations
export const activeDirectoryConfigs = pgTable("active_directory_configs", {
  id: serial("id").primaryKey(),
  environment: text("environment").notNull(), // 'testing' or 'production'
  name: text("name").notNull(),
  server: text("server").notNull(),
  port: integer("port").notNull().default(389),
  bindDN: text("bind_dn").notNull(),
  bindPassword: text("bind_password").notNull(),
  baseDN: text("base_dn").notNull(),
  searchFilter: text("search_filter").default("(objectClass=person)"),
  isEnabled: boolean("is_enabled").default(false),
  isActive: boolean("is_active").default(false), // Only one config per environment can be active
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertActiveDirectoryConfigSchema = createInsertSchema(activeDirectoryConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ActiveDirectoryConfig = typeof activeDirectoryConfigs.$inferSelect;
export type InsertActiveDirectoryConfig = z.infer<typeof insertActiveDirectoryConfigSchema>;

// Legacy export for backward compatibility
export const insertProductSchema = insertJobFamilySchema;