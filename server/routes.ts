import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertTransactionSchema, insertJobFamilySchema, insertReviewerSchema } from "@shared/schema";
import { setupSSORoutes, ssoService } from "./sso";
import { adService } from "./activeDirectory";
// Database connection status removed - using in-memory storage

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup SSO routes
  setupSSORoutes(app);

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
      // Mock health status for in-memory storage
      const status = {
        isConnected: true,
        lastConnected: new Date().toISOString(),
        lastError: null,
        reconnectAttempts: 0,
        maxReconnectAttempts: 5,
        uptime: Date.now()
      };
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

  // Export file download endpoints
  app.get("/api/downloads/:filename", async (req, res) => {
    const { filename } = req.params;
    
    // Security: only allow specific export files
    const allowedFiles = [
      'ANGULAR_EXPORT_README.md',
      'ANGULAR_CONVERSION_COMPLETE.md',
      'database-schema.sql',
      'database-sample-data.sql',
      'EXPORT_README.md',
      'angular-conversion-export.tar.gz'
    ];

    if (!allowedFiles.includes(filename)) {
      return res.status(404).json({ error: "File not found" });
    }

    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const filePath = path.resolve(process.cwd(), filename);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({ error: "File not found" });
      }

      // Get file stats for proper headers
      const stats = await fs.stat(filePath);
      
      // Set appropriate headers based on file type
      const contentType = filename.endsWith('.md') ? 'text/markdown' : 
                         filename.endsWith('.sql') ? 'application/sql' : 
                         filename.endsWith('.tar.gz') ? 'application/gzip' : 
                         'application/octet-stream';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Stream the file
      const fileBuffer = await fs.readFile(filePath);
      res.send(fileBuffer);
      
      console.log(`File downloaded: ${filename}`);
    } catch (error) {
      console.error(`Download error for ${filename}:`, error);
      res.status(500).json({ error: "Download failed" });
    }
  });

  // Get available export files info
  app.get("/api/downloads", async (_req, res) => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };
    
    const exportFiles = [
      {
        id: 'angular-readme',
        name: 'Angular 19 Setup Guide',
        description: 'Complete installation and configuration guide for Angular conversion',
        filename: 'ANGULAR_EXPORT_README.md',
        type: 'documentation',
        available: false,
        size: '0 KB'
      },
      {
        id: 'angular-conversion',
        name: 'Angular Conversion Guide',
        description: 'Detailed component-by-component conversion documentation',
        filename: 'ANGULAR_CONVERSION_COMPLETE.md',
        type: 'documentation',
        available: false,
        size: '0 KB'
      },
      {
        id: 'database-schema',
        name: 'Database Schema',
        description: 'Complete SQL Server database structure and table definitions',
        filename: 'database-schema.sql',
        type: 'database',
        available: false,
        size: '0 KB'
      },
      {
        id: 'database-sample',
        name: 'Sample Data',
        description: 'Pre-populated sample data for testing and development',
        filename: 'database-sample-data.sql',
        type: 'database',
        available: false,
        size: '0 KB'
      },
      {
        id: 'complete-archive',
        name: 'Complete Project Archive',
        description: 'All files bundled in a single downloadable archive',
        filename: 'angular-conversion-export.tar.gz',
        type: 'archive',
        available: false,
        size: '0 KB'
      }
    ];

    // Check each file and get actual size
    for (const file of exportFiles) {
      try {
        const filePath = path.resolve(process.cwd(), file.filename);
        const stats = await fs.stat(filePath);
        file.available = true;
        file.size = formatFileSize(stats.size);
      } catch {
        // File doesn't exist, keep default values
      }
    }

    res.json(exportFiles);
  });

  // Job descriptions endpoints for version comparison
  app.get("/api/jobs/:jobId/descriptions", async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const descriptions = await storage.getJobDescriptions(jobId);
      res.json(descriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job descriptions" });
    }
  });

  app.get("/api/job-descriptions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const description = await storage.getJobDescriptionById(id);
      if (!description) {
        return res.status(404).json({ message: "Job description not found" });
      }
      res.json(description);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job description" });
    }
  });

  app.get("/api/jobs/:jobId/descriptions/active", async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const description = await storage.getActiveJobDescription(jobId);
      if (!description) {
        return res.status(404).json({ message: "No active job description found" });
      }
      res.json(description);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active job description" });
    }
  });

  app.get("/api/job-descriptions/:id/essential-functions", async (req, res) => {
    try {
      const jobDescriptionId = parseInt(req.params.id);
      const functions = await storage.getEssentialFunctions(jobDescriptionId);
      res.json(functions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch essential functions" });
    }
  });

  // Version comparison endpoint
  app.get("/api/job-descriptions/:originalId/compare/:currentId", async (req, res) => {
    try {
      const originalId = parseInt(req.params.originalId);
      const currentId = parseInt(req.params.currentId);
      
      const [original, current, originalFunctions, currentFunctions] = await Promise.all([
        storage.getJobDescriptionById(originalId),
        storage.getJobDescriptionById(currentId),
        storage.getEssentialFunctions(originalId),
        storage.getEssentialFunctions(currentId)
      ]);

      if (!original || !current) {
        return res.status(404).json({ message: "One or both job descriptions not found" });
      }

      // Format essential functions as numbered list
      const formatFunctions = (functions: any[]) => 
        functions.map((f, i) => `${i + 1}. ${f.description}`).join('\n');

      const comparison = {
        original: {
          id: original.id,
          jobSummary: original.jobSummary || '',
          description: original.originalJobSummary || '',
          essentialFunctions: formatFunctions(originalFunctions),
          version: original.version,
          status: original.isActive ? 'active' : 'inactive',
          lastModified: original.lastUpdatedDate
        },
        current: {
          id: current.id,
          jobSummary: current.jobSummary || '',
          description: current.originalJobSummary || '',
          essentialFunctions: formatFunctions(currentFunctions),
          version: current.version,
          status: current.isActive ? 'active' : 'inactive',
          lastModified: current.lastUpdatedDate
        }
      };

      res.json(comparison);
    } catch (error) {
      res.status(500).json({ message: "Failed to perform version comparison" });
    }
  });

  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time database health monitoring
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established for health monitoring');
    
    // Mock health status for in-memory storage
    const getHealthStatus = () => ({
      isConnected: true,
      lastConnected: new Date().toISOString(),
      lastError: null,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      uptime: Date.now(),
      timestamp: new Date().toISOString()
    });
    
    // Send initial status
    const initialStatus = getHealthStatus();
    ws.send(JSON.stringify({
      type: 'health_status',
      data: initialStatus
    }));
    
    // Set up periodic status updates
    const statusInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        const currentStatus = getHealthStatus();
        ws.send(JSON.stringify({
          type: 'health_status',
          data: currentStatus
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
          const status = getHealthStatus();
          ws.send(JSON.stringify({
            type: 'health_status',
            data: status
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

  // Active Directory routes
  app.get("/api/active-directory/status", async (req, res) => {
    try {
      const status = adService.getConnectionStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get AD status" });
    }
  });

  app.post("/api/active-directory/test", async (req, res) => {
    try {
      const result = await adService.testConnection();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Connection test failed" });
    }
  });

  app.post("/api/active-directory/authenticate", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const adUser = await adService.authenticate(username, password);
      if (!adUser) {
        return res.status(401).json({ error: "Authentication failed" });
      }

      // Sync user to local database
      const localUser = await adService.syncUserToDatabase(adUser);
      res.json({ user: localUser, adUser });
    } catch (error) {
      console.error("AD authentication error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  app.get("/api/active-directory/users", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const users = await adService.getUsers(limit);
      res.json({ users });
    } catch (error) {
      console.error("Error fetching AD users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/active-directory/sync", async (req, res) => {
    try {
      const users = await adService.getUsers(100);
      const syncResults = [];
      
      for (const adUser of users) {
        if (adUser.email) {
          try {
            const localUser = await adService.syncUserToDatabase(adUser);
            syncResults.push({ success: true, user: localUser.name });
          } catch (error) {
            syncResults.push({ success: false, user: adUser.username, error: String(error) });
          }
        }
      }
      
      res.json({ 
        message: "Sync completed", 
        total: users.length,
        synced: syncResults.filter(r => r.success).length,
        failed: syncResults.filter(r => !r.success).length,
        results: syncResults
      });
    } catch (error) {
      console.error("AD sync error:", error);
      res.status(500).json({ error: "Sync failed" });
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, fullName, email } = req.body;
      
      if (!username || !fullName || !email) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getReviewerByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }

      const newUser = await storage.createUserInReviewers({ username, fullName, email });
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  return httpServer;
}
