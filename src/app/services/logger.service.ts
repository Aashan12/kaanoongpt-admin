type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class LoggerService {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message), data);
    }
  }

  info(message: string, data?: any) {
    console.info(this.formatMessage('info', message), data);
  }

  warn(message: string, data?: any) {
    console.warn(this.formatMessage('warn', message), data);
  }

  error(message: string, error?: any) {
    console.error(this.formatMessage('error', message), error);
  }
}

export const logger = new LoggerService();