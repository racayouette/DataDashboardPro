import { pgTable, text, serial, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const dashboardSummary = pgTable("dashboard_summary", {
  id: serial("id").primaryKey(),
  totalUsers: integer("total_users").notNull(),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).notNull(),
  orders: integer("orders").notNull(),
  growthRate: decimal("growth_rate", { precision: 5, scale: 2 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // 'Completed', 'Pending', 'Failed'
  date: timestamp("date").defaultNow().notNull(),
});

export const jobFamilies = pgTable("job_families", {
  id: serial("id").primaryKey(),
  jobFamily: text("job_family").notNull(),
  totalJobs: integer("total_jobs").notNull(),
  jobsReviewed: integer("jobs_reviewed").notNull(),
});

export const reviewers = pgTable("reviewers", {
  id: serial("id").primaryKey(),
  jobFamily: text("job_family").notNull(),
  completed: integer("completed").notNull(),
  inProgress: integer("in_progress").notNull(),
});

export const insertDashboardSummarySchema = createInsertSchema(dashboardSummary).omit({
  id: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  date: true,
});

export const insertJobFamilySchema = createInsertSchema(jobFamilies).omit({
  id: true,
});

export const insertReviewerSchema = createInsertSchema(reviewers).omit({
  id: true,
});

// Legacy export for backward compatibility - will be removed
export const insertProductSchema = insertJobFamilySchema;

export type InsertDashboardSummary = z.infer<typeof insertDashboardSummarySchema>;
export type DashboardSummary = typeof dashboardSummary.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertJobFamily = z.infer<typeof insertJobFamilySchema>;
export type JobFamily = typeof jobFamilies.$inferSelect;

export type InsertReviewer = z.infer<typeof insertReviewerSchema>;
export type Reviewer = typeof reviewers.$inferSelect;
