import fs from 'fs';
import path from 'path';

class EmailLogger {
  private logFilePath: string;

  constructor() {
    this.logFilePath = path.join(process.cwd(), 'email-debug.log');
  }

  private writeLog(level: 'INFO' | 'WARN' | 'ERROR', context: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    let dataStr = '';
    
    if (data) {
      if (data instanceof Error) {
        dataStr = `\n  Error Name: ${data.name}\n  Error Message: ${data.message}\n  Stack: ${data.stack}`;
      } else {
        try {
          dataStr = `\n  Data: ${JSON.stringify(data, null, 2)}`;
        } catch (e) {
          dataStr = `\n  Data: [Object cannot be stringified]`;
        }
      }
    }

    const logEntry = `[${timestamp}] [${level}] [${context}] ${message}${dataStr}\n`;
    
    // Log to console with colors
    const colors = {
      INFO: '\x1b[36m', // Cyan
      WARN: '\x1b[33m', // Yellow
      ERROR: '\x1b[31m', // Red
      RESET: '\x1b[0m'
    };

    console.log(`${colors[level]}[${timestamp}] [${level}] [${context}] ${message}${colors.RESET}`);
    if (dataStr) {
      console.log(colors[level] + dataStr + colors.RESET);
    }

    // Try to append to file
    try {
      fs.appendFileSync(this.logFilePath, logEntry);
    } catch (e) {
      console.warn('Cannot write to email-debug.log', e);
    }
  }

  info(context: string, message: string, data?: any) {
    this.writeLog('INFO', context, message, data);
  }

  warn(context: string, message: string, data?: any) {
    this.writeLog('WARN', context, message, data);
  }

  error(context: string, message: string, data?: any) {
    this.writeLog('ERROR', context, message, data);
  }
}

export const emailLogger = new EmailLogger();
