import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateFichaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  clienteId: number;

  @ApiPropertyOptional({ example: 'F-2024-001' })
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  fechaCreacion?: string;
}
