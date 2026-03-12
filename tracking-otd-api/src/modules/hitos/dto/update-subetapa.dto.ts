import { PartialType } from '@nestjs/swagger';
import { CreateSubetapaDto } from './create-subetapa.dto';

export class UpdateSubetapaDto extends PartialType(CreateSubetapaDto) {}
