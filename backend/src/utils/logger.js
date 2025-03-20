const { createLogger, format, transports } = require("winston");
const { NODE_ENV } = require("../config/env");

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Create logger instance
const logger = createLogger({
  level: NODE_ENV === "development" ? "debug" : "info",
  format: logFormat,
  defaultMeta: { service: "healthstack-api" },
  transports: [
    // Write all logs to console
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
          }`;
        })
      ),
    }),
  ],
});

// Add file transport in production
if (NODE_ENV === "production") {
  logger.add(
    new transports.File({ filename: "logs/error.log", level: "error" })
  );
  logger.add(new transports.File({ filename: "logs/combined.log" }));
}

module.exports = logger;
