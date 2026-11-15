import { z } from 'zod';
import { createDatabaseUrl, databaseUrlSchema } from './database.config';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  HOST: z.string().trim().min(1),
  PORT: z.coerce.number().int().min(1).max(65535),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  DATABASE_URL: databaseUrlSchema,
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).max(3600000),
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(10000),
});

export type Environment = z.infer<typeof envSchema>;

export function validateEnvironment(
  config: Record<string, unknown>,
): Environment {
  const result = envSchema.safeParse({
    ...config,
    DATABASE_URL: createDatabaseUrl(config),
  });

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return {
    ...result.data,
    DATABASE_URL: createDatabaseUrl(result.data),
  };
}
