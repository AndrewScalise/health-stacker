// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const path = require("path");
const { API_PREFIX, NODE_ENV } = require("./config/env");
const errorHandler = require("./middleware/error");
const logger = require("./utils/logger");

// Initialize express app
const app = express();

// Security Middleware
app.use(helmet()); // Set security headers
app.use(compression()); // Compress responses

// Enable CORS
app.use(
  cors({
    origin: NODE_ENV === "production" ? process.env.CORS_ORIGIN : true,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Dev logging middleware
if (NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      skip: (req, res) => res.statusCode < 400,
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );
}

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again after 15 minutes",
  },
});

// Apply rate limiting to API routes
app.use(`${API_PREFIX}`, apiLimiter);

// More strict rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 auth requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many authentication attempts, please try again after an hour",
  },
});

// Import route files
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const habitRoutes = require("./routes/habit.routes");
const checkinRoutes = require("./routes/checkin.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const subscriptionRoutes = require("./routes/subscription.routes");
const accountabilityRoutes = require("./routes/accountability.routes");

// Mount routers
app.use(`${API_PREFIX}/auth`, authLimiter, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/habits`, habitRoutes);
app.use(`${API_PREFIX}/checkins`, checkinRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
app.use(`${API_PREFIX}/subscription`, subscriptionRoutes);
app.use(`${API_PREFIX}/accountability`, accountabilityRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "HealthStack API is running" });
});

// Serve static assets if in production
if (NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("public"));

  // Any route that doesn't match API will serve the index.html
  app.get("*", (req, res) => {
    if (!req.url.startsWith(API_PREFIX)) {
      res.sendFile(path.resolve(__dirname, "../public", "index.html"));
    }
  });
}

// Error handling middleware (must be after routes)
app.use(errorHandler);

// Handle unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.originalUrl}`,
  });
});

module.exports = app;
