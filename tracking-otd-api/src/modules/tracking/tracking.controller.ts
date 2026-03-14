import { Controller, Get, Post, Patch, Param, Body, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TrackingService } from './tracking.service';
import { UpdateTrackingDto } from './dto/update-tracking.dto';

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

  @Get('vin/:vinId')
  @ApiOperation({ summary: 'Tracking completo del VIN' })
  getTracking(@Param('vinId') vinId: string) { return this.service.getTrackingVin(vinId); }

  @Patch('vin/:vinId/hito/:hitoId')
  @ApiOperation({ summary: 'Actualizar fechas de hito' })
  updateHito(
    @Param('vinId') vinId: string,
    @Param('hitoId', ParseIntPipe) hitoId: number,
    @Body() dto: UpdateTrackingDto,
  ) { return this.service.updateHitoTracking(vinId, hitoId, dto); }

  @Patch('vin/:vinId/subetapa/:subetapaId')
  @ApiOperation({ summary: 'Actualizar fechas de subetapa (incluye GAPs manuales)' })
  updateSubetapa(
    @Param('vinId') vinId: string,
    @Param('subetapaId', ParseIntPipe) subetapaId: number,
    @Body() dto: UpdateTrackingDto,
  ) { return this.service.updateSubetapaTracking(vinId, subetapaId, dto); }

  @Post('vin/:vinId/sync-staging')
  @ApiOperation({ summary: 'Propagar fechas de staging al tracking del VIN' })
  syncStaging(@Param('vinId') vinId: string) {
    return { message: 'Sync iniciado', vinId };
  }
}
