import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateGrupoDto {
  @ApiProperty({ example: 'Post-Almacén' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  ordenGlobal: number;

  @ApiPropertyOptional({ example: 'Secuencia financiera post-ingreso a almacén' })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
