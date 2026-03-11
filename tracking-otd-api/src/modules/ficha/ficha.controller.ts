import { Controller, Get, Post, Patch, Param, Body, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FichaService } from './ficha.service';
import { CreateFichaDto } from './dto/create-ficha.dto';
import { UpdateFichaDto } from './dto/update-ficha.dto';
import { FilterFichaDto } from './dto/filter-ficha.dto';

@ApiTags('ficha')
@ApiBearerAuth('azure-ad-b2c')
@UseGuards(JwtAuthGuard)
@Controller('v1/ficha')
export class FichaController {
  constructor(private service: FichaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar fichas con filtros' })
  findAll(@Query() filters: FilterFichaDto) { return this.service.findAll(filters); }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de ficha con VINs' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  @ApiOperation({ summary: 'Crear ficha' })
  create(@Body() dto: CreateFichaDto) { return this.service.create(dto); }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar ficha' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFichaDto) {
    return this.service.update(id, dto);
  }
}
