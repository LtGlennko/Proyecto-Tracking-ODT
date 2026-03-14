import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

export class UpdateTrackingDto {
  @ApiPropertyOptional({ example: '2024-03-15' })
  @IsOptional()
  @IsDateString()
  fechaPlan?: string;

  @ApiPropertyOptional({ example: '2024-03-20' })
  @IsOptional()
  @IsDateString()
  fechaReal?: string;

}
