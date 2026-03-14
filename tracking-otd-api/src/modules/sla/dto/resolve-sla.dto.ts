import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt } from 'class-validator';

export class ResolveSlaDto {
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
}
