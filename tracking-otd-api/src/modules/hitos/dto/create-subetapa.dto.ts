import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class CreateSubetapaDto {
  @ApiProperty({ example: 'Emisión Factura' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'COMERCIAL', description: 'COMEX | LOGISTICA | COMERCIAL' })
  @IsString()
  categoria: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  orden: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  activoDefault?: boolean;
}
