import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FuenteVin } from './fuente-vin.entity';
import { FuentesVinService } from './fuentes-vin.service';
import { FuentesVinController } from './fuentes-vin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FuenteVin])],
  controllers: [FuentesVinController],
  providers: [FuentesVinService],
  exports: [FuentesVinService, TypeOrmModule],
})
export class FuentesVinModule {}
