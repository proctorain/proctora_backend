import winston from "winston";
import { NODE_ENV } from "./env.js";

const isDev = NODE_ENV !== "production";

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  isDev ? winston.format.colorize() : winston.format.uncolorize(),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta) : ""
    }`;
  }),
);

const logger = winston.createLogger({
  level: isDev ? "debug" : "info",
  format: logFormat,
  transports: [
    new winston.transports.Console(),

    // Save only errors to file
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),

    // Save all logs
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

export default logger;
