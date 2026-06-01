import { Request, Response, NextFunction } from "express";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipRequestMap = new Map<string, RateLimitRecord>();

/**
 * Custom lightweight in-memory rate limiter middleware.
 * Prevents endpoint spamming and protects system resources.
 */
export function createRateLimiter(options: {
  windowMs: number; // Time window in milliseconds
  max: number;      // Maximum number of requests allowed in windowMs
  message: string;  // Error message response when rate limit is exceeded
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Extract IP address from request
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const ipKey = String(ip);
    const now = Date.now();

    let record = ipRequestMap.get(ipKey);

    // If no record exists or the time window has expired, reset/create new window
    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      ipRequestMap.set(ipKey, record);
      
      // Set rate limit headers
      res.setHeader("X-RateLimit-Limit", options.max);
      res.setHeader("X-RateLimit-Remaining", options.max - 1);
      res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));
      return next();
    }

    // If rate limit is exceeded, return 429 Too Many Requests
    if (record.count >= options.max) {
      res.setHeader("X-RateLimit-Limit", options.max);
      res.setHeader("X-RateLimit-Remaining", 0);
      res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));
      return res.status(429).json({ error: options.message });
    }

    // Increment request count
    record.count++;
    res.setHeader("X-RateLimit-Limit", options.max);
    res.setHeader("X-RateLimit-Remaining", options.max - record.count);
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));
    next();
  };
}
