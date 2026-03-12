import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class CreateHitoDto {
  @ApiProperty({ example: 'Facturación', description: 'Nombre del hito' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'financiero', description: 'Carril: financiero | operativo' })
  @IsString()
  carril: string;

  @ApiProperty({ example: 3, description: 'Orden dentro del grupo paralelo' })
  @IsInt()
  orden: number;

  @ApiProperty({ example: 2, description: 'ID del grupo paralelo al que pertenece' })
  @IsInt()
  grupoParaleloId: number;

  @ApiPropertyOptional({ example: 'Bus', description: 'Tipo de vehículo (null = aplica a todos)' })
  @IsOptional()
  @IsString()
  tipoVehiculo?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
