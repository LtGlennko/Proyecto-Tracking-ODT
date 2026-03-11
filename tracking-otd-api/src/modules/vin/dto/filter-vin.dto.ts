import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterVinDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'Camiones' })
  @IsOptional()
  @IsString()
  lineaNegocio?: string;

  @ApiPropertyOptional({ example: 'Bus' })
  @IsOptional()
  @IsString()
  tipoVehiculo?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  empresaId?: number;

  @ApiPropertyOptional({ enum: ['A TIEMPO', 'DEMORADO', 'FINALIZADO'] })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({ description: 'Buscar por VIN, modelo, cliente o ficha' })
  @IsOptional()
  @IsString()
  busqueda?: string;
}
