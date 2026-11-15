import { z } from 'zod';
import {
  createDatabaseUrl,
  databaseEnvironmentSchema,
} from './database.config';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  HOST: z.string().trim().min(1),
  PORT: z.coerce.number().int().min(1).max(65535),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  ...databaseEnvironmentSchema.shape,
});

export type Environment = z.infer<typeof envSchema> & {
  DATABASE_URL: string;
};

export function validateEnvironment(
  config: Record<string, unknown>,
): Environment {
  const result = envSchema.safeParse(config);

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
