import { Controller, Get, Post, Patch, Param, Body, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AlertasService } from './alertas.service';
import { FilterAlertasDto } from './dto/filter-alertas.dto';
import { UpdateEstadoAlertaDto } from './dto/update-estado-alerta.dto';
import { CreateAccionDto } from './dto/create-accion.dto';

@ApiTags('alertas')
@ApiBearerAuth('azure-ad-b2c')
@UseGuards(JwtAuthGuard)
@Controller('v1/alertas')
export class AlertasController {
  constructor(private service: AlertasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar alertas con filtros' })
  findAll(@Query() filters: FilterAlertasDto) { return this.service.findAll(filters); }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de alerta con historial de acciones' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Actualizar estado de alerta' })
  updateEstado(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEstadoAlertaDto) {
    return this.service.updateEstado(id, dto);
  }

  @Post(':id/accion')
  @ApiOperation({ summary: 'Registrar acción sobre alerta' })
  createAccion(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateAccionDto, @CurrentUser() user: any) {
    return this.service.createAccion(id, dto, user?.id);
  }
}
