import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dashboardRoutes from "./routes/dashboard";
import workspaceRoutes from "./routes/workspaces";
import userRoutes from "./routes/users";

dotenv.config();

// Default to production unless explicitly set, or if running in development (ts-node-dev / ts-node)
if (!process.env.NODE_ENV) {
  const isDev = process.env.TS_NODE_DEV || !!(process as any)[Symbol.for("ts-node.register.instance")];
  process.env.NODE_ENV = isDev ? "development" : "production";
}

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy headers (e.g. Render, Nginx, Cloudflare)
app.enable("trust proxy");

// Enforce HTTPS redirection in production environment
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.secure || req.headers["x-forwarded-proto"] === "https") {
      return next();
    }
    res.redirect(301, `https://${req.headers.host}${req.url}`);
  });
}

// Configurable CORS to restrict origins in production
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
  "http://localhost:8081",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
  "https://ptso-dashboard.region11.dost.gov.ph", // Official government URL
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or postman)
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.some(
        (allowed) => allowed.toLowerCase() === origin.toLowerCase() || origin.startsWith(allowed)
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Access blocked by CORS policy."));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// Import rate limiting middleware
import { createRateLimiter } from "./middleware/rateLimiter";

// General traffic limiter: 300 requests per 15 minutes
const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests from this IP. Please try again after 15 minutes."
});

// Stricter write operations limiter: 50 requests per 15 minutes
const writeLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many database modification attempts. Please try again after 15 minutes."
});

// Apply general rate limiting to all requests
app.use(generalLimiter);

// Apply stricter rate limiting to POST, PUT, and DELETE operations (database modifications)
app.use((req, res, next) => {
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    return writeLimiter(req, res, next);
  }
  next();
});

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/users", userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode`);
});
