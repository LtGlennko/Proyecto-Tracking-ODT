import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check completo' })
  check() {
    return { status: 'ok', timestamp: new Date().toISOString(), service: 'tracking-otd-api' };
  }

  @Public()
  @Get('liveness')
  @ApiOperation({ summary: 'Liveness probe para Docker/K8s' })
  liveness() {
    return { status: 'alive' };
  }
}
