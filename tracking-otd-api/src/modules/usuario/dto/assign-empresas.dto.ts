import { IsArray, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignEmpresasDto {
  @ApiProperty({ type: [Number], description: 'Array de IDs de empresas a asignar' })
  @IsArray()
  @IsInt({ each: true })
  empresaIds: number[];
}
