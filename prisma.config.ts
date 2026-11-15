import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { createDatabaseUrl } from './src/config/database.config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: createDatabaseUrl(process.env),
  },
});
