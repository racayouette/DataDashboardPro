import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertJobFamilySchema, insertReviewerSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard summary endpoint
  app.get("/api/dashboard/summary", async (req, res) => {
    try {
      const summary = await storage.getDashboardSummary();
      if (!summary) {
        return res.status(404).json({ message: "Dashboard summary not found" });
      }
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard summary" });
    }
  });

  // Recent transactions endpoint
  app.get("/api/transactions", async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      const result = await storage.getRecentTransactions(page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Job families endpoint
  app.get("/api/job-families", async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      const result = await storage.getJobFamilies(page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job families" });
    }
  });

  // Reviewers endpoint
  app.get("/api/reviewers", async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      const result = await storage.getReviewers(page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviewers" });
    }
  });

  // Create transaction endpoint (for future use)
  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  // Create job family endpoint (for future use)
  app.post("/api/job-families", async (req, res) => {
    try {
      const validatedData = insertJobFamilySchema.parse(req.body);
      const jobFamily = await storage.createJobFamily(validatedData);
      res.status(201).json(jobFamily);
    } catch (error) {
      res.status(400).json({ message: "Invalid job family data" });
    }
  });

  // Create reviewer endpoint (for future use)
  app.post("/api/reviewers", async (req, res) => {
    try {
      const validatedData = insertReviewerSchema.parse(req.body);
      const reviewer = await storage.createReviewer(validatedData);
      res.status(201).json(reviewer);
    } catch (error) {
      res.status(400).json({ message: "Invalid reviewer data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
