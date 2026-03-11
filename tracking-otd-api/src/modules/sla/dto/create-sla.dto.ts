import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString, Min } from 'class-validator';

export class CreateSlaDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  empresaId?: number;

  @ApiPropertyOptional({ example: 14 })
  @IsOptional()
  @IsInt()
  subetapaId?: number;

  @ApiPropertyOptional({ example: 'Camiones' })
  @IsOptional()
  @IsString()
  lineaNegocio?: string;

  @ApiPropertyOptional({ example: 'Bus' })
  @IsOptional()
  @IsString()
  tipoVehiculo?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasObjetivo?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasTolerancia?: number;
}
