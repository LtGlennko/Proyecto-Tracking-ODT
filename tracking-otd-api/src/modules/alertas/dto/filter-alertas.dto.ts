import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterAlertasDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['critico', 'advertencia'] })
  @IsOptional()
  @IsString()
  nivel?: string;

  @ApiPropertyOptional({ enum: ['activa', 'leida', 'resuelta'] })
  @IsOptional()
  @IsString()
  estadoAlerta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  empresaId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vinId?: string;
}
