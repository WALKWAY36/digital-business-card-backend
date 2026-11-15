import { z } from 'zod';

export const databaseEnvironmentSchema = z.object({
  POSTGRES_HOST: z.string().trim().min(1),
  POSTGRES_PORT: z.coerce.number().int().min(1).max(65535),
  POSTGRES_DB: z.string().trim().min(1),
  POSTGRES_USER: z.string().trim().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
});

export const databaseUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => {
      try {
        const url = new URL(value);

        return (
          ['postgresql:', 'postgres:'].includes(url.protocol) &&
          url.hostname.length > 0 &&
          url.pathname.length > 1
        );
      } catch {
        return false;
      }
    },
    { message: 'Expected a PostgreSQL connection URL with a database name' },
  );

export function createDatabaseUrl(
  environment: Record<string, unknown>,
): string {
  if (environment.DATABASE_URL !== undefined) {
    const result = databaseUrlSchema.safeParse(environment.DATABASE_URL);

    if (!result.success) {
      throw new Error('Invalid environment configuration: DATABASE_URL');
    }

    return result.data;
  }

  const result = databaseEnvironmentSchema.safeParse(environment);

  if (!result.success) {
    const fields = result.error.issues
      .map((issue) => issue.path.join('.'))
      .join(', ');

    throw new Error(`Invalid database environment configuration: ${fields}`);
  }

  const config = result.data;
  const user = encodeURIComponent(config.POSTGRES_USER);
  const password = encodeURIComponent(config.POSTGRES_PASSWORD);
  const database = encodeURIComponent(config.POSTGRES_DB);

  return (
    `postgresql://${user}:${password}` +
    `@${config.POSTGRES_HOST}:${config.POSTGRES_PORT}/${database}`
  );
}

export function createMigrationDatabaseUrl(
  environment: Record<string, unknown>,
): string {
  return createDatabaseUrl({
    ...environment,
    DATABASE_URL: environment.DATABASE_URL_UNPOOLED ?? environment.DATABASE_URL,
  });
}
