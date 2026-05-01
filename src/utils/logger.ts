import winston from "winston";
import path from "path";

const { combine, timestamp, printf, colorize, errors } = winston.format;

// ─── Custom Format ────────────────────────────────────────────────────────────

const customFormat = printf(({ level, message, timestamp: ts, stack }) => {
  const base = `[${ts}] [${level.toUpperCase()}]: ${message}`;
  return stack ? `${base}\n${stack}` : base;
});

// ─── Logger Instance ──────────────────────────────────────────────────────────

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    customFormat
  ),
  transports: [
    // Console output with colors
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        errors({ stack: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        customFormat
      ),
    }),
    // Error log file
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join("logs", "combined.log"),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join("logs", "exceptions.log"),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join("logs", "rejections.log"),
    }),
  ],
});

// ─── Helper Functions ─────────────────────────────────────────────────────────

export const log = {
  info: (message: string, ...meta: unknown[]) =>
    logger.info(message, ...meta),
  warn: (message: string, ...meta: unknown[]) =>
    logger.warn(message, ...meta),
  error: (message: string, error?: Error) =>
    logger.error(message, { stack: error?.stack }),
  debug: (message: string, ...meta: unknown[]) =>
    logger.debug(message, ...meta),
  command: (userId: string, command: string, guild?: string) =>
    logger.info(`[CMD] User ${userId} ran /${command} in guild ${guild ?? "DM"}`),
};