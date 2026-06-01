import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dashboardRoutes from "./routes/dashboard";
import workspaceRoutes from "./routes/workspaces";
import userRoutes from "./routes/users";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configurable CORS to restrict origins in production
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
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
  console.log(`Server is running on http://localhost:${PORT}`);
});
