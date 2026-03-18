import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MapeoCamposVinService } from './mapeo-campos-vin.service';

@ApiTags('mapeo-campos-vin')
@ApiBearerAuth('azure-ad-b2c')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/mapeo-campos-vin')
export class MapeoCamposVinController {
  constructor(private service: MapeoCamposVinService) {}

  @Get('staging-columns')
  @ApiOperation({ summary: 'Listar columnas de staging_vin con tipo de dato' })
  getStagingColumns() { return this.service.getStagingColumns(); }

  @Get('grouped')
  @ApiOperation({ summary: 'Mapeos agrupados por campo destino' })
  findGrouped() { return this.service.findGrouped(); }

  @Get()
  @ApiOperation({ summary: 'Listar todos los mapeos' })
  findAll(@Query('nombreCampo') nombreCampo?: string) { return this.service.findAll(nombreCampo); }

  @Post()
  @Roles('administrador')
  @ApiOperation({ summary: 'Crear mapeo de campo [solo admin]' })
  create(@Body() dto: any) { return this.service.create(dto); }

  @Patch(':id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Actualizar mapeo de campo [solo admin]' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.update(id, dto); }

  @Delete(':id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Eliminar mapeo de campo [solo admin]' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }

  @Post('reorder')
  @Roles('administrador')
  @ApiOperation({ summary: 'Reordenar prioridades de mapeos por campo [solo admin]' })
  reorder(@Body() body: { nombreCampo: string; orderedIds: number[] }) {
    return this.service.reorder(body.nombreCampo, body.orderedIds);
  }
}
