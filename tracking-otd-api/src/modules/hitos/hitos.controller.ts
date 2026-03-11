import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { HitosService } from './hitos.service';

@ApiTags('hitos')
@ApiBearerAuth('azure-ad-b2c')
@UseGuards(JwtAuthGuard)
@Controller('v1/hitos')
export class HitosController {
  constructor(private service: HitosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar hitos con subetapas' })
  findAll() { return this.service.findAll(); }

  @Get('grupos-paralelos')
  @ApiOperation({ summary: 'Listar grupos paralelos' })
  findGrupos() { return this.service.findGrupos(); }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de hito' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  @Roles('administrador')
  @ApiOperation({ summary: 'Crear hito [solo admin]' })
  create(@Body() dto: any) { return this.service.create(dto); }

  @Patch(':id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Actualizar hito [solo admin]' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.update(id, dto); }

  @Patch(':id/toggle')
  @Roles('administrador')
  @ApiOperation({ summary: 'Activar/desactivar hito [solo admin]' })
  toggle(@Param('id', ParseIntPipe) id: number) { return this.service.toggle(id); }

  @Get(':hitoId/subetapas')
  @ApiOperation({ summary: 'Subetapas del hito' })
  findSubetapas(@Param('hitoId', ParseIntPipe) hitoId: number) { return this.service.findSubetapasByHito(hitoId); }

  @Post(':hitoId/subetapas')
  @Roles('administrador')
  @ApiOperation({ summary: 'Crear subetapa [solo admin]' })
  createSubetapa(@Param('hitoId', ParseIntPipe) hitoId: number, @Body() dto: any) {
    return this.service.createSubetapa(hitoId, dto);
  }

  @Patch('subetapas/:id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Actualizar subetapa [solo admin]' })
  updateSubetapa(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.updateSubetapa(id, dto); }

  @Patch('subetapas/:id/toggle')
  @Roles('administrador')
  @ApiOperation({ summary: 'Toggle subetapa [solo admin]' })
  toggleSubetapa(@Param('id', ParseIntPipe) id: number) { return this.service.toggleSubetapa(id); }

  @Post('subetapas/:id/config')
  @Roles('administrador')
  @ApiOperation({ summary: 'Agregar config de subetapa [solo admin]' })
  addConfig(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.addSubetapaConfig(id, dto); }

  @Delete('subetapas/:id/config/:cid')
  @Roles('administrador')
  @ApiOperation({ summary: 'Eliminar config [solo admin]' })
  removeConfig(@Param('cid', ParseIntPipe) cid: number) { return this.service.removeSubetapaConfig(cid); }

  @Post('grupos-paralelos')
  @Roles('administrador')
  @ApiOperation({ summary: 'Crear grupo paralelo [solo admin]' })
  createGrupo(@Body() dto: any) { return this.service.createGrupo(dto); }

  @Patch('grupos-paralelos/:id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Actualizar grupo paralelo [solo admin]' })
  updateGrupo(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.updateGrupo(id, dto); }
}
