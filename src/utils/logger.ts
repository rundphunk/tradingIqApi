<<<<<<< HEAD
import dotenv from 'dotenv'; // Import dotenv
import { createLogger, format, transports } from 'winston'; // Import winston

dotenv.config(); // Load environment variables

const logToConsole = process.env.LOG_TO_CONSOLE === 'true'; // Flag to control console logging

console.log('Logger configuration:', { logToConsole }); // Add this line to confirm configuration

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: logToConsole ? [new transports.Console()] : []
});


export const logInfo = (message: string) => {
  if (logToConsole) logger.info(message);
};

export const logError = (message: string) => {
  if (logToConsole) logger.error(message);
};

export const logVerbose = (message: string) => {
  if (logToConsole) logger.verbose(message);
};

export const logWarning = (message: string) => {
  if (logToConsole) logger.warn(message);
};

export const logRequestProcessingTime = (requestTime: Date, responseTime: Date) => {
  const processingTime = responseTime.getTime() - requestTime.getTime();
  const message = `Request received at ${requestTime.toISOString()} and processed in ${processingTime} ms`;
  if (logToConsole) logger.info(message);
};

export const withRequestLogging = (handler: (req: Request, res: Response) => Promise<void>) => {
  return async (req: Request, res: Response) => {
    const requestTime = new Date();
    try {
      await handler(req, res);
    } finally {
      const responseTime = new Date();
      logRequestProcessingTime(requestTime, responseTime);
    }
  };
};
=======
import dotenv from 'dotenv'; // Import dotenv
import { createLogger, format, transports } from 'winston'; // Import winston

dotenv.config(); // Load environment variables

const logToConsole = process.env.LOG_TO_CONSOLE === 'true'; // Flag to control console logging

console.log('Logger configuration:', { logToConsole }); // Add this line to confirm configuration

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: logToConsole ? [new transports.Console()] : []
});


export const logInfo = (message: string) => {
  if (logToConsole) logger.info(message);
};

export const logError = (message: string) => {
  if (logToConsole) logger.error(message);
};

export const logVerbose = (message: string) => {
  if (logToConsole) logger.verbose(message);
};

export const logWarning = (message: string) => {
  if (logToConsole) logger.warn(message);
};

export const logRequestProcessingTime = (requestTime: Date, responseTime: Date) => {
  const processingTime = responseTime.getTime() - requestTime.getTime();
  const message = `Request received at ${requestTime.toISOString()} and processed in ${processingTime} ms`;
  if (logToConsole) logger.info(message);
};

export const withRequestLogging = (handler: (req: Request, res: Response) => Promise<void>) => {
  return async (req: Request, res: Response) => {
    const requestTime = new Date();
    try {
      await handler(req, res);
    } finally {
      const responseTime = new Date();
      logRequestProcessingTime(requestTime, responseTime);
    }
  };
};
>>>>>>> a34b550ff69e15b298aff73a6573db3d2f9b064e
