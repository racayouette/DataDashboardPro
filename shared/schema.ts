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

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  sales: integer("sales").notNull(),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).notNull(),
  trend: text("trend").notNull(), // e.g., '+15%', '-5%'
});

export const insertDashboardSummarySchema = createInsertSchema(dashboardSummary).omit({
  id: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  date: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export type InsertDashboardSummary = z.infer<typeof insertDashboardSummarySchema>;
export type DashboardSummary = typeof dashboardSummary.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
