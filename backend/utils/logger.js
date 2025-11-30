/**
 * Logger Utility
 * Centralized logging for the application
 */

import { appConfig } from '../config/app.js';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class Logger {
  constructor() {
    this.isDevelopment = appConfig.isDevelopment;
  }

  formatTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, data = null) {
    const timestamp = this.formatTimestamp();
    const prefix = `[${timestamp}] [${level}]`;
    
    if (data) {
      return `${prefix} ${message}\n${JSON.stringify(data, null, 2)}`;
    }
    return `${prefix} ${message}`;
  }

  info(message, data = null) {
    const formatted = this.formatMessage('INFO', message, data);
    console.log(`${colors.cyan}${formatted}${colors.reset}`);
  }

  error(message, error = null) {
    const formatted = this.formatMessage('ERROR', message, error);
    console.error(`${colors.red}${formatted}${colors.reset}`);
    
    if (error && error.stack) {
      console.error(`${colors.red}${error.stack}${colors.reset}`);
    }
  }

  warn(message, data = null) {
    const formatted = this.formatMessage('WARN', message, data);
    console.warn(`${colors.yellow}${formatted}${colors.reset}`);
  }

  success(message, data = null) {
    const formatted = this.formatMessage('SUCCESS', message, data);
    console.log(`${colors.green}${formatted}${colors.reset}`);
  }

  debug(message, data = null) {
    if (this.isDevelopment) {
      const formatted = this.formatMessage('DEBUG', message, data);
      console.log(`${colors.magenta}${formatted}${colors.reset}`);
    }
  }

  request(req) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('User-Agent') || 'Unknown';
    this.info(`${method} ${originalUrl}`, { ip, userAgent });
  }
}

export const logger = new Logger();
export default logger;

