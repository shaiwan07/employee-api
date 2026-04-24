const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

const { combine, timestamp, printf, colorize, errors, json, splat } = format;

const isDev = process.env.NODE_ENV !== 'production';

// Human-readable format for console
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  splat(),
  printf(({ timestamp, level, message, stack, ...meta }) => {
    const extra = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
    return `[${timestamp}] ${level}: ${stack || message}${extra}`;
  })
);

// Structured JSON format for log files
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  splat(),
  json()
);

const logger = createLogger({
  level: isDev ? 'debug' : 'info',
  transports: [
    // Console — always on
    new transports.Console({ format: consoleFormat }),

    // Rotating daily error log
    new transports.DailyRotateFile({
      filename: path.join('logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: fileFormat,
      maxFiles: '30d',
      zippedArchive: true,
    }),

    // Rotating daily combined log (all levels)
    new transports.DailyRotateFile({
      filename: path.join('logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: fileFormat,
      maxFiles: '14d',
      zippedArchive: true,
    }),
  ],
});

// Morgan-compatible stream so HTTP logs go through Winston
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

module.exports = logger;
