import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsBoolean, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterClienteDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filtrar por empresa' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  empresaId?: number;

  @ApiPropertyOptional({ description: 'Solo clientes VIC' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isVic?: boolean;

  @ApiPropertyOptional({ description: 'Buscar por nombre o RUC' })
  @IsOptional()
  @IsString()
  busqueda?: string;
}
