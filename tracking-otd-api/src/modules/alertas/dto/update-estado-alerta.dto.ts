import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class UpdateEstadoAlertaDto {
  @ApiProperty({ enum: ['leida', 'resuelta'] })
  @IsString()
  @IsIn(['leida', 'resuelta'])
  estado: string;
}
