import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FuentesVinService } from './fuentes-vin.service';

@ApiTags('fuentes-vin')
@ApiBearerAuth('azure-ad-b2c')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/fuentes-vin')
export class FuentesVinController {
  constructor(private service: FuentesVinService) {}

  @Get()
  @ApiOperation({ summary: 'Listar fuentes de datos VIN' })
  findAll() { return this.service.findAll(); }

  @Post()
  @Roles('administrador')
  @ApiOperation({ summary: 'Crear fuente de datos [solo admin]' })
  create(@Body() dto: any) { return this.service.create(dto); }

  @Patch(':id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Actualizar fuente de datos [solo admin]' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.update(id, dto); }

  @Delete(':id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Eliminar fuente de datos [solo admin]' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
