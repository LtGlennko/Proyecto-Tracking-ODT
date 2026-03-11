import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StagingVin } from './staging-vin.entity';
import { StagingService } from './staging.service';
import { StagingController } from './staging.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StagingVin])],
  controllers: [StagingController],
  providers: [StagingService],
  exports: [StagingService],
})
export class StagingModule {}
