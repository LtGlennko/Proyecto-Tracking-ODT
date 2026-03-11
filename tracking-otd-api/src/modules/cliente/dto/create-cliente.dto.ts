import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateClienteDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  empresaId: number;

  @ApiProperty({ example: 'Toyota del Perú S.A.' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({ example: '20100128218' })
  @IsOptional()
  @IsString()
  ruc?: string;

  @ApiPropertyOptional({ example: false, description: 'Es cliente VIC (Very Important Customer)' })
  @IsOptional()
  @IsBoolean()
  isVic?: boolean;
}
