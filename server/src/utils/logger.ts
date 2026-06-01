import fs from "fs";
import path from "path";

const LOGS_DIR = path.join(__dirname, "../../../logs");
const LOG_FILE = path.join(LOGS_DIR, "production.log");

// Ensure the logs directory exists
const ensureLogDirectory = () => {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
};

const formatMessage = (level: string, message: string, error?: any): string => {
  const timestamp = new Date().toISOString();
  let logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (error) {
    logLine += ` - Error Details: ${error.stack || error.message || JSON.stringify(error)}`;
  }
  return logLine + "\n";
};

const writeToLogFile = (level: string, message: string, error?: any) => {
  if (process.env.NODE_ENV !== "production") return;
  try {
    ensureLogDirectory();
    fs.appendFileSync(LOG_FILE, formatMessage(level, message, error));
  } catch (err) {
    console.error("Failed to write to production log file:", err);
  }
};

export const logger = {
  info: (message: string) => {
    console.log(`[INFO] ${message}`);
    writeToLogFile("info", message);
  },
  warn: (message: string) => {
    console.warn(`[WARN] ${message}`);
    writeToLogFile("warn", message);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error || "");
    writeToLogFile("error", message, error);
  }
};
