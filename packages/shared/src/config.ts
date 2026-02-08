import { z } from 'zod';

const configSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_POOL_SIZE: z.coerce.number().default(20),

  // Redis
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  // Auth
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.coerce.number().default(86400),

  // API
  API_PORT: z.coerce.number().default(4200),
  API_HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // CORS
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:3001,http://localhost:3002')
    .transform((val) => val.split(',')),

  // AWS S3
  BUCKET_NAME: z.string().optional(),
  BUCKET_REGION: z.string().optional(),
  BUCKET_ACCESS_KEY: z.string().optional(),
  BUCKET_SECRET_KEY: z.string().optional(),
  BUCKET_URL: z.string().optional(),

  // Monitoring
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_REPO_OWNER: z.string().default('Synpathub'),
  GITHUB_REPO_NAME: z.string().default('PatenTrack2'),

  // Sentry
  SENTRY_DSN: z.string().optional(),

  // External APIs
  EPO_CLIENT_KEY: z.string().optional(),
  EPO_CLIENT_SECRET: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
});

export type Config = z.infer<typeof configSchema>;

let cachedConfig: Config | null = null;

export function loadConfig(): Config {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    cachedConfig = configSchema.parse(process.env);
    return cachedConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      throw new Error(
        `Configuration validation failed:\n${messages.join('\n')}\n\nPlease check your environment variables.`,
      );
    }
    throw error;
  }
}

export function getConfig(): Config {
  if (!cachedConfig) {
    throw new Error('Config not loaded. Call loadConfig() first.');
  }
  return cachedConfig;
}
