import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, IsOptional, IsInt, IsDateString } from 'class-validator';

export class CreateVinDto {
  @ApiProperty({ example: 'WDB9630321L123456', description: 'VIN físico (17 caracteres)' })
  @IsString()
  @IsNotEmpty()
  @Length(17, 17)
  id: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  fichaId?: number;

  @ApiPropertyOptional({ example: 'Mercedes-Benz' })
  @IsOptional()
  @IsString()
  marca?: string;

  @ApiPropertyOptional({ example: 'Actros 2651' })
  @IsOptional()
  @IsString()
  modelo?: string;

  @ApiPropertyOptional({ example: 'Camiones' })
  @IsOptional()
  @IsString()
  lineaNegocio?: string;

  @ApiPropertyOptional({ example: 'Bus' })
  @IsOptional()
  @IsString()
  tipoVehiculo?: string;
}
