import * as winston from 'winston';

export class Logger {
  private static logger: winston.Logger;

  static initialize(): winston.Logger {
    if (!this.logger) {
      this.logger = winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.errors({ stack: true }),
          winston.format.json()
        ),
        defaultMeta: { service: 'e2e-test-platform' },
        transports: [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
          })
        ]
      });
    }
    return this.logger;
  }

  static getInstance(): winston.Logger {
    if (!this.logger) {
      this.initialize();
    }
    return this.logger;
  }

  static info(message: string, meta?: any): void {
    this.getInstance().info(message, meta);
  }

  static error(message: string, error?: Error | any): void {
    this.getInstance().error(message, error);
  }

  static debug(message: string, meta?: any): void {
    this.getInstance().debug(message, meta);
  }

  static warn(message: string, meta?: any): void {
    this.getInstance().warn(message, meta);
  }
}
