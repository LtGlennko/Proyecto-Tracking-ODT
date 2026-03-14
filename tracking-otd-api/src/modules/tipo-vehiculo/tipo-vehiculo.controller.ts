import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoVehiculoService } from './tipo-vehiculo.service';

@ApiTags('tipo-vehiculo')
@ApiBearerAuth('azure-ad-b2c')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/tipo-vehiculo')
export class TipoVehiculoController {
  constructor(private service: TipoVehiculoService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tipos de vehículo activos' })
  findAll() { return this.service.findAll(); }

  @Get('all')
  @ApiOperation({ summary: 'Listar todos los tipos de vehículo (incluyendo inactivos)' })
  findAllIncludeInactive() { return this.service.findAllIncludeInactive(); }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de tipo de vehículo' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  @Roles('superadministrador')
  @ApiOperation({ summary: 'Crear tipo de vehículo [solo superadmin]' })
  create(@Body() dto: any) { return this.service.create(dto); }

  @Patch(':id')
  @Roles('superadministrador')
  @ApiOperation({ summary: 'Actualizar tipo de vehículo [solo superadmin]' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.update(id, dto); }
}
