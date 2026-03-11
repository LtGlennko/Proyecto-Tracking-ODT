import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SlaService } from './sla.service';
import { CreateSlaDto } from './dto/create-sla.dto';
import { ResolveSlaDto } from './dto/resolve-sla.dto';

@ApiTags('sla')
@ApiBearerAuth('azure-ad-b2c')
@UseGuards(JwtAuthGuard)
@Controller('v1/sla')
export class SlaController {
  constructor(private service: SlaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar reglas SLA' })
  findAll(@Query() filters: any) { return this.service.findAll(filters); }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de regla SLA (incluye diasCritico calculado)' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  @Roles('administrador')
  @ApiOperation({ summary: 'Crear regla SLA [solo admin]' })
  create(@Body() dto: CreateSlaDto) { return this.service.create(dto); }

  @Patch(':id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Actualizar regla SLA [solo admin]' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateSlaDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Eliminar regla SLA [solo admin]' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }

  @Post('resolve')
  @ApiOperation({ summary: 'Resolver la regla SLA más específica para un contexto dado' })
  resolve(@Body() dto: ResolveSlaDto) { return this.service.resolve(dto); }
}
