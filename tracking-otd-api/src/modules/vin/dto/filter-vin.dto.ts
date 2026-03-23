import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterVinDto extends PaginationDto {
  @ApiPropertyOptional({ example: 1, description: 'Filtrar por tipo de vehículo (ID)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tipoVehiculoId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  empresaId?: number;

  @ApiPropertyOptional({ enum: ['A TIEMPO', 'DEMORADO', 'ENTREGADO'] })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({ description: 'Buscar por VIN, modelo, cliente o ficha' })
  @IsOptional()
  @IsString()
  busqueda?: string;
}
