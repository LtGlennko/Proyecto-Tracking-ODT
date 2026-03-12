import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { HitosService } from './hitos.service';

@ApiTags('hitos')
@ApiBearerAuth('azure-ad-b2c')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/hitos')
export class HitosController {
  constructor(private service: HitosService) {}

  // ── Master catalog ──

  @Get()
  @ApiOperation({ summary: 'Listar hitos maestros con subetapas' })
  findAll() { return this.service.findAllHitos(); }

  @Get('grupos-paralelos')
  @ApiOperation({ summary: 'Listar grupos paralelos' })
  findGrupos() { return this.service.findGrupos(); }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de hito maestro' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOneHito(id); }

  @Post()
  @Roles('superadministrador')
  @ApiOperation({ summary: 'Crear hito [solo superadmin]' })
  create(@Body() dto: any) { return this.service.createHito(dto); }

  @Patch(':id')
  @Roles('superadministrador')
  @ApiOperation({ summary: 'Actualizar hito maestro [solo superadmin]' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.updateHito(id, dto); }

  @Post(':hitoId/subetapas')
  @Roles('superadministrador')
  @ApiOperation({ summary: 'Crear subetapa [solo superadmin]' })
  createSubetapa(@Param('hitoId', ParseIntPipe) hitoId: number, @Body() dto: any) {
    return this.service.createSubetapa(hitoId, dto);
  }

  @Patch('subetapas/:id')
  @Roles('superadministrador')
  @ApiOperation({ summary: 'Actualizar subetapa maestro [solo superadmin]' })
  updateSubetapa(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.service.updateSubetapa(id, dto);
  }

  // ── Config por tipo de vehículo ──

  @Get('config/:tipoVehiculo')
  @ApiOperation({ summary: 'Obtener config de hitos para un tipo de vehículo' })
  getConfig(@Param('tipoVehiculo') tipoVehiculo: string) {
    return this.service.getConfigByTipoVehiculo(tipoVehiculo);
  }

  @Patch('config/:tipoVehiculo/hito/:hitoId')
  @Roles('superadministrador')
  @ApiOperation({ summary: 'Actualizar config de hito por tipo de vehículo [solo superadmin]' })
  upsertHitoConfig(
    @Param('tipoVehiculo') tipoVehiculo: string,
    @Param('hitoId', ParseIntPipe) hitoId: number,
    @Body() dto: any,
  ) {
    return this.service.upsertHitoConfig(tipoVehiculo, hitoId, dto);
  }

  @Patch('config/:tipoVehiculo/subetapa/:subetapaId')
  @Roles('superadministrador')
  @ApiOperation({ summary: 'Actualizar config de subetapa por tipo de vehículo [solo superadmin]' })
  upsertSubetapaConfig(
    @Param('tipoVehiculo') tipoVehiculo: string,
    @Param('subetapaId', ParseIntPipe) subetapaId: number,
    @Body() dto: any,
  ) {
    return this.service.upsertSubetapaConfig(tipoVehiculo, subetapaId, dto);
  }

  // ── Grupos paralelos ──

  @Post('grupos-paralelos')
  @Roles('superadministrador')
  @ApiOperation({ summary: 'Crear grupo paralelo [solo superadmin]' })
  createGrupo(@Body() dto: any) { return this.service.createGrupo(dto); }

  @Patch('grupos-paralelos/:id')
  @Roles('superadministrador')
  @ApiOperation({ summary: 'Actualizar grupo paralelo [solo superadmin]' })
  updateGrupo(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.updateGrupo(id, dto); }
}
