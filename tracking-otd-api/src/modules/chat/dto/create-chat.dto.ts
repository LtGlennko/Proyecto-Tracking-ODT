import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional, IsInt, ValidateIf } from 'class-validator';

export class CreateChatDto {
  @ApiProperty({ enum: ['ficha', 'vin'] })
  @IsString()
  @IsIn(['ficha', 'vin'])
  tipo: string;

  @ApiPropertyOptional({ example: 1 })
  @ValidateIf(o => o.tipo === 'ficha')
  @IsInt()
  fichaId?: number;

  @ApiPropertyOptional({ example: 'WDB9630321L123456' })
  @ValidateIf(o => o.tipo === 'vin')
  @IsString()
  vinId?: string;
}
