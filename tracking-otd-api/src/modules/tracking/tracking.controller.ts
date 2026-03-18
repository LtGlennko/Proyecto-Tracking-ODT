import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TrackingService } from './tracking.service';

@ApiTags('tracking')
@ApiBearerAuth('azure-ad-b2c')
@UseGuards(JwtAuthGuard)
@Controller('v1/tracking')
export class TrackingController {
  constructor(private service: TrackingService) {}

  @Get('clientes')
  @ApiOperation({ summary: 'Jerarquía Cliente → Ficha → VIN con tracking' })
  @ApiQuery({ name: 'empresaId', required: false })
  @ApiQuery({ name: 'estado', required: false })
  @ApiQuery({ name: 'tipoVehiculoId', required: false })
  @ApiQuery({ name: 'busqueda', required: false })
  getClientesHierarchy(
    @Query('empresaId') empresaId?: string,
    @Query('estado') estado?: string,
    @Query('tipoVehiculoId') tipoVehiculoId?: string,
    @Query('busqueda') busqueda?: string,
  ) {
    return this.service.getClientesHierarchy({
      empresaId: empresaId ? +empresaId : undefined,
      estado,
      tipoVehiculoId: tipoVehiculoId ? +tipoVehiculoId : undefined,
      busqueda,
    });
  }
}
