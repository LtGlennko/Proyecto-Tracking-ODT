import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VinHitoTracking } from './vin-hito-tracking.entity';
import { VinSubetapaTracking } from './vin-subetapa-tracking.entity';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VinHitoTracking, VinSubetapaTracking])],
  controllers: [TrackingController],
  providers: [TrackingService],
  exports: [TrackingService, TypeOrmModule],
})
export class TrackingModule {}
