import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';

export class CreateSlaDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  empresaId?: number;

  @ApiPropertyOptional({ example: 14 })
  @IsOptional()
  @IsInt()
  subetapaId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del tipo de vehículo' })
  @IsOptional()
  @IsInt()
  tipoVehiculoId?: number;

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
