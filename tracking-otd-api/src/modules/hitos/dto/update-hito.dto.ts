import { PartialType } from '@nestjs/swagger';
import { CreateHitoDto } from './create-hito.dto';

export class UpdateHitoDto extends PartialType(CreateHitoDto) {}
