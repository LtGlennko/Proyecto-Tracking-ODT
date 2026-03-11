import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString } from 'class-validator';

export class UpdateTrackingDto {
  @ApiPropertyOptional({ example: '2024-03-15' })
  @IsOptional()
  @IsDateString()
  fechaPlan?: string;

  @ApiPropertyOptional({ example: '2024-03-20' })
  @IsOptional()
  @IsDateString()
  fechaReal?: string;

  @ApiPropertyOptional({ enum: ['A TIEMPO', 'DEMORADO', 'FINALIZADO', 'ACTIVO'] })
  @IsOptional()
  @IsString()
  estado?: string;
}
