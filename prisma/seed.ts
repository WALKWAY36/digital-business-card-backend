import 'dotenv/config';
import pino from 'pino';
import { z } from 'zod';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '../src/generated/prisma/client';
import { seedData } from './seed-data';
import { seedSchema } from './seed.schema';
import { createMigrationDatabaseUrl } from '../src/config/database.config';

const logger = pino({ name: 'database-seed' });

async function main(): Promise<void> {
  const data = seedSchema.parse(seedData);

  const connectionString = createMigrationDatabaseUrl(process.env);
  const { SEED_TRANSACTION_TIMEOUT_MS: transactionTimeoutMs } = z
    .object({
      SEED_TRANSACTION_TIMEOUT_MS: z.coerce
        .number()
        .int()
        .min(1000)
        .max(300000)
        .default(60000),
    })
    .parse(process.env);

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      connectionTimeoutMillis: 3000,
      max: 1,
    }),
  });

  try {
    await prisma.$transaction(
      async (tx) => {
        const profileId = data.profile.id;

        await tx.profile.upsert({
          where: { id: profileId },
          create: data.profile,
          update: data.profile,
        });

        for (const item of data.links) {
          const record = { ...item, profileId };

          await tx.profileLink.upsert({
            where: { id: item.id },
            create: record,
            update: record,
          });
        }

        for (const item of data.skills) {
          const record = { ...item, profileId };

          await tx.skill.upsert({
            where: { id: item.id },
            create: record,
            update: record,
          });
        }

        for (const item of data.experience) {
          const record = { ...item, profileId };

          await tx.experience.upsert({
            where: { id: item.id },
            create: record,
            update: record,
          });
        }

        for (const item of data.projects) {
          const record = { ...item, profileId };

          await tx.project.upsert({
            where: { id: item.id },
            create: record,
            update: record,
          });
        }

        for (const item of data.education) {
          const record = { ...item, profileId };

          await tx.education.upsert({
            where: { id: item.id },
            create: record,
            update: record,
          });
        }

        await tx.profileLink.deleteMany({
          where: {
            profileId,
            id: { notIn: data.links.map((item) => item.id) },
          },
        });

        await tx.skill.deleteMany({
          where: {
            profileId,
            id: { notIn: data.skills.map((item) => item.id) },
          },
        });

        await tx.experience.deleteMany({
          where: {
            profileId,
            id: { notIn: data.experience.map((item) => item.id) },
          },
        });

        await tx.project.deleteMany({
          where: {
            profileId,
            id: { notIn: data.projects.map((item) => item.id) },
          },
        });

        await tx.education.deleteMany({
          where: {
            profileId,
            id: { notIn: data.education.map((item) => item.id) },
          },
        });
      },
      { maxWait: 5000, timeout: transactionTimeoutMs },
    );

    logger.info({ profileId: data.profile.id }, 'Seed completed');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  if (error instanceof z.ZodError) {
    logger.error(
      {
        issues: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
      'Seed validation failed',
    );
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error(
      {
        errorType: error.name,
        code: error.code,
        clientVersion: error.clientVersion,
        message: error.message,
      },
      'Seed failed; database changes were not confirmed',
    );
  } else {
    logger.error(
      {
        errorType: error instanceof Error ? error.name : 'Unknown',
      },
      'Seed failed; database changes were not confirmed',
    );
  }

  process.exitCode = 1;
});
