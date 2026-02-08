import pino, { Logger } from 'pino';

export function createLogger(serviceName: string): Logger {
  const logLevel = process.env.LOG_LEVEL || 'info';

  return pino({
    level: logLevel,
    base: {
      service: serviceName,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  });
}
