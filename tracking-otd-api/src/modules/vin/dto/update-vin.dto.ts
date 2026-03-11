import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateVinDto } from './create-vin.dto';
export class UpdateVinDto extends PartialType(OmitType(CreateVinDto, ['id'] as const)) {}
