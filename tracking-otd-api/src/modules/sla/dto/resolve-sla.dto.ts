import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString } from 'class-validator';

export class ResolveSlaDto {
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
}
