import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import pino from 'pino';
import { AppModule } from '../app.module';
import { ProfileService } from '../profile/profile.service';

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true,
    abortOnError: false,
  });

  try {
    const logger = app.get(Logger);

    app.useLogger(logger);

    const profileService = app.get(ProfileService);
    const profile = await profileService.getPublicProfile();

    logger.log(
      {
        channel: 'app',
        profile,
      },
      'ProfilePreview',
    );
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  const logger = pino({ name: 'profile-preview' });

  logger.error(
    {
      errorType: error instanceof Error ? error.name : 'Unknown',
    },
    'Profile preview failed',
  );

  process.exitCode = 1;
});
