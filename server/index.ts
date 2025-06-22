import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import path from "path";

// Extend the session interface to include user data
declare module "express-session" {
  interface SessionData {
    user?: {
      id: number;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      department: string;
      role: string;
    };
  }
}
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration for AD SSO
app.use(session({
  secret: process.env.SESSION_SECRET || 'adventhealth-job-manager-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup static file serving for production
  if (process.env.NODE_ENV === "production") {
    // Serve static files from dist/public in production (matches Vite build output)
    app.use(express.static("dist/public"));
    
    // Handle SPA routing - serve index.html for non-API routes
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      
      // Use absolute path for production deployment
      const indexPath = path.resolve(process.cwd(), "dist/public/index.html");
      res.sendFile(indexPath);
    });
  } else {
    // Development mode with Vite
    await setupVite(app, server);
  }

  // Use Azure's assigned port or fallback to 5000 for local development
  const port = process.env.PORT || 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
