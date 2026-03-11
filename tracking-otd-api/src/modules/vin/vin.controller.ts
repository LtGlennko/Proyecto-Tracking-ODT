import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VinService } from './vin.service';
import { CreateVinDto } from './dto/create-vin.dto';
import { UpdateVinDto } from './dto/update-vin.dto';
import { FilterVinDto } from './dto/filter-vin.dto';

@ApiTags('vin')
@ApiBearerAuth('azure-ad-b2c')
@UseGuards(JwtAuthGuard)
@Controller('v1/vin')
export class VinController {
  constructor(private service: VinService) {}

  @Get()
  @ApiOperation({ summary: 'Listar VINs con filtros' })
  findAll(@Query() filters: FilterVinDto) { return this.service.findAll(filters); }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle completo del VIN' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @ApiOperation({ summary: 'Crear VIN' })
  create(@Body() dto: CreateVinDto) { return this.service.create(dto); }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar VIN' })
  update(@Param('id') id: string, @Body() dto: UpdateVinDto) {
    return this.service.update(id, dto);
  }
}
