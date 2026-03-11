import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt } from 'class-validator';

export class CreateMensajeDto {
  @ApiProperty({ example: 'Se revisó el VIN en patio, pendiente inmatriculación' })
  @IsString()
  @IsNotEmpty()
  contenido: string;

  @ApiPropertyOptional({ example: [1, 2], description: 'IDs de usuarios a mencionar' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  menciones?: number[];
}
