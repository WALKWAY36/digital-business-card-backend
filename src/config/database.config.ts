import { z } from 'zod';

export const databaseEnvironmentSchema = z.object({
  POSTGRES_HOST: z.string().trim().min(1),
  POSTGRES_PORT: z.coerce.number().int().min(1).max(65535),
  POSTGRES_DB: z.string().trim().min(1),
  POSTGRES_USER: z.string().trim().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
});

export function createDatabaseUrl(
  environment: Record<string, unknown>,
): string {
  const config = databaseEnvironmentSchema.parse(environment);

  const user = encodeURIComponent(config.POSTGRES_USER);
  const password = encodeURIComponent(config.POSTGRES_PASSWORD);
  const database = encodeURIComponent(config.POSTGRES_DB);

  return (
    `postgresql://${user}:${password}` +
    `@${config.POSTGRES_HOST}:${config.POSTGRES_PORT}/${database}`
  );
}
