import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vin } from './vin.entity';
import { VinService } from './vin.service';
import { VinController } from './vin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Vin])],
  controllers: [VinController],
  providers: [VinService],
  exports: [VinService],
})
export class VinModule {}
