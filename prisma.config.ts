import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { createMigrationDatabaseUrl } from './src/config/database.config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: createMigrationDatabaseUrl(process.env),
  },
});
