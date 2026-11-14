import { randomUUID } from 'node:crypto';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import type { Environment } from '../config/env.schema';

interface SerializedRequest {
  id: string | number;
  method: string;
  url: string;
}

interface SerializedResponse {
  statusCode: number;
}

@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Environment>) => ({
        pinoHttp: {
          level: config.getOrThrow<string>('LOG_LEVEL'),

          genReqId: (_request, response) => {
            const requestId = randomUUID();

            response.setHeader('X-Request-ID', requestId);

            return requestId;
          },

          customLogLevel: (_request, response, error) => {
            if (error || response.statusCode >= 500) {
              return 'error';
            }

            if (response.statusCode >= 400) {
              return 'warn';
            }

            return 'info';
          },

          serializers: {
            req: (request: SerializedRequest) => ({
              id: request.id,
              method: request.method,
              url: request.url.split('?')[0],
            }),
            res: (response: SerializedResponse) => ({
              statusCode: response.statusCode,
            }),
          },

          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'res.headers["set-cookie"]',
              'password',
              'token',
              'accessToken',
              'refreshToken',
              'user.password',
            ],
            censor: '[REDACTED]',
          },
        },
      }),
    }),
  ],
})
export class LoggingModule {}
