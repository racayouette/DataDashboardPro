import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertTransactionSchema, insertJobFamilySchema, insertReviewerSchema } from "@shared/schema";
import { getConnectionStatus } from "./db";

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

  // Database health monitoring endpoint
  app.get("/api/database/health", async (req, res) => {
    try {
      const status = getConnectionStatus();
      res.json({
        ...status,
        timestamp: new Date().toISOString(),
        serverTime: Date.now()
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch database health status",
        isConnected: false,
        lastError: "Health check failed"
      });
    }
  });

  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time database health monitoring
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established for health monitoring');
    
    // Send initial status
    const initialStatus = getConnectionStatus();
    ws.send(JSON.stringify({
      type: 'health_status',
      data: {
        ...initialStatus,
        timestamp: new Date().toISOString()
      }
    }));
    
    // Set up periodic status updates
    const statusInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        const currentStatus = getConnectionStatus();
        ws.send(JSON.stringify({
          type: 'health_status',
          data: {
            ...currentStatus,
            timestamp: new Date().toISOString()
          }
        }));
      }
    }, 5000); // Send updates every 5 seconds
    
    // Handle client messages
    ws.on('message', (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'ping') {
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString()
          }));
        }
        
        if (data.type === 'request_status') {
          const status = getConnectionStatus();
          ws.send(JSON.stringify({
            type: 'health_status',
            data: {
              ...status,
              timestamp: new Date().toISOString()
            }
          }));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Clean up on disconnect
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      clearInterval(statusInterval);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clearInterval(statusInterval);
    });
  });

  return httpServer;
}
