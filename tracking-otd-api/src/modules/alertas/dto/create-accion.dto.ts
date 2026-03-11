import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional } from 'class-validator';

export class CreateAccionDto {
  @ApiProperty({ enum: ['contactar_responsable', 'reprogramar_entrega', 'resolver_alerta'] })
  @IsString()
  @IsIn(['contactar_responsable', 'reprogramar_entrega', 'resolver_alerta'])
  accionTomada: string;

  @ApiPropertyOptional({ example: 'Se contactó al proveedor para re-agendar la entrega' })
  @IsOptional()
  @IsString()
  notas?: string;
}
