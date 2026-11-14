import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Environment } from './config/env.schema';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService<Environment>);

  const port = config.getOrThrow<number>('PORT');
  const host = config.getOrThrow<string>('HOST');

  app.enableShutdownHooks();

  await app.listen(port, host);
}
void bootstrap();
