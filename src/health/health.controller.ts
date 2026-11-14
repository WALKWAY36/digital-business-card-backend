import { Controller, Get, Header } from '@nestjs/common';

interface HealthStatus {
  status: 'ok';
}

@Controller('health')
export class HealthController {
  @Get()
  @Header('Cache-Control', 'no-store')
  getHealth(): HealthStatus {
    return { status: 'ok' };
  }
}
