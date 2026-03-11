import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateEmpresaDto {
  @ApiProperty({ example: 'Divemotor', description: 'Nombre de la empresa' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @ApiProperty({ example: 'DIV', description: 'Código único de la empresa' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  codigo: string;
}
