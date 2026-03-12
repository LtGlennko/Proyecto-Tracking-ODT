import { IsOptional, IsString, IsBoolean, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const PERFILES = ['superadministrador', 'administrador', 'supervisor', 'asesor_comercial'] as const;

export class UpdateUsuarioDto {
  @ApiPropertyOptional({ enum: PERFILES })
  @IsOptional()
  @IsString()
  @IsIn(PERFILES)
  perfil?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
